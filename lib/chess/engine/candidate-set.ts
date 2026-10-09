import type { Candidate } from "@/lib/chess/engine-protocol";

// The moves the engine weighed, cleaned up for choosing between them.
//
// Pure module. A search cut by `go nodes` stops in the middle of an iteration:
// the first lines already reached depth d+1, the last ones are still at d, and
// one of the late ones may even repeat a move another index already showed at
// the deeper depth (`probe-d3.txt`: `a1c1` at depth 6 in line 7 and again at
// depth 5 in line 8). Mixing depths compares figures that do not measure the
// same thing, so the candidates are taken from ONE iteration: the deepest one
// every line finished.

/**
 * A candidate's worth to the side that moves, on one scale: centipawns, and
 * a mate as ±100 000 minus two per move, so a mate in one beats a mate in five
 * and a mate against comes below every other line.
 */
export function scoreOf(candidate: Pick<Candidate, "cp" | "mateIn">): number {
  if (candidate.mateIn !== null) {
    return Math.sign(candidate.mateIn) * (100_000 - 2 * Math.abs(candidate.mateIn));
  }
  return candidate.cp ?? 0;
}

/** What a search reported, by line and by depth: the last line WITHOUT a bound at each. */
export type CandidateLog = Map<number, Map<number, Candidate>>;

/** Notes one parsed line. A line with a bound is a figure in progress and is not kept. */
export function recordCandidate(log: CandidateLog, candidate: Candidate): void {
  if (candidate.bound !== null) return;
  let byDepth = log.get(candidate.multipv);
  if (!byDepth) {
    byDepth = new Map();
    log.set(candidate.multipv, byDepth);
  }
  byDepth.set(candidate.depth, candidate);
}

/**
 * The candidates of the last complete iteration, best first, one per move.
 *
 * The iteration is the deepest depth at which as many lines reported as the
 * widest depth did (fewer legal moves than `MultiPV` simply makes every depth
 * narrower). When the first line is one iteration ahead of the rest, that is
 * the one before.
 */
export function finalCandidates(log: CandidateLog): Candidate[] {
  const countByDepth = new Map<number, number>();
  for (const byDepth of log.values()) {
    for (const depth of byDepth.keys()) countByDepth.set(depth, (countByDepth.get(depth) ?? 0) + 1);
  }
  if (countByDepth.size === 0) return [];

  const width = Math.max(...countByDepth.values());
  const complete = Math.max(...[...countByDepth].filter(([, count]) => count === width).map(([depth]) => depth));

  const byMove = new Map<string, Candidate>();
  for (const byDepth of log.values()) {
    const line = byDepth.get(complete);
    if (!line) continue;
    const known = byMove.get(line.uci);
    if (!known || scoreOf(line) > scoreOf(known)) byMove.set(line.uci, line);
  }
  return [...byMove.values()].sort((a, b) => scoreOf(b) - scoreOf(a) || a.multipv - b.multipv);
}
