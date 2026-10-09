import { Chess } from "chessops/chess";
import { INITIAL_FEN, makeFen, parseFen } from "chessops/fen";
import { makeSan, parseSan } from "chessops/san";
import { standardUci } from "./legal-moves";
import { addMove, emptyGame, serializeGame } from "./pgn-edit";
import { normalizePositionFen } from "./position-key";

// A game being played, as a starting position and the moves since: what the
// live game's reducer holds, what the server checks a move against, and what
// the engine is told (`position … moves`).
//
// Pure module: chessops only. A game's moves are SANs because that is what the
// PGN stores; the engine's UCI is derived from them (`uciMoves`).

export interface LiveGame {
  /** The starting position; null is the initial position. */
  initialFen: string | null;
  /** The moves played since, in chessops's canonical SAN. */
  sans: readonly string[];
}

export interface ReplayedLiveGame {
  /** The position after the last move. */
  position: Chess;
  /** Every position's key (`normalizePositionFen`), the starting one first: for counting repetitions. */
  keys: string[];
  /** Every move in standard UCI. */
  ucis: string[];
}

function startPosition(initialFen: string | null): Chess | null {
  const setup = parseFen(initialFen ?? INITIAL_FEN).unwrap(
    (value) => value,
    () => null,
  );
  if (!setup) return null;
  return Chess.fromSetup(setup).unwrap(
    (value) => value,
    () => null,
  );
}

/** Plays the game out. Null when the FEN is invalid or a move is not legal where it stands. */
export function replayLiveGame(game: LiveGame): ReplayedLiveGame | null {
  const position = startPosition(game.initialFen);
  if (!position) return null;

  const keys = [normalizePositionFen(makeFen(position.toSetup()))];
  const ucis: string[] = [];
  for (const san of game.sans) {
    const move = parseSan(position, san);
    if (!move || !("from" in move)) return null;
    ucis.push(standardUci(position, move));
    position.play(move);
    keys.push(normalizePositionFen(makeFen(position.toSetup())));
  }
  return { position, keys, ucis };
}

/**
 * The game with one more move, or null when the move is not legal. The SAN is
 * stored in chessops's canonical form, so `e8=Q` and `e8=Q+` are one move.
 */
export function playSan(game: LiveGame, san: string): LiveGame | null {
  const replayed = replayLiveGame(game);
  if (!replayed) return null;
  const move = parseSan(replayed.position, san);
  if (!move) return null;
  return { initialFen: game.initialFen, sans: [...game.sans, makeSan(replayed.position, move)] };
}

/** The FEN after the last move; null for a game that does not replay. */
export function currentFen(game: LiveGame): string | null {
  const replayed = replayLiveGame(game);
  return replayed ? makeFen(replayed.position.toSetup()) : null;
}

/** Whose move it is. */
export function sideToMove(game: LiveGame): "white" | "black" {
  return replayLiveGame(game)?.position.turn ?? "white";
}

/** The moves in standard UCI (`e1g1` for castling), for `position … moves`. */
export function uciMoves(game: LiveGame): string[] {
  return replayLiveGame(game)?.ucis ?? [];
}

/**
 * The game as a PGN with these headers, in this order, then `SetUp`/`FEN`
 * when it does not start from the initial position. Null for a game that does
 * not replay. The result token at the end of the moves is the `Result` header.
 */
export function toPgn(game: LiveGame, headers: Record<string, string>): string | null {
  const pgnGame = emptyGame(game.initialFen ?? undefined);
  let path = "";
  for (const san of game.sans) {
    const added = addMove(pgnGame, path, san);
    if (!added) return null;
    path = added.path;
  }
  const setUp = new Map(pgnGame.headers);
  pgnGame.headers.clear();
  for (const [name, value] of Object.entries(headers)) pgnGame.headers.set(name, value);
  for (const [name, value] of setUp) pgnGame.headers.set(name, value);
  return serializeGame(pgnGame);
}
