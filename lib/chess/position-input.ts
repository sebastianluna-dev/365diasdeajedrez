import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { readSolutionStart } from "./exercise-format";
import { emptyGame, serializeGame } from "./pgn-edit";
import { parsePgnTree } from "./pgn-tree";
import { positionPlausibility } from "./position-setup";

// What the analysis board and the exercise editor's «Pegar FEN o PGN» accept as
// a starting point, pure so the form in the browser and the URL read on the
// server say the same (K1): a FEN — a position that can exist on a board,
// kings and all, with no impossible check or material — or a PGN with at least
// one move or a starting position, whose start passes the same check an
// exercise's solution does (`readSolutionStart`: a broken `[FEN]` or another
// variant is refused, never read as the standard start).

/** The longest FEN accepted; a real one is about 90 characters. */
export const FEN_MAX_LENGTH = 120;

/** A FEN as a game with no moves, or null when it is not a position that can exist. */
export function pgnOfFen(fen: string): string | null {
  const text = fen.trim();
  if (text.length === 0 || text.length > FEN_MAX_LENGTH) return null;
  const setup = parseFen(text);
  if (!setup.isOk) return null;
  const position = Chess.fromSetup(setup.value);
  if (!position.isOk || positionPlausibility(position.value)) return null;
  return serializeGame(emptyGame(text));
}

/** A PGN the board can open: it reads, and it has a move or a position of its own. */
export function isOpenablePgn(pgn: string): boolean {
  const text = pgn.trim();
  if (!readSolutionStart(text).ok) return false;
  const tree = parsePgnTree(text);
  return tree !== null && (tree.nodesByPath.size > 0 || /\[FEN\s+"/.test(text));
}

export type PositionInputReading =
  | { ok: true; pgn: string }
  | { ok: false; field: "fen" | "pgn"; message: string }
  | { ok: false; field: null; message: string };

/**
 * The two fields under the board, read: the PGN wins when both have text (the
 * form says so); each failure names its field, so the error is drawn under it.
 */
export function readPositionInput(input: { fen: string; pgn: string }): PositionInputReading {
  const pgn = input.pgn.trim();
  const fen = input.fen.trim();
  if (pgn) {
    return isOpenablePgn(pgn) ? { ok: true, pgn } : { ok: false, field: "pgn", message: "No es un PGN válido." };
  }
  if (fen) {
    const read = pgnOfFen(fen);
    return read ? { ok: true, pgn: read } : { ok: false, field: "fen", message: "No es un FEN válido." };
  }
  return { ok: false, field: null, message: "Pega un FEN o un PGN." };
}
