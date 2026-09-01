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
   * UCI de la jugada que produjo esta posición ("" en la inicial). A diferencia
   * de `san`, no depende del contexto: es la forma estable de agrupar la misma
   * jugada venida de partidas distintas (ver services/game-explorer).
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
   * Motivo por el que la reproducción se cortó antes de terminar, si ocurrió.
   * Vacío cuando el PGN se reprodujo entero.
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

  const positions: ReplayPosition[] = [
    { san: "", uci: "", fen: makeFen(pos.toSetup()), check: pos.isCheck() },
  ];
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
    // El UCI se toma ANTES de jugar: makeUci sólo mira la jugada, pero dejarlo
    // junto a parseSan evita que un futuro cambio del bucle lo desordene.
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

/** Igual que `replayGameDetailed` pero devolviendo sólo las posiciones. */
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

/** Piezas a las que puede coronar un peón. */
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
 * Indica si mover entre esas dos casillas es una coronación de peón, para que
 * el tablero pueda pedir la pieza antes de confirmar la jugada.
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
