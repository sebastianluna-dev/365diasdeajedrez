import { describe, expect, it } from "vitest";
import type { Candidate } from "@/lib/chess/engine-protocol";
import { chooseBotMove } from "./choose-bot-move";
import { mulberry32 } from "./rng";

const line = (uci: string, cp: number | null, mateIn: number | null = null, multipv = 1): Candidate => ({
  multipv,
  depth: 5,
  uci,
  cp,
  mateIn,
  bound: null,
});

const STRENGTH = { multiPv: 8, temperature: 75, blunderRate: 0, blunder: "legal" as const };
const LEGAL = ["a7a6", "b7b6", "e7e5", "d7d5"];

/** How often each move is picked over many seeded draws. */
function tally(candidates: Candidate[], strength = STRENGTH, draws = 2000): Map<string, number> {
  const rng = mulberry32(1);
  const counts = new Map<string, number>();
  for (let index = 0; index < draws; index++) {
    const move = chooseBotMove(candidates, strength, LEGAL, rng)!;
    counts.set(move.uci, (counts.get(move.uci) ?? 0) + 1);
  }
  return counts;
}

describe("chooseBotMove", () => {
  it("is the same move for the same seed", () => {
    const candidates = [line("e7e5", 20), line("d7d5", 10, null, 2), line("b7b6", -30, null, 3)];
    expect(chooseBotMove(candidates, STRENGTH, LEGAL, mulberry32(9))).toEqual(
      chooseBotMove(candidates, STRENGTH, LEGAL, mulberry32(9)),
    );
  });

  it("samples well with Black to move: +80 for the bot is picked, −300 never", () => {
    // Scores are the mover's: the bot plays Black here and its best line is +80 for it.
    const counts = tally([line("e7e5", 80), line("d7d5", 40, null, 2), line("a7a6", -300, null, 3)]);
    expect(counts.get("e7e5")!).toBeGreaterThan(counts.get("d7d5") ?? 0);
    expect(counts.get("a7a6") ?? 0).toBe(0);
  });

  it("picks a line a few centipawns worse almost as often as the best", () => {
    const counts = tally([line("e7e5", 30), line("d7d5", 25, null, 2)]);
    expect(counts.get("d7d5")!).toBeGreaterThan(800);
  });

  it("plays the shortest mate of its own, and never lets one go", () => {
    const candidates = [line("d8h4", null, 5), line("d8d1", null, 1, 2), line("e7e5", 900, null, 3)];
    const counts = tally(candidates);
    expect(counts.get("d8d1")).toBe(2000);
  });

  it("never walks into a mate unless it blunders", () => {
    const candidates = [line("e7e5", -50), line("g7g5", null, -2, 2)];
    expect(tally(candidates).get("g7g5") ?? 0).toBe(0);
  });

  it("blunders at its rate: a random legal move for the weakest, the worst candidate above them", () => {
    const candidates = [line("e7e5", 50), line("d7d5", 45, null, 2), line("b7b6", -200, null, 3)];
    const always = { ...STRENGTH, blunderRate: 1 };
    const legal = chooseBotMove(candidates, always, LEGAL, mulberry32(3))!;
    expect(legal.kind).toBe("blunder");
    expect(LEGAL).toContain(legal.uci);
    expect(chooseBotMove(candidates, { ...always, blunder: "worst" }, LEGAL, mulberry32(3))).toEqual({
      uci: "b7b6",
      kind: "blunder",
    });
  });

  it("keeps to the bot's number of lines", () => {
    const candidates = [line("e7e5", 30), line("d7d5", 29, null, 2), line("b7b6", 28, null, 3)];
    expect(tally(candidates, { ...STRENGTH, multiPv: 2 }).get("b7b6") ?? 0).toBe(0);
  });

  it("plays a legal move when the engine gave no line, and nothing when there is none", () => {
    expect(LEGAL).toContain(chooseBotMove([], STRENGTH, LEGAL, mulberry32(5))!.uci);
    expect(chooseBotMove([], STRENGTH, [], mulberry32(5))).toBeNull();
  });
});
