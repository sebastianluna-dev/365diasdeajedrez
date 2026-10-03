import type { Key } from "@lichess-org/chessground/types";
import { Chess } from "chessops/chess";
import { chessgroundDests } from "chessops/compat";
import { parseFen } from "chessops/fen";

/**
 * Legal move destinations for a position, in the `Map<from, to[]>` shape
 * chessground's `movable.dests` expects. Empty map if the FEN is invalid.
 */
export function legalDests(fen: string): Map<Key, Key[]> {
  const pos = positionOf(fen);
  if (!pos) return new Map();

  return chessgroundDests(pos) as Map<Key, Key[]>;
}

/** How a position with no legal moves ended. */
export type PositionOutcome = "checkmate" | "stalemate";

/**
 * Whether the game is over on the board: no legal moves, mate if the king is
 * in check and stalemate if not. `null` while there is anything to play, and
 * for an invalid FEN.
 *
 * Draws by rule (bare kings, repetition, fifty moves) are not this: there are
 * still moves, and the engine still answers with lines.
 */
export function positionOutcome(fen: string): PositionOutcome | null {
  const pos = positionOf(fen);
  if (!pos) return null;
  if (pos.isCheckmate()) return "checkmate";
  if (pos.isStalemate()) return "stalemate";
  return null;
}

function positionOf(fen: string): Chess | null {
  const setup = parseFen(fen).unwrap(
    (s) => s,
    () => null,
  );
  if (!setup) return null;

  return Chess.fromSetup(setup).unwrap(
    (p) => p,
    () => null,
  );
}
