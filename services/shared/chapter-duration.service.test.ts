import { describe, expect, it } from "vitest";
import { syncChapterDuration, type ChapterDurationWriter } from "./chapter-duration.service";

interface FindArgs {
  where: { chapterId: string };
}
interface UpdateArgs {
  where: { id: string };
  data: { estimatedDuration: number | null };
}

/**
 * A chapter's lessons and a writer that records every call, so the test reads
 * what the sync asked of Prisma instead of a database. `missing` is a chapter
 * that is no longer there: `updateMany` matches nothing and does not throw.
 */
function fake(minutes: (number | null)[]) {
  const calls: { askedFor?: string; wrote?: UpdateArgs } = {};
  const db: ChapterDurationWriter = {
    lesson: {
      async findMany(args) {
        calls.askedFor = (args as FindArgs).where.chapterId;
        return minutes.map((estimatedDuration) => ({ estimatedDuration }));
      },
    },
    chapter: {
      async updateMany(args) {
        calls.wrote = args as UpdateArgs;
      },
    },
  };
  return { db, calls };
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

  it("un capítulo que ya no está no es un error: no escribe nada y sigue", async () => {
    const db: ChapterDurationWriter = {
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
