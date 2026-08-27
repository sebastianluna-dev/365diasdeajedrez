import type { Key } from "@lichess-org/chessground/types";
import { Chess, type Position } from "chessops/chess";
import { chessgroundMove } from "chessops/compat";
import { makeFen, parseFen } from "chessops/fen";
import { parsePgn, startingPosition } from "chessops/pgn";
import { makeSanAndPlay, parseSan } from "chessops/san";
import { parseUci, squareRank } from "chessops/util";

export interface ReplayPosition {
  /** SAN of the move that produced this position ("" for the starting position). */
  san: string;
  /** Full FEN of the position. */
  fen: string;
  /** [from, to] of the move that produced this position, for chessground highlighting. */
  lastMove?: [Key, Key];
  /** Whether the side to move is in check. */
  check: boolean;
}

function startPos(headers: Map<string, string>): Position {
  return startingPosition(headers).unwrap(
    (pos) => pos,
    () => Chess.default(),
  );
}

/**
 * Replays a game (full PGN or bare SAN movetext) into one position per ply, using
 * chessops for rules / SAN / FEN. Index 0 is the starting position. Stops early
 * and returns what it has if it hits an unparseable or illegal move.
 */
export function replayGame(pgn: string): ReplayPosition[] {
  const game = parsePgn(pgn)[0];
  const pos = game ? startPos(game.headers) : Chess.default();

  const positions: ReplayPosition[] = [
    { san: "", fen: makeFen(pos.toSetup()), check: pos.isCheck() },
  ];
  if (!game) return positions;

  for (const node of game.moves.mainline()) {
    const move = parseSan(pos, node.san);
    if (!move) break;
    pos.play(move);
    const [from, to] = chessgroundMove(move);
    positions.push({
      san: node.san,
      fen: makeFen(pos.toSetup()),
      lastMove: [from as Key, to as Key],
      check: pos.isCheck(),
    });
  }

  return positions;
}

/** Turn colour encoded in a FEN. */
export function turnColor(fen: string): "white" | "black" {
  return fen.split(" ")[1] === "b" ? "black" : "white";
}

/**
 * SAN for a legal move played from `fen` between two squares — for interactive
 * boards. Auto-promotes to queen (base chessground has no promotion dialog).
 * Returns `undefined` if the FEN or move is invalid.
 */
export function sanForMove(fen: string, orig: Key, dest: Key): string | undefined {
  const setup = parseFen(fen).unwrap(
    (s) => s,
    () => null,
  );
  if (!setup) return undefined;
  const pos = Chess.fromSetup(setup).unwrap(
    (p) => p,
    () => null,
  );
  if (!pos) return undefined;

  const move = parseUci(`${orig}${dest}`);
  if (!move || !("from" in move)) return undefined;

  const isPawn = pos.board.getRole(move.from) === "pawn";
  const lastRank = squareRank(move.to) === 0 || squareRank(move.to) === 7;
  const finalMove = isPawn && lastRank ? { ...move, promotion: "queen" as const } : move;

  return pos.isLegal(finalMove) ? makeSanAndPlay(pos, finalMove) : undefined;
}
