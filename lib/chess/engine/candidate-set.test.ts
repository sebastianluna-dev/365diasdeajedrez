import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCandidate } from "@/lib/chess/engine-protocol";
import { finalCandidates, recordCandidate, scoreOf, type CandidateLog } from "./candidate-set";

/** Logs every line of a raw engine transcript, as the client does during a search. */
function logOf(lines: string[]): CandidateLog {
  const log: CandidateLog = new Map();
  for (const line of lines) {
    const candidate = parseCandidate(line);
    if (candidate) recordCandidate(log, candidate);
  }
  return log;
}

describe("scoreOf", () => {
  it("puts a mate in one above a mate in five, both above any material, and a mate against below all", () => {
    const mateIn1 = scoreOf({ cp: null, mateIn: 1 });
    const mateIn5 = scoreOf({ cp: null, mateIn: 5 });
    const mated = scoreOf({ cp: null, mateIn: -2 });
    expect(mateIn1).toBeGreaterThan(mateIn5);
    expect(mateIn5).toBeGreaterThan(scoreOf({ cp: 900, mateIn: null }));
    expect(mated).toBeLessThan(scoreOf({ cp: -900, mateIn: null }));
  });
});

describe("finalCandidates", () => {
  it("takes the real search of probe-d3 at its last complete depth: eight unique moves", () => {
    // MultiPV 8, `go nodes 10000` on the middlegame of the probes (research/bot-strength.md).
    // At depth 6 the eighth line is still an upperbound, so depth 5 is the last complete one.
    const lines = readFileSync(new URL("./__fixtures__/probe-d3.txt", import.meta.url), "utf8").split("\n");
    const candidates = finalCandidates(logOf(lines));

    expect(candidates).toHaveLength(8);
    expect(new Set(candidates.map((candidate) => candidate.uci)).size).toBe(8);
    expect(new Set(candidates.map((candidate) => candidate.depth))).toEqual(new Set([5]));
    for (let index = 1; index < candidates.length; index++) {
      expect(scoreOf(candidates[index - 1]!)).toBeGreaterThanOrEqual(scoreOf(candidates[index]!));
    }
  });

  it("drops the first line's iteration when it is one ahead of the rest", () => {
    const candidates = finalCandidates(
      logOf([
        "info depth 4 multipv 1 score cp 20 pv e2e4",
        "info depth 4 multipv 2 score cp 10 pv d2d4",
        "info depth 5 multipv 1 score cp 18 pv g1f3",
      ]),
    );
    expect(candidates.map((candidate) => `${candidate.uci}@${candidate.depth}`)).toEqual(["e2e4@4", "d2d4@4"]);
  });

  it("keeps one line per move, the better one", () => {
    const candidates = finalCandidates(
      logOf(["info depth 3 multipv 1 score cp 20 pv e2e4", "info depth 3 multipv 2 score cp 5 pv e2e4"]),
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.cp).toBe(20);
  });

  it("is empty when the engine reported nothing", () => {
    expect(finalCandidates(new Map())).toEqual([]);
  });
});
