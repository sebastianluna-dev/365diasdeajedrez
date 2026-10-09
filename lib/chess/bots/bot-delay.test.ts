import { describe, expect, it } from "vitest";
import type { Candidate } from "@/lib/chess/engine-protocol";
import { thinkDelayMs } from "./bot-delay";
import { mulberry32 } from "./rng";

const line = (uci: string, cp: number, multipv: number): Candidate => ({
  multipv,
  depth: 5,
  uci,
  cp,
  mateIn: null,
  bound: null,
});
const STRENGTH = { delayMs: [1_000, 4_000] as [number, number] };

describe("thinkDelayMs", () => {
  it("stays within the bot's range in the middlegame", () => {
    const rng = mulberry32(2);
    for (let draw = 0; draw < 500; draw++) {
      const wait = thinkDelayMs(STRENGTH, { ply: 30, candidates: [line("e2e4", 20, 1)], rng });
      expect(wait).toBeGreaterThanOrEqual(1_000);
      expect(wait).toBeLessThanOrEqual(4_000);
    }
  });

  it("answers quickly in the opening, an only move and a recapture", () => {
    const rng = mulberry32(4);
    for (const context of [{ ply: 4 }, { ply: 40, forced: true }, { ply: 40, recapture: true }]) {
      const wait = thinkDelayMs(STRENGTH, { candidates: [], rng, ...context });
      expect(wait).toBeGreaterThanOrEqual(300);
      expect(wait).toBeLessThanOrEqual(800);
    }
  });

  it("hesitates longer when several moves are about as good", () => {
    const average = (candidates: Candidate[]) => {
      const rng = mulberry32(6);
      let sum = 0;
      for (let draw = 0; draw < 1000; draw++) sum += thinkDelayMs(STRENGTH, { ply: 30, candidates, rng });
      return sum / 1000;
    };
    const clear = average([line("e2e4", 80, 1), line("d2d4", -20, 2)]);
    const close = average([line("e2e4", 20, 1), line("d2d4", 15, 2), line("g1f3", 10, 3), line("c2c4", 5, 4)]);
    expect(close).toBeGreaterThan(clear + 500);
  });
});
