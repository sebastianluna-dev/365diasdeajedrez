import type { LiveGameState } from "./live-game-machine";

/**
 * What the game viewer needs to know of a live game, in its own words:
 *
 * - `your-turn`: the board is movable for the person.
 * - `thinking`: the bot is searching (its portrait's ring spins); the board
 *   waits. Also while the engine loads, and while the person's move is saved,
 *   since the bot is already searching from it.
 * - `saving`: the bot's move is on the board and being saved.
 * - `over`: the result is known; the actions go under the board.
 * - `halted`: another tab moved, or the engine failed; the board is read-only
 *   and a banner says «Recargar».
 */
export type PlayStatus = "your-turn" | "thinking" | "saving" | "over" | "halted";

export function playStatusOf(state: Pick<LiveGameState, "status">): PlayStatus {
  switch (state.status) {
    case "human-turn":
      return "your-turn";
    case "booting":
    case "human-moved":
    case "bot-thinking":
      return "thinking";
    case "bot-moved":
      return "saving";
    case "over":
      return "over";
    case "stale":
    case "engine-failed":
      return "halted";
  }
}
