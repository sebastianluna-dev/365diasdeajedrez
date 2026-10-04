import { describe, expect, it } from "vitest";
import type { ReorderRow } from "../services/shared/reorder";
import { buildClasses, CLASS_BLOCKS, COURSES, GAME_DATABASES, IDS } from "./seed-data";
import {
  collectionKeyOf,
  nextClassAfter,
  planSeededOrders,
  resolveCollectionIds,
  seedReferenceDate,
  type CollectionKey,
} from "./seed-rules";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

describe("seedReferenceDate", () => {
  it("is today at 18:00 UTC, whatever the time of the run", () => {
    expect(seedReferenceDate(undefined, new Date("2026-10-02T06:15:00Z"))).toEqual(new Date("2026-10-02T18:00:00Z"));
    expect(seedReferenceDate(undefined, new Date("2026-10-02T23:59:59Z"))).toEqual(new Date("2026-10-02T18:00:00Z"));
  });

  it("gives two runs on the same day the same instant, so a second seed rewrites nothing", () => {
    const morning = seedReferenceDate(undefined, new Date("2026-10-02T00:00:01Z"));
    const night = seedReferenceDate(undefined, new Date("2026-10-02T22:30:00Z"));
    expect(morning.getTime()).toBe(night.getTime());
  });

  it("follows the calendar: a run the next day hangs everything one day later", () => {
    const today = seedReferenceDate(undefined, new Date("2026-10-02T12:00:00Z"));
    const tomorrow = seedReferenceDate(undefined, new Date("2026-10-03T12:00:00Z"));
    expect(tomorrow.getTime() - today.getTime()).toBe(DAY_MS);
  });

  it("takes SEED_NOW as it is when it is set, to reproduce a database or anchor a demo on its day", () => {
    expect(seedReferenceDate("2026-09-01T18:00:00Z", new Date("2026-10-02T12:00:00Z"))).toEqual(
      new Date("2026-09-01T18:00:00Z"),
    );
  });

  it("refuses a SEED_NOW that is not a date instead of writing Invalid Date everywhere", () => {
    expect(() => seedReferenceDate("next friday", new Date())).toThrow(/SEED_NOW/);
  });

  it("does not touch the clock it is given", () => {
    const clock = new Date("2026-10-02T06:15:00Z");
    seedReferenceDate(undefined, clock);
    expect(clock).toEqual(new Date("2026-10-02T06:15:00Z"));
  });
});

describe("nextClassAfter", () => {
  const now = new Date("2026-10-02T18:00:00Z");

  it("is the seeded class still ahead: three days after the reference instant", () => {
    expect(nextClassAfter(buildClasses(now), now)).toEqual(new Date("2026-10-05T18:00:00Z"));
  });

  it("is the earliest of the ones ahead, whatever their order", () => {
    const classes = [
      { scheduledAt: new Date("2026-10-20T18:00:00Z") },
      { scheduledAt: new Date("2026-09-25T18:00:00Z") },
      { scheduledAt: new Date("2026-10-09T18:00:00Z") },
    ];
    expect(nextClassAfter(classes, now)).toEqual(new Date("2026-10-09T18:00:00Z"));
  });

  it("is null once every seeded class is behind: weeks after the seed, the demo has no next class", () => {
    const threeWeeksLater = new Date(now.getTime() + 21 * DAY_MS);
    expect(nextClassAfter(buildClasses(now), threeWeeksLater)).toBeNull();
  });
});

describe("collectionKeyOf", () => {
  const collection = (id: string) => {
    const found = GAME_DATABASES.find((database) => database.id === id);
    if (!found) throw new Error(`No seeded collection ${id}`);
    return found;
  };

  it("finds a chapter's collection by its chapter, which is unique, and not by the seed's id", () => {
    expect(collectionKeyOf(collection(IDS.dbSicilianModels))).toEqual({ chapterId: IDS.chSicilianBasics });
  });

  it("finds a user's default study by its owner, which can have only one", () => {
    expect(collectionKeyOf(collection(IDS.dbMyGames))).toEqual({ userId: IDS.demoUser, isDefault: true });
    expect(collectionKeyOf(collection(IDS.dbTeacherMyGames))).toEqual({ userId: IDS.teacherUser, isDefault: true });
  });

  it("has no other key for any other collection: only the seed creates those, under its own id", () => {
    expect(collectionKeyOf(collection(IDS.dbKingAttacks))).toBeNull();
    expect(collectionKeyOf(collection(IDS.dbTeacherPack))).toBeNull();
  });
});

describe("resolveCollectionIds", () => {
  /** What the database already holds, by natural key, and every lookup the seed made. */
  function existing(rows: { key: CollectionKey; id: string }[]) {
    const lookups: CollectionKey[] = [];
    const find = async (key: CollectionKey) => {
      lookups.push(key);
      return rows.find((row) => JSON.stringify(row.key) === JSON.stringify(key)) ?? null;
    };
    return { find, lookups };
  }

  it("on an empty database, every collection keeps the seed's id", async () => {
    const { find } = existing([]);
    const ids = await resolveCollectionIds(GAME_DATABASES, find);
    for (const database of GAME_DATABASES) expect(ids.get(database.id)).toBe(database.id);
  });

  it("adopts the chapter collection the app created under another id, instead of inserting a second one", async () => {
    // The case of 2026-09-27: `importChapterGames` had created the Sicilian
    // chapter's collection as `g0kPl7nN`, and inserting `demoSici` broke
    // `GameDatabase_chapterId_key` halfway through the seed.
    const { find } = existing([{ key: { chapterId: IDS.chSicilianBasics }, id: "g0kPl7nN" }]);
    const ids = await resolveCollectionIds(GAME_DATABASES, find);
    expect(ids.get(IDS.dbSicilianModels)).toBe("g0kPl7nN");
  });

  it("adopts the default study the account was born with", async () => {
    const { find } = existing([{ key: { userId: IDS.demoUser, isDefault: true }, id: "Nbcl17WX" }]);
    const ids = await resolveCollectionIds(GAME_DATABASES, find);
    expect(ids.get(IDS.dbMyGames)).toBe("Nbcl17WX");
    expect(ids.get(IDS.dbTeacherMyGames)).toBe(IDS.dbTeacherMyGames);
  });

  it("gives a second seed the ids the first one left, so it lands on the same rows", async () => {
    const { find } = existing([
      { key: { chapterId: IDS.chSicilianBasics }, id: IDS.dbSicilianModels },
      { key: { userId: IDS.demoUser, isDefault: true }, id: IDS.dbMyGames },
    ]);
    const first = await resolveCollectionIds(GAME_DATABASES, find);
    const second = await resolveCollectionIds(GAME_DATABASES, find);
    expect(second).toEqual(first);
  });

  it("only looks up the collections that have a natural key", async () => {
    const { find, lookups } = existing([]);
    await resolveCollectionIds(GAME_DATABASES, find);
    expect(lookups).toEqual(GAME_DATABASES.map(collectionKeyOf).filter((key) => key !== null));
  });
});

describe("GAME_DATABASES", () => {
  it("never gives two collections the same natural key, which the database would refuse", () => {
    // It is also what lets the seed look every key up before writing any
    // collection: none of its own writes can create a row another lookup of
    // the same run should have found.
    const keys = GAME_DATABASES.map(collectionKeyOf).flatMap((key) => (key ? [JSON.stringify(key)] : []));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("planSeededOrders", () => {
  /**
   * What `@@unique([parent, order])` does to the seed, one write at a time:
   * the moves the plan returns, then the seed's upserts in the order it makes
   * them, each one by id with the order the data gives it. The first write
   * that finds its order held by another row throws, as the index would with
   * P2002; what is left is every row's order at the end.
   */
  function seed(current: ReorderRow[], seeded: readonly ReorderRow[], moves = planSeededOrders(current, seeded)) {
    const state = new Map(current.map((row) => [row.id, row.order]));
    const write = (id: string, order: number) => {
      for (const [other, held] of state) {
        if (other !== id && held === order) throw new Error(`P2002: ${id} → ${order}, which ${other} holds`);
      }
      state.set(id, order);
    };
    for (const move of moves) write(move.id, move.order);
    for (const row of seeded) write(row.id, row.order);
    return state;
  }

  /** The rows' ids in the order they end up in. */
  const idsInOrder = (state: Map<string, number>) =>
    [...state].sort(([, left], [, right]) => left - right).map(([id]) => id);

  const rows = (...pairs: [id: string, order: number][]): ReorderRow[] => pairs.map(([id, order]) => ({ id, order }));

  /** Every list the seed writes with an order under a unique index, as the data has it. */
  const seededLists = [
    ...COURSES.map((course) => ({ parent: `course ${course.id}`, children: course.chapters })),
    ...COURSES.flatMap((course) =>
      course.chapters.map((chapter) => ({ parent: `chapter ${chapter.id}`, children: chapter.lessons })),
    ),
    ...COURSES.flatMap((course) =>
      course.chapters.flatMap((chapter) =>
        chapter.lessons.map((lesson) => ({ parent: `lesson ${lesson.id}`, children: lesson.exercises })),
      ),
    ),
    ...[...new Set(CLASS_BLOCKS.map((block) => block.classId))].map((classId) => ({
      parent: `class ${classId}`,
      children: CLASS_BLOCKS.filter((block) => block.classId === classId),
    })),
  ];

  it("puts back a course whose chapters the panel reordered, where the seed used to stop with P2002", () => {
    // The panel dragged the first chapter to the end (`planFullReorder`).
    const panel = rows(["ch-1", 3], ["ch-2", 1], ["ch-3", 2]);
    const seeded = rows(["ch-1", 1], ["ch-2", 2], ["ch-3", 3]);

    // Without the moves, upserting ch-1 at 1 finds ch-2 there: the seed's P2002.
    expect(() => seed(panel, seeded, [])).toThrow(/P2002/);
    expect(idsInOrder(seed(panel, seeded))).toEqual(["ch-1", "ch-2", "ch-3"]);
  });

  it("puts back every list of the seed data after the panel reversed it", () => {
    for (const { parent, children } of seededLists.filter((list) => list.children.length > 1)) {
      const orders = children.map((child) => child.order).reverse();
      const reversed = children.map((child, index) => ({ id: child.id, order: orders[index] ?? child.order }));

      expect(() => seed(reversed, children, []), parent).toThrow(/P2002/);
      const state = seed(reversed, children);
      for (const child of children) expect(state.get(child.id), `${parent}: ${child.id}`).toBe(child.order);
    }
  });

  it("brings back a row the panel deleted, after the panel closed the gap it left", () => {
    // A draft course: the staff deleted its first chapter and `planDenseRenumber`
    // moved the other two up; the seed creates the first one again.
    const panel = rows(["ch-2", 1], ["ch-3", 2]);
    const seeded = rows(["ch-1", 1], ["ch-2", 2], ["ch-3", 3]);

    expect(() => seed(panel, seeded, [])).toThrow(/P2002/);
    expect(idsInOrder(seed(panel, seeded))).toEqual(["ch-1", "ch-2", "ch-3"]);
  });

  it("leaves where it is a row the seed does not know that stands in nobody's way", () => {
    // The panel added a lesson at the end of a seeded chapter. In a seeded
    // course the seed has deleted it before planning (it replaces the syllabus
    // it describes, as it always did), but the plan does not count on that:
    // whatever the parent holds and the seed does not own is kept.
    const panel = rows(["ls-1", 1], ["ls-2", 2], ["ls-3", 3], ["panel", 4]);
    const seeded = rows(["ls-1", 1], ["ls-2", 2], ["ls-3", 3]);

    expect(planSeededOrders(panel, seeded)).toEqual([]);
    expect(idsInOrder(seed(panel, seeded))).toEqual(["ls-1", "ls-2", "ls-3", "panel"]);
  });

  it("moves a row the seed does not know out of the way, after the seeded ones, instead of stopping on it", () => {
    // The same lesson, dragged by the staff to the top of the chapter: it holds
    // the order the first seeded lesson comes back to.
    const panel = rows(["panel", 1], ["ls-1", 2], ["ls-2", 3], ["ls-3", 4]);
    const seeded = rows(["ls-1", 1], ["ls-2", 2], ["ls-3", 3]);

    expect(() => seed(panel, seeded, [])).toThrow(/P2002/);
    const state = seed(panel, seeded);
    expect(idsInOrder(state)).toEqual(["ls-1", "ls-2", "ls-3", "panel"]);
    // Kept, not deleted: only its order changed.
    expect(state.get("panel")).toBe(4);
  });

  it("keeps the rows the seed does not know in their order among themselves when one has to move", () => {
    // Two exercises made by hand in the panel, after the two seeded ones; the
    // data then gains a third exercise, at the order the first hand-made one holds.
    const panel = rows(["ex-1", 1], ["ex-2", 2], ["hand-a", 3], ["hand-b", 4]);
    const seeded = rows(["ex-1", 1], ["ex-2", 2], ["ex-3", 3]);

    expect(idsInOrder(seed(panel, seeded))).toEqual(["ex-1", "ex-2", "ex-3", "hand-a", "hand-b"]);
  });

  it("never moves the derived exercise, which opens the list at order 0", () => {
    // `syncLessonTrainingExercise` writes it at 0, and at 0 again on every
    // save of the lesson: moving it would make that save the one to clash.
    const panel = rows(["derived", 0], ["ex-1", 2], ["ex-2", 1]);
    const seeded = rows(["ex-1", 1], ["ex-2", 2]);

    expect(planSeededOrders(panel, seeded).map((move) => move.id)).not.toContain("derived");
    expect(seed(panel, seeded).get("derived")).toBe(0);
  });

  it("goes through temporaries of their own, below every real order, as the panel does", () => {
    const panel = rows(["ch-1", 3], ["ch-2", 1], ["ch-3", 2]);
    const moves = planSeededOrders(panel, rows(["ch-1", 1], ["ch-2", 2], ["ch-3", 3]));
    const temporaries = moves.slice(0, 3).map((move) => move.order);
    expect(temporaries.every((order) => order < 0)).toBe(true);
    expect(new Set(temporaries).size).toBe(3);
  });

  it("gives a second seed nothing to move", () => {
    const panel = rows(["derived", 0], ["ch-2", 1], ["hand", 2], ["ch-1", 3]);
    const seeded = rows(["ch-1", 1], ["ch-2", 2]);
    const afterFirst = [...seed(panel, seeded)].map(([id, order]) => ({ id, order }));

    expect(planSeededOrders(afterFirst, seeded)).toEqual([]);
    for (const { children } of seededLists) expect(planSeededOrders(children, children)).toEqual([]);
  });

  it("never touches a parent the seed writes nothing into", () => {
    expect(planSeededOrders(rows(["hand-a", 1], ["hand-b", 2]), [])).toEqual([]);
  });

  it("refuses data that gives two rows of one parent the same order, which the index would refuse halfway", () => {
    expect(() => planSeededOrders([], rows(["ls-1", 1], ["ls-2", 1]))).toThrow(/orden 1/);
  });

  it("finds every list of the seed data valid", () => {
    for (const { parent, children } of seededLists) {
      expect(() => planSeededOrders([], children), parent).not.toThrow();
    }
  });
});
