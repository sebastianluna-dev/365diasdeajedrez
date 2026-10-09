import type { Key } from "@lichess-org/chessground/types";
import { Chess } from "chessops/chess";
import { chessgroundDests } from "chessops/compat";
import { parseFen } from "chessops/fen";
import type { NormalMove } from "chessops/types";
import { makeSquare, makeUci, squareFile, squareRank } from "chessops/util";

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

/**
 * A move as an engine writes it. Standard UCI moves the king two squares to
 * castle (`e1g1`); chessops represents castling as the king taking its own rook
 * (`e1h1`), which Stockfish would refuse outside Chess960. The castling move is
 * the king's onto a square its own rook stands on.
 */
export function standardUci(pos: Chess, move: NormalMove): string {
  const piece = pos.board.get(move.from);
  const target = pos.board.get(move.to);
  if (piece?.role === "king" && target?.role === "rook" && target.color === piece.color) {
    const file = squareFile(move.to) > squareFile(move.from) ? 6 : 2;
    return `${makeSquare(move.from)}${makeSquare(squareRank(move.from) * 8 + file)}`;
  }
  return makeUci(move);
}

const PROMOTIONS = ["queen", "rook", "bishop", "knight"] as const;

/**
 * Every legal move of a position in standard UCI, each promotion four times
 * (`e7e8q`, `e7e8r`, `e7e8b`, `e7e8n`): what a bot picks from when it plays
 * a move at random. `legalDests` cannot serve, its destinations carry no piece.
 * Empty for an invalid FEN.
 */
export function legalUciMoves(fen: string): string[] {
  const pos = positionOf(fen);
  if (!pos) return [];

  const moves = new Set<string>();
  for (const [from, destinations] of pos.allDests()) {
    const isPawn = pos.board.get(from)?.role === "pawn";
    for (const to of destinations) {
      const lastRank = squareRank(to) === 0 || squareRank(to) === 7;
      if (isPawn && lastRank) {
        for (const promotion of PROMOTIONS) moves.add(makeUci({ from, to, promotion }));
      } else {
        moves.add(standardUci(pos, { from, to }));
      }
    }
  }
  return [...moves];
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
