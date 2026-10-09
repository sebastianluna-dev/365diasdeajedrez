import { describe, expect, it } from "vitest";
import { mulberry32, seedOf } from "./rng";

describe("mulberry32", () => {
  it("draws the same numbers from the same seed, all in [0, 1)", () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    const draws = Array.from({ length: 1000 }, () => a());
    expect(Array.from({ length: 1000 }, () => b())).toEqual(draws);
    for (const draw of draws) {
      expect(draw).toBeGreaterThanOrEqual(0);
      expect(draw).toBeLessThan(1);
    }
  });

  it("spreads its draws: about half below one half", () => {
    const next = mulberry32(42);
    const below = Array.from({ length: 10_000 }, () => next()).filter((draw) => draw < 0.5).length;
    expect(below).toBeGreaterThan(4_800);
    expect(below).toBeLessThan(5_200);
  });
});

describe("seedOf", () => {
  it("is stable for a game and a ply, and differs from ply to ply", () => {
    expect(seedOf("aB3xK9pQ", 12)).toBe(seedOf("aB3xK9pQ", 12));
    expect(seedOf("aB3xK9pQ", 12)).not.toBe(seedOf("aB3xK9pQ", 13));
    expect(seedOf("aB3xK9pQ", 12)).not.toBe(seedOf("aB3xK9pR", 12));
  });
});
