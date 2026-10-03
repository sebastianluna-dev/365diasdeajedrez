import { describe, expect, it } from "vitest";
import { syncChapterDuration, type ChapterDurationWriter } from "./chapter-duration.service";

interface FindArgs {
  where: { chapterId: string };
}
interface UpdateArgs {
  where: { id: string };
  data: { estimatedDuration: number | null };
}

/** The SQL of a tagged template, with its values where they go, to read what was asked. */
function sqlOf(strings: TemplateStringsArray, values: unknown[]): string {
  return strings.reduce(
    (sql, part, index) => sql + part + (index < values.length ? `<${String(values[index])}>` : ""),
    "",
  );
}

/**
 * A chapter's lessons and a writer that records every call, so the test reads
 * what the sync asked of Prisma instead of a database. `missing` is a chapter
 * that is no longer there: `updateMany` matches nothing and does not throw.
 */
function fake(minutes: (number | null)[]) {
  const calls: { askedFor?: string; wrote?: UpdateArgs; sequence: string[] } = { sequence: [] };
  const db: ChapterDurationWriter = {
    async $queryRaw(strings, ...values) {
      calls.sequence.push(sqlOf(strings, values));
      return [];
    },
    lesson: {
      async findMany(args) {
        calls.askedFor = (args as FindArgs).where.chapterId;
        calls.sequence.push("lesson.findMany");
        return minutes.map((estimatedDuration) => ({ estimatedDuration }));
      },
    },
    chapter: {
      async updateMany(args) {
        calls.wrote = args as UpdateArgs;
        calls.sequence.push("chapter.updateMany");
      },
    },
  };
  return { db, calls };
}

/**
 * A database with one chapter and its lessons that behaves as PostgreSQL does
 * under READ COMMITTED, its default and the app's: each transaction sees the
 * committed rows plus its own writes, and a row locked FOR UPDATE makes the
 * next transaction that asks for it wait until the first one commits. Enough
 * to replay two saves of the same chapter that overlap.
 */
function readCommittedDatabase(committedMinutes: Record<string, number | null>, chapterId: string) {
  const committed = { lessons: { ...committedMinutes }, chapterMinutes: null as number | null };
  let lockHeldBy: object | null = null;
  const waiting: (() => void)[] = [];

  function begin() {
    const own: { lessons: Record<string, number | null>; chapterMinutes?: number | null } = { lessons: {} };
    const tx = {} as object;

    const writer: ChapterDurationWriter & { saveLesson(id: string, minutes: number | null): void; commit(): void } = {
      async $queryRaw(strings, ...values) {
        const locksTheChapter = /FOR UPDATE/i.test(strings.join("")) && values.includes(chapterId);
        if (!locksTheChapter) return [];
        while (lockHeldBy && lockHeldBy !== tx) await new Promise<void>((resolve) => waiting.push(resolve));
        lockHeldBy = tx;
        return [{ id: chapterId }];
      },
      lesson: {
        async findMany() {
          return Object.values({ ...committed.lessons, ...own.lessons }).map((estimatedDuration) => ({
            estimatedDuration,
          }));
        },
      },
      chapter: {
        async updateMany(args) {
          own.chapterMinutes = (args as UpdateArgs).data.estimatedDuration;
        },
      },
      saveLesson(id, minutes) {
        own.lessons[id] = minutes;
      },
      commit() {
        Object.assign(committed.lessons, own.lessons);
        if (own.chapterMinutes !== undefined) committed.chapterMinutes = own.chapterMinutes;
        if (lockHeldBy === tx) lockHeldBy = null;
        waiting.splice(0).forEach((wake) => wake());
      },
    };
    return writer;
  }

  return { begin, committed };
}

describe("syncChapterDuration", () => {
  it("guarda en el capítulo lo que suman los minutos de sus lecciones", async () => {
    const { db, calls } = fake([20, 20, 5]);
    await expect(syncChapterDuration(db, "cap-1")).resolves.toBe(45);
    expect(calls.wrote?.data.estimatedDuration).toBe(45);
  });

  it("una lección sin cifra cuenta cero", async () => {
    const { db } = fake([25, null, 15]);
    await expect(syncChapterDuration(db, "cap-1")).resolves.toBe(40);
  });

  it("un capítulo sin lecciones se queda sin cifra, no en cero", async () => {
    const { db, calls } = fake([]);
    await expect(syncChapterDuration(db, "cap-1")).resolves.toBeNull();
    expect(calls.wrote?.data.estimatedDuration).toBeNull();
  });

  it("si ninguna de sus lecciones dice minutos, tampoco los dice él", async () => {
    const { db } = fake([null, null]);
    await expect(syncChapterDuration(db, "cap-1")).resolves.toBeNull();
  });

  it("pregunta sólo por las lecciones de ese capítulo y escribe sólo ese capítulo", async () => {
    const { db, calls } = fake([10]);
    await syncChapterDuration(db, "cap-7");
    expect(calls.askedFor).toBe("cap-7");
    expect(calls.wrote?.where).toEqual({ id: "cap-7" });
  });

  it("bloquea la fila del capítulo antes de leer sus lecciones", async () => {
    const { db, calls } = fake([10]);
    await syncChapterDuration(db, "cap-7");

    expect(calls.sequence).toHaveLength(3);
    const [lock, read, write] = calls.sequence;
    expect(lock).toMatch(/^SELECT .* FROM "Chapter" WHERE "id" = <cap-7> FOR UPDATE$/);
    expect([read, write]).toEqual(["lesson.findMany", "chapter.updateMany"]);
  });

  it("dos lecciones del mismo capítulo guardadas a la vez dejan la suma de las dos", async () => {
    // Before: 10 + 5 = 15. One save takes the first lesson to 20, the other the
    // second one to 15, and they overlap: each writes its lesson before either
    // has committed. Without the lock both summed the other's old figure (25),
    // and the slower one left 25 on the chapter instead of 35.
    const database = readCommittedDatabase({ first: 10, second: 5 }, "cap-1");
    const one = database.begin();
    const other = database.begin();

    one.saveLesson("first", 20);
    other.saveLesson("second", 15);
    const oneSync = syncChapterDuration(one, "cap-1");
    const otherSync = syncChapterDuration(other, "cap-1");

    await expect(oneSync).resolves.toBe(25);
    one.commit();
    await expect(otherSync).resolves.toBe(35);
    other.commit();

    expect(database.committed.chapterMinutes).toBe(35);
  });

  it("un capítulo que ya no está no es un error: no escribe nada y sigue", async () => {
    const db: ChapterDurationWriter = {
      async $queryRaw() {
        return [];
      },
      lesson: {
        async findMany() {
          return [];
        },
      },
      chapter: {
        async updateMany() {
          return { count: 0 };
        },
      },
    };
    await expect(syncChapterDuration(db, "se-borró")).resolves.toBeNull();
  });
});
