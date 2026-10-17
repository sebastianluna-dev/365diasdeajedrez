import { describe, expect, it } from "vitest";
import { buildStormDeck, STORM_DECK_SHAPE } from "./storm-deck";

const LIBRARY = [
  { id: "a", difficulty: 800 },
  { id: "b", difficulty: 850 },
  { id: "c", difficulty: 900 },
  { id: "d", difficulty: 1200 },
  { id: "e", difficulty: 1200 },
  { id: "f", difficulty: 2000 },
];

describe("buildStormDeck", () => {
  it("climbs: each pick is the unused exercise closest to a target that rises by the step, and nothing repeats", () => {
    const deck = buildStormDeck(LIBRARY, { start: 800, step: 100, size: 10 }, () => 0);
    expect(deck).toEqual(["a", "c", "b", "d", "e", "f"]);
    expect(new Set(deck).size).toBe(deck.length);
  });

  it("stops at the size asked, or at the library's end", () => {
    expect(buildStormDeck(LIBRARY, { start: 800, step: 35, size: 3 }, () => 0)).toHaveLength(3);
    expect(buildStormDeck(LIBRARY, STORM_DECK_SHAPE, () => 0)).toHaveLength(LIBRARY.length);
    expect(buildStormDeck([], STORM_DECK_SHAPE, () => 0)).toEqual([]);
  });

  it("breaks a tie with the random number, so two runs over the same library can differ", () => {
    const first = buildStormDeck(LIBRARY, { start: 1200, step: 1000, size: 1 }, () => 0);
    const second = buildStormDeck(LIBRARY, { start: 1200, step: 1000, size: 1 }, () => 0.99);
    expect(first).toEqual(["d"]);
    expect(second).toEqual(["e"]);
  });
});
