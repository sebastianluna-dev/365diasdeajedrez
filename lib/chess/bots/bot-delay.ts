import type { Candidate } from "@/lib/chess/engine-protocol";
import { scoreOf } from "@/lib/chess/engine/candidate-set";
import type { BotStrength } from "./bot-strength";

// How long a bot seems to think. Its search takes 1–150 ms on a computer; a
// person never answers that fast, so the wait is a timer on the screen, never
// on the engine (the engine's budget is nodes or depth, never time).
//
// It is computed AFTER the search, because what modulates it only exists then:
// several good moves close together make a person hesitate; an only move, a
// recapture or the first moves of an opening are played almost at once. The
// caller subtracts what the search already took.

/** The plies (both sides) counted as the opening: the bot's first eight moves. */
const OPENING_PLIES = 16;
/** How close, in centipawns, a move must be to the best to count as a real alternative. */
const CLOSE_CENTIPAWNS = 30;
/** The quick answer, in milliseconds: an only move, a recapture, an opening move. */
const QUICK: [number, number] = [300, 800];

export interface ThinkContext {
  /** Plies played before this move. */
  ply: number;
  /** The candidates the engine weighed, best first. */
  candidates: readonly Candidate[];
  /** It is the only legal move. */
  forced?: boolean;
  /** It takes back on the square where the opponent just captured. */
  recapture?: boolean;
  rng: () => number;
}

/** The wait before the bot's move appears, in milliseconds. */
export function thinkDelayMs(strength: Pick<BotStrength, "delayMs">, context: ThinkContext): number {
  if (context.forced || context.recapture || context.ply < OPENING_PLIES) {
    return Math.round(QUICK[0] + context.rng() * (QUICK[1] - QUICK[0]));
  }

  const [min, max] = strength.delayMs;
  const best = context.candidates[0];
  const close = best
    ? context.candidates.slice(1).filter((candidate) => scoreOf(best) - scoreOf(candidate) <= CLOSE_CENTIPAWNS).length
    : 0;
  // More real alternatives push the draw toward the long end.
  const draw = 1 - (1 - context.rng()) / (1 + close);
  return Math.round(min + draw * (max - min));
}
