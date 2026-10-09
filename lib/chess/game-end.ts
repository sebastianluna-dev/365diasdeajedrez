import { GAME_TERMINATION, type GameTerminationCode } from "@/constants/platform/play-codes.const";
import { GAME_RESULT, type GameResultCode } from "@/constants/platform/study-codes.const";
import { replayLiveGame } from "./live-game";

// How a played game ends: what the board says, and what a person decides.
//
// Pure module. The same function runs in the live game's reducer — to know at
// once, and never ask the bot about a finished position — and in the server
// action, which is the truth. `positionOutcome` (legal-moves.ts) stays as it
// is: the engine panel depends on its two answers, mate and stalemate.
//
// Every draw by rule ends the game on its own, as on any chess site: bare
// kings, the third repetition of a position, fifty moves without a capture or
// a pawn move. Nobody has to claim them.

export type GameEndKind =
  | "checkmate"
  | "stalemate"
  | "insufficient-material"
  | "threefold"
  | "fifty-moves"
  | "resignation"
  | "abandoned"
  | "aborted";

export interface GameEnd {
  kind: GameEndKind;
  /** Null for a draw and for an aborted game. */
  winner: "white" | "black" | null;
  /** The `GameResult` row it is stored as; an aborted game keeps `ONGOING`, «*». */
  resultCode: GameResultCode;
  terminationCode: GameTerminationCode;
}

const other = (color: "white" | "black") => (color === "white" ? "black" : "white");

const winBy = (winner: "white" | "black", kind: GameEndKind, terminationCode: GameTerminationCode): GameEnd => ({
  kind,
  winner,
  resultCode: winner === "white" ? GAME_RESULT.WHITE_WINS : GAME_RESULT.BLACK_WINS,
  terminationCode,
});

const drawBy = (kind: GameEndKind, terminationCode: GameTerminationCode): GameEnd => ({
  kind,
  winner: null,
  resultCode: GAME_RESULT.DRAW,
  terminationCode,
});

/**
 * Whether the board has ended the game after these moves, and how. Null while
 * it goes on — and for a record that does not replay, which callers have
 * already refused with `playSan`.
 *
 * In order: a mate stands even on the fiftieth move; then stalemate, bare
 * material, the third repetition, the fifty-move rule.
 */
export function gameEnd(initialFen: string | null, sans: readonly string[]): GameEnd | null {
  const replayed = replayLiveGame({ initialFen, sans });
  if (!replayed) return null;
  const { position, keys } = replayed;

  if (position.isCheckmate()) return winBy(other(position.turn), "checkmate", GAME_TERMINATION.CHECKMATE);
  if (position.isStalemate()) return drawBy("stalemate", GAME_TERMINATION.STALEMATE);
  if (position.isInsufficientMaterial()) return drawBy("insufficient-material", GAME_TERMINATION.INSUFFICIENT_MATERIAL);

  const now = keys[keys.length - 1];
  if (keys.filter((key) => key === now).length >= 3) return drawBy("threefold", GAME_TERMINATION.THREEFOLD_REPETITION);
  if (position.halfmoves >= 100) return drawBy("fifty-moves", GAME_TERMINATION.FIFTY_MOVES);
  return null;
}

/** «Abandonar» pressed by `by`: the other side wins. */
export function resignationEnd(by: "white" | "black"): GameEnd {
  return winBy(other(by), "resignation", GAME_TERMINATION.RESIGNATION);
}

/**
 * A game closed without being played out: `abandoned` — left for a new one
 * after moves of one's own; a loss for `loser` — or `aborted` — closed before
 * then; no result, and no loser.
 */
export function closedEnd(kind: "abandoned", loser: "white" | "black"): GameEnd;
export function closedEnd(kind: "aborted", loser: null): GameEnd;
export function closedEnd(kind: "abandoned" | "aborted", loser: "white" | "black" | null): GameEnd {
  if (kind === "abandoned" && loser) return winBy(other(loser), "abandoned", GAME_TERMINATION.ABANDONED);
  return { kind: "aborted", winner: null, resultCode: GAME_RESULT.ONGOING, terminationCode: GAME_TERMINATION.ABORTED };
}
