import { gameEnd, type GameEnd } from "@/lib/chess/game-end";
import { playSan, sideToMove } from "@/lib/chess/live-game";

// The live game against a bot, as a pure reducer: no React, no engine, no
// server. `use-live-game.hook.ts` connects it to the worker, the board and the
// actions, and does what each new state asks for (save a move, ask the bot).
//
// One move, one write: every ply — the person's or the bot's — is saved on its
// own with its ply number as the version (`appendPlayedMove`), and at most one
// is in flight. The bot's search starts as soon as the person moves, but its
// reply waits (`pendingBotSan`) until that move is saved: the bot never plays
// on top of a move the server may still refuse.

/** Why the server refused a move (`AppendMoveResult`'s failures). */
export type SaveFailureReason = "stale" | "invalid" | "denied" | "throttled" | "finished" | "disabled";

/** What the page delivers to resume a game: where it started, what was played, who the person is. */
export interface LiveGameSnapshot {
  initialFen: string | null;
  sans: readonly string[];
  humanColor: "white" | "black";
  /** How it ended, when it already has. */
  end: GameEnd | null;
}

export type LiveGameStatus =
  /** The engine is loading; the board is read-only. */
  | "booting"
  /** The board is movable for the person, at the leaf only. */
  | "human-turn"
  /** The person's move is shown and being saved; the bot is already searching (unless it ended the game). */
  | "human-moved"
  /** The person's move is saved; the bot's search or its human-like delay is still running. */
  | "bot-thinking"
  /** The bot's move is shown (sound, announcement) and being saved. */
  | "bot-moved"
  /** The result is known. */
  | "over"
  /** Another tab moved, or the server refused: «Recargar». */
  | "stale"
  /** The worker died twice: «Recargar». Nothing is lost — every person's move is saved before the bot is asked. */
  | "engine-failed";

export type LiveGameEvent =
  | { type: "ENGINE_READY" }
  | { type: "ENGINE_FAILED" }
  | { type: "HUMAN_MOVE"; san: string }
  /** The bot's search AND its delay both finished. */
  | { type: "BOT_REPLY"; san: string; generation: number }
  | { type: "SAVED"; plyCount: number; end: GameEnd | null }
  | { type: "SAVE_FAILED"; reason: SaveFailureReason }
  | { type: "ABANDON" }
  | { type: "CLOSED"; end: GameEnd }
  | { type: "RELOADED"; game: LiveGameSnapshot };

export interface LiveGameState {
  status: LiveGameStatus;
  initialFen: string | null;
  sans: readonly string[];
  /** How many plies the server has stored: the `expectedPly` of the next save. */
  savedPly: number;
  humanColor: "white" | "black";
  /** What the board says after the last move: the hook never asks the bot about a finished position. */
  end: GameEnd | null;
  /** A bot reply that arrived while the person's move was still being saved. */
  pendingBotSan: string | null;
  /** Bumped on abandon and reload: a bot reply from an older generation is dropped. */
  generation: number;
}

/** Where a game resumes: over if it ended, otherwise booting the engine. */
export function initialLiveGameState(game: LiveGameSnapshot, generation = 0): LiveGameState {
  return {
    status: game.end ? "over" : "booting",
    initialFen: game.initialFen,
    sans: game.sans,
    savedPly: game.sans.length,
    humanColor: game.humanColor,
    end: game.end,
    pendingBotSan: null,
    generation,
  };
}

/** Whose turn it is after the stored moves, for the person or the bot. */
function turnOf(state: Pick<LiveGameState, "initialFen" | "sans" | "humanColor">): "human-turn" | "bot-thinking" {
  return sideToMove(state) === state.humanColor ? "human-turn" : "bot-thinking";
}

/** Plays a move on the state's record; null when it is not legal there. */
function withMove(state: LiveGameState, san: string): Pick<LiveGameState, "sans" | "end"> | null {
  const next = playSan(state, san);
  if (!next) return null;
  return { sans: next.sans, end: gameEnd(next.initialFen, next.sans) };
}

export function liveGameReducer(state: LiveGameState, event: LiveGameEvent): LiveGameState {
  // A reload starts over from what the server has, whatever the state.
  if (event.type === "RELOADED") return initialLiveGameState(event.game, state.generation + 1);
  if (state.status === "over") return state;

  switch (event.type) {
    case "ENGINE_FAILED":
      // From any state: the record is intact, only the opponent is gone.
      return { ...state, status: "engine-failed", pendingBotSan: null };

    case "SAVE_FAILED":
      // A throttled save is retried by the hook; the state does not change.
      if (event.reason === "throttled") return state;
      // Another tab moved, the game was closed elsewhere, or the server refused
      // a move the client had checked: the only safe thing is to reload.
      return { ...state, status: "stale", pendingBotSan: null };

    case "ABANDON":
      // The hook calls the action and dispatches CLOSED; a bot reply in flight is now stale.
      return { ...state, pendingBotSan: null, generation: state.generation + 1 };

    case "CLOSED":
      return { ...state, status: "over", end: event.end, pendingBotSan: null };

    case "ENGINE_READY":
      if (state.status !== "booting") return state;
      return { ...state, status: state.end ? "over" : turnOf(state) };

    case "HUMAN_MOVE": {
      if (state.status !== "human-turn") return state;
      const next = withMove(state, event.san);
      if (!next) return state;
      return { ...state, ...next, status: "human-moved", pendingBotSan: null };
    }

    case "BOT_REPLY": {
      if (event.generation !== state.generation) return state;
      if (state.status === "human-moved") return { ...state, pendingBotSan: event.san };
      if (state.status !== "bot-thinking") return state;
      const next = withMove(state, event.san);
      // The engine and chessops disagreeing about a move is a failed engine.
      if (!next) return { ...state, status: "engine-failed" };
      return { ...state, ...next, status: "bot-moved" };
    }

    case "SAVED": {
      if (state.status !== "human-moved" && state.status !== "bot-moved") return state;
      const saved = { ...state, savedPly: event.plyCount };
      // The server is the truth; the reducer's own reading only covers a server that says nothing.
      const end = event.end ?? state.end;
      if (end) return { ...saved, status: "over", end, pendingBotSan: null };
      if (state.status === "bot-moved") return { ...saved, status: "human-turn" };
      if (state.pendingBotSan === null) return { ...saved, status: "bot-thinking" };
      const next = withMove(saved, state.pendingBotSan);
      if (!next) return { ...saved, status: "engine-failed", pendingBotSan: null };
      return { ...saved, ...next, status: "bot-moved", pendingBotSan: null };
    }
  }
}
