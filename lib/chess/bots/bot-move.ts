import type { BestMoveReply, SearchBudget } from "@/lib/chess/engine/engine-client";
import type { BotStrength } from "./bot-strength";
import { chooseBotMove } from "./choose-bot-move";

// A bot's move from the engine's reply, the same in the browser and in the
// calibration: the weak bots pick among the lines the engine weighed
// (`chooseBotMove`), the strong ones play the engine's own move, which
// `UCI_Elo` has already weakened.

/**
 * What a bot asks the engine for. In the browser the two strongest steps also
 * stop at a ceiling of nodes, so a phone answers within the delay: it can only
 * weaken them, and it never applies under Node nor in the calibration.
 */
export function botSearchOf(strength: BotStrength, inBrowser: boolean): SearchBudget {
  if (strength.regime === "sampled") return strength.search;
  return inBrowser && strength.browserNodeCap !== null
    ? { depth: strength.search.depth, nodes: strength.browserNodeCap }
    : strength.search;
}

/** The bot's move in UCI, or null when the position had none to play. */
export function pickBotMove(
  strength: BotStrength,
  reply: BestMoveReply,
  legalUci: readonly string[],
  rng: () => number,
): string | null {
  if (strength.regime === "sampled") return chooseBotMove(reply.candidates, strength, legalUci, rng)?.uci ?? null;
  return reply.bestMove;
}
