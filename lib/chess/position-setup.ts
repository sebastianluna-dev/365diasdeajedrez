import { Chess, IllegalSetup, isImpossibleCheck, type Position } from "chessops/chess";
import { makeFen, parseBoardFen, parseFen } from "chessops/fen";
import type { Color, Role, SquareName } from "chessops/types";
import { makeSquare, parseSquare, squareFromCoords } from "chessops/util";

// The position an author sets up piece by piece (the exercise editor's
// «Colocar piezas», docs → Chess → Library): the FEN it makes, what it may
// offer (castling, en passant) and why a position is refused.
//
// Pure module: only chessops. The same checks run on every other way a start
// position comes in — a pasted FEN or PGN, a game's move, an import — through
// `positionPlausibility`, which `readSolutionStart` (exercise-format.ts) shares.

export interface SetupInput {
  /** The board part of a FEN, as chessground's `getFen()` gives it. */
  placement: string;
  turn: "white" | "black";
  castling: { K: boolean; Q: boolean; k: boolean; q: boolean };
  /** The square a double pawn push just passed over («e3»), or null. */
  epSquare: string | null;
}

export type SetupProblem =
  | "empty"
  | "kings"
  | "pawnsOnBackrank"
  | "oppositeCheck"
  | "castling"
  | "enPassant"
  | "impossibleCheck"
  | "impossibleMaterial";

/** The castling rights in FEN order, with the king's and the rook's home squares. */
const CASTLING_HOMES = [
  { right: "K", color: "white", king: "e1", rook: "h1" },
  { right: "Q", color: "white", king: "e1", rook: "a1" },
  { right: "k", color: "black", king: "e8", rook: "h8" },
  { right: "q", color: "black", king: "e8", rook: "a8" },
] as const;

const NO_CASTLING: SetupInput["castling"] = { K: false, Q: false, k: false, q: false };

/** «<placement> <w|b> <KQkq|-> <ep|-> 0 1»: the FEN of a setup, unchecked. */
export function setupFen(input: SetupInput): string {
  const castling = CASTLING_HOMES.filter(({ right }) => input.castling[right])
    .map(({ right }) => right)
    .join("");
  const turn = input.turn === "white" ? "w" : "b";
  return `${input.placement} ${turn} ${castling || "-"} ${input.epSquare ?? "-"} 0 1`;
}

function boardOf(placement: string) {
  return parseBoardFen(placement).unwrap(
    (board) => board,
    () => null,
  );
}

/** The square at a file and rank, both 0–7; out of the board is a programming error. */
function squareAt(file: number, rank: number): number {
  const square = squareFromCoords(file, rank);
  if (square === undefined) throw new Error(`Casilla fuera del tablero (${file}, ${rank}).`);
  return square;
}

/**
 * The castling rights the placement allows: the king and that rook on their
 * home squares. Chessops would drop any other right silently; the editor
 * disables it instead, with its reason.
 */
export function availableCastling(placement: string): SetupInput["castling"] {
  const board = boardOf(placement);
  if (!board) return { ...NO_CASTLING };

  const has = (square: SquareName, color: Color, role: Role) => {
    const piece = board.get(parseSquare(square));
    return piece?.color === color && piece.role === role;
  };
  const available = { ...NO_CASTLING };
  for (const { right, color, king, rook } of CASTLING_HOMES) {
    available[right] = has(king, color, "king") && has(rook, color, "rook");
  }
  return available;
}

/**
 * The en passant squares a double push could have just left, with a pawn of
 * the side to move beside the pushed one to take it: the pushed pawn on its
 * fourth rank, the square it passed over and the one it came from empty. Any
 * other square would mean nothing, and chessops would drop it.
 */
export function enPassantOptions(placement: string, turn: SetupInput["turn"]): string[] {
  const board = boardOf(placement);
  if (!board) return [];

  // The side that just pushed is the one not to move.
  const pusher: Color = turn === "white" ? "black" : "white";
  const pushedRank = pusher === "black" ? 4 : 3;
  const passedRank = pusher === "black" ? 5 : 2;
  const originRank = pusher === "black" ? 6 : 1;

  const options: string[] = [];
  for (let file = 0; file < 8; file++) {
    const pushed = board.get(squareAt(file, pushedRank));
    if (pushed?.color !== pusher || pushed.role !== "pawn") continue;
    if (board.get(squareAt(file, passedRank)) || board.get(squareAt(file, originRank))) continue;
    const takers = [file - 1, file + 1].filter((side) => {
      if (side < 0 || side > 7) return false;
      const piece = board.get(squareAt(side, pushedRank));
      return piece?.color === turn && piece.role === "pawn";
    });
    if (takers.length > 0) options.push(makeSquare(squareAt(file, passedRank)));
  }
  return options;
}

const STARTING_SET: Partial<Record<Role, number>> = { queen: 1, rook: 2, bishop: 2, knight: 2 };

/**
 * The two checks chessops' `validate()` does not make, shared with
 * `readSolutionStart` (exercise-format.ts): a check no legal move could have
 * given (two knights, a triple check, a check an en passant square rules out:
 * chessops' `isImpossibleCheck`) and more material than a side can have — at
 * most 16 pieces and 8 pawns, and no more promoted pieces (queens, rooks,
 * bishops and knights beyond the starting set) than pawns it is missing.
 */
export function positionPlausibility(pos: Position): "impossibleCheck" | "impossibleMaterial" | null {
  if (isImpossibleCheck(pos)) return "impossibleCheck";

  for (const color of ["white", "black"] as const) {
    const side = pos.board[color];
    const pawns = side.intersect(pos.board.pawn).size();
    if (side.size() > 16 || pawns > 8) return "impossibleMaterial";
    let promoted = 0;
    for (const [role, start] of Object.entries(STARTING_SET) as [Role, number][]) {
      promoted += Math.max(side.intersect(pos.board[role]).size() - start, 0);
    }
    if (promoted > 8 - pawns) return "impossibleMaterial";
  }
  return null;
}

const ILLEGAL_SETUP_PROBLEMS: Record<string, SetupProblem> = {
  [IllegalSetup.Empty]: "empty",
  [IllegalSetup.Kings]: "kings",
  [IllegalSetup.PawnsOnBackrank]: "pawnsOnBackrank",
  [IllegalSetup.OppositeCheck]: "oppositeCheck",
};

/**
 * The setup checked, in the order the editor says it: chessops' own refusals
 * (nothing placed, the kings, pawns on a back rank, the side not to move in
 * check), then the two it would normalise silently (a castling right without
 * its pieces, an en passant square no push could have left), then the two it
 * never makes (`positionPlausibility`). The FEN given back is chessops'
 * normalised one, the same `readSolutionStart` would store.
 */
export function validateSetup(input: SetupInput): { ok: true; fen: string } | { ok: false; problem: SetupProblem } {
  // The board never sends a broken placement; one would read as nothing placed.
  if (!boardOf(input.placement)) return { ok: false, problem: "empty" };

  const bare = parseFen(setupFen({ ...input, castling: NO_CASTLING, epSquare: null })).unwrap();
  const legal = Chess.fromSetup(bare);
  if (legal.isErr) return { ok: false, problem: ILLEGAL_SETUP_PROBLEMS[legal.error.message] ?? "kings" };

  const available = availableCastling(input.placement);
  if (CASTLING_HOMES.some(({ right }) => input.castling[right] && !available[right])) {
    return { ok: false, problem: "castling" };
  }
  if (input.epSquare !== null && !enPassantOptions(input.placement, input.turn).includes(input.epSquare)) {
    return { ok: false, problem: "enPassant" };
  }

  const pos = Chess.fromSetup(parseFen(setupFen(input)).unwrap()).unwrap();
  const implausible = positionPlausibility(pos);
  if (implausible) return { ok: false, problem: implausible };

  return { ok: true, fen: makeFen(pos.toSetup()) };
}
