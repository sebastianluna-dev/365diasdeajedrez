import type { Key } from "@lichess-org/chessground/types";
import { Chess, type Position } from "chessops/chess";
import { chessgroundMove } from "chessops/compat";
import { makeFen, parseFen } from "chessops/fen";
import { parsePgn, startingPosition } from "chessops/pgn";
import { makeSanAndPlay, parseSan } from "chessops/san";
import { makeUci, parseUci, squareRank } from "chessops/util";

export interface ReplayPosition {
  /** SAN of the move that produced this position ("" for the starting position). */
  san: string;
  /**
   * UCI of the move that produced this position ("" in the initial one). Unlike
   * `san`, it does not depend on context: it is the stable way to group the same
   * move coming from different games (see services/game-explorer).
   */
  uci: string;
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

export interface ReplayResult {
  positions: ReplayPosition[];
  /**
   * Reason why the replay stopped before finishing, if it happened.
   * Empty when the PGN was replayed in full.
   */
  warnings: string[];
}

/**
 * Replays a game (full PGN or bare SAN movetext) into one position per ply, using
 * chessops for rules / SAN / FEN. Index 0 is the starting position. Stops early
 * if it hits an unparseable or illegal move, reporting it in `warnings` so the
 * caller can tell a truncated game from a short one.
 */
export function replayGameDetailed(pgn: string): ReplayResult {
  const game = parsePgn(pgn)[0];
  const pos = game ? startPos(game.headers) : Chess.default();

  const positions: ReplayPosition[] = [{ san: "", uci: "", fen: makeFen(pos.toSetup()), check: pos.isCheck() }];
  const warnings: string[] = [];
  if (!game) {
    if (pgn.trim().length > 0) warnings.push("No se pudo leer ninguna partida en el PGN.");
    return { positions, warnings };
  }

  for (const node of game.moves.mainline()) {
    const move = parseSan(pos, node.san);
    if (!move) {
      warnings.push(
        `Jugada ilegal o no reconocida "${node.san}" en la jugada ${positions.length}: la partida se muestra recortada.`,
      );
      break;
    }
    // The UCI is taken BEFORE playing: makeUci only looks at the move, but keeping
    // it next to parseSan prevents a future change to the loop from reordering it.
    const uci = makeUci(move);
    pos.play(move);
    const [from, to] = chessgroundMove(move);
    positions.push({
      san: node.san,
      uci,
      fen: makeFen(pos.toSetup()),
      lastMove: [from as Key, to as Key],
      check: pos.isCheck(),
    });
  }

  return { positions, warnings };
}

/** Same as `replayGameDetailed` but returning only the positions. */
export function replayGame(pgn: string): ReplayPosition[] {
  return replayGameDetailed(pgn).positions;
}

/** Turn colour encoded in a FEN. */
export function turnColor(fen: string): "white" | "black" {
  return fen.split(" ")[1] === "b" ? "black" : "white";
}

/**
 * Plays a SAN move on a FEN and returns the resulting FEN, or `undefined` if
 * the FEN or the move is invalid. Used by the Move Trainer to advance through
 * a frozen exercise line without re-parsing any PGN.
 */
export function applySan(fen: string, san: string): string | undefined {
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

  const move = parseSan(pos, san);
  if (!move) return undefined;
  pos.play(move);
  return makeFen(pos.toSetup());
}

/** Pieces a pawn can promote to. */
export type PromotionRole = "queen" | "rook" | "bishop" | "knight";

function positionFromFen(fen: string): Position | null {
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

/**
 * Says whether moving between those two squares is a pawn promotion, so the
 * board can ask for the piece before confirming the move.
 */
export function isPromotionMove(fen: string, orig: Key, dest: Key): boolean {
  const pos = positionFromFen(fen);
  if (!pos) return false;

  const move = parseUci(`${orig}${dest}`);
  if (!move || !("from" in move)) return false;

  const isPawn = pos.board.getRole(move.from) === "pawn";
  const lastRank = squareRank(move.to) === 0 || squareRank(move.to) === 7;
  return isPawn && lastRank;
}

/**
 * SAN for a legal move played from `fen` between two squares — for interactive
 * boards. On a promotion, `promotion` picks the piece (defaults to queen).
 * Returns `undefined` if the FEN or move is invalid.
 */
export function sanForMove(fen: string, orig: Key, dest: Key, promotion: PromotionRole = "queen"): string | undefined {
  const pos = positionFromFen(fen);
  if (!pos) return undefined;

  const move = parseUci(`${orig}${dest}`);
  if (!move || !("from" in move)) return undefined;

  const isPawn = pos.board.getRole(move.from) === "pawn";
  const lastRank = squareRank(move.to) === 0 || squareRank(move.to) === 7;
  const finalMove = isPawn && lastRank ? { ...move, promotion } : move;

  return pos.isLegal(finalMove) ? makeSanAndPlay(pos, finalMove) : undefined;
}

export interface UciLineStep {
  san: string;
  /** The position AFTER the move: it is the one previewed when pointing at it. */
  fen: string;
  /** [from, to], to highlight on the preview board. */
  lastMove: [Key, Key];
}

/**
 * Replays the line the engine proposes, which it gives in UCI ("e2e4 e7e5"),
 * and returns each move with the position it leads to.
 *
 * It is replayed on the board because the SAN depends on the position: the same
 * move is written "Nf3" or "Ngf3" depending on whether another knight can get
 * there. It stops at the first move that does not fit, instead of returning the
 * line half-done without warning: an odd line is preferable to a wrong one.
 */
export function uciLineSteps(fen: string, uciMoves: string[]): UciLineStep[] {
  const out: UciLineStep[] = [];
  let current = fen;

  for (const uci of uciMoves) {
    const orig = uci.slice(0, 2) as Key;
    const dest = uci.slice(2, 4) as Key;
    const promotion = uci.length > 4 ? PROMOTION_BY_LETTER[uci[4]] : undefined;

    const san = sanForMove(current, orig, dest, promotion ?? "queen");
    if (!san) break;

    const next = applySan(current, san);
    if (!next) break;

    out.push({ san, fen: next, lastMove: [orig, dest] });
    current = next;
  }

  return out;
}

/** Only the SANs of the line, for whoever does not need the positions. */
export function uciLineToSan(fen: string, uciMoves: string[]): string[] {
  return uciLineSteps(fen, uciMoves).map((step) => step.san);
}

/** Promotion letter of the UCI to the piece `sanForMove` expects. */
const PROMOTION_BY_LETTER: Record<string, PromotionRole> = {
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
};
