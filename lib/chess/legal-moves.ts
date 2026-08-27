import type { Key } from "@lichess-org/chessground/types";
import { Chess } from "chessops/chess";
import { chessgroundDests } from "chessops/compat";
import { parseFen } from "chessops/fen";

/**
 * Legal move destinations for a position, in the `Map<from, to[]>` shape
 * chessground's `movable.dests` expects. Empty map if the FEN is invalid.
 */
export function legalDests(fen: string): Map<Key, Key[]> {
  const setup = parseFen(fen).unwrap(
    (s) => s,
    () => null,
  );
  if (!setup) return new Map();

  const pos = Chess.fromSetup(setup).unwrap(
    (p) => p,
    () => null,
  );
  if (!pos) return new Map();

  return chessgroundDests(pos) as Map<Key, Key[]>;
}
