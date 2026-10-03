import { describe, expect, it } from "vitest";
import { buildClasses, GAME_DATABASES, IDS } from "./seed-data";
import {
  collectionKeyOf,
  nextClassAfter,
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
