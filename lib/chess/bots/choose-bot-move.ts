import type { Candidate } from "@/lib/chess/engine-protocol";
import { scoreOf } from "@/lib/chess/engine/candidate-set";
import type { SampledStrength } from "./bot-strength";

// How a weak bot (the sampled regime, ≤ 1319) picks its move among the lines
// the engine weighed at full strength.
//
// First the blunder draw: with the bot's rate, a deliberate mistake — a random
// legal move for the weakest, the worst candidate above 1000. Otherwise a
// soft-max over the candidates: the chance of each is exp(−(best − its
// score) / T), so a line a few centipawns worse is picked almost as often as
// the best and one a pawn worse rarely. Three safeguards:
//
// - a mate of its own is always played (the shortest), except by a blunder;
// - a candidate that loses more than 3·T only comes in as a blunder;
// - the randomness is injected (`rng.ts`), seeded by game and ply.
//
// Scores are the mover's (`scoreOf`), so a bot playing Black samples as well as
// one playing White.

export interface ChosenMove {
  uci: string;
  /** `best`: the engine's first line; `sampled`: another good one; `blunder`: a deliberate mistake. */
  kind: "best" | "sampled" | "blunder";
}

/** Picks one of `items` with these weights; `draw` is in [0, 1). */
function weightedPick<T>(items: readonly T[], weights: readonly number[], draw: number): T {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let left = draw * total;
  for (let index = 0; index < items.length; index++) {
    left -= weights[index]!;
    if (left < 0) return items[index]!;
  }
  return items[items.length - 1]!;
}

/**
 * The bot's move. Null only when there is nothing to play: no candidate and
 * no legal move (a finished position, which the caller never asks about).
 */
export function chooseBotMove(
  candidates: readonly Candidate[],
  strength: Pick<SampledStrength, "multiPv" | "temperature" | "blunderRate" | "blunder">,
  legalUci: readonly string[],
  rng: () => number,
): ChosenMove | null {
  const ranked = [...candidates].sort((a, b) => scoreOf(b) - scoreOf(a)).slice(0, strength.multiPv);
  const best = ranked[0];
  if (!best) {
    if (legalUci.length === 0) return null;
    return { uci: legalUci[Math.floor(rng() * legalUci.length)]!, kind: "blunder" };
  }

  if (rng() < strength.blunderRate) {
    if (strength.blunder === "legal" && legalUci.length > 0) {
      return { uci: legalUci[Math.floor(rng() * legalUci.length)]!, kind: "blunder" };
    }
    return { uci: ranked[ranked.length - 1]!.uci, kind: ranked.length > 1 ? "blunder" : "best" };
  }

  // A mate of its own is never let go.
  if (best.mateIn !== null && best.mateIn > 0) return { uci: best.uci, kind: "best" };

  const bestScore = scoreOf(best);
  const pool = ranked.filter((candidate) => bestScore - scoreOf(candidate) <= 3 * strength.temperature);
  const weights = pool.map((candidate) => Math.exp(-(bestScore - scoreOf(candidate)) / strength.temperature));
  const chosen = weightedPick(pool, weights, rng());
  return { uci: chosen.uci, kind: chosen === best ? "best" : "sampled" };
}
