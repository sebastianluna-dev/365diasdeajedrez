import { describe, expect, it } from "vitest";
import { GAME_DATABASES, IDS } from "./seed-data";
import { collectionKeyOf, resolveCollectionIds, type CollectionKey } from "./seed-rules";

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
