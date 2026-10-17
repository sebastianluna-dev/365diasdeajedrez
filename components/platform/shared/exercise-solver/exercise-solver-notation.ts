import type { Solution } from "@/lib/chess/exercise-solver";
import { sanToSpanish } from "@/lib/chess/notation";
import { nodeAtPath } from "@/lib/chess/pgn-tree";

// The solve panel's notation (the Lichess-like screen): the line on the board
// as numbered rows, the player's moves marked right, and each wrong move the
// student tried shown under the row of the move it should have been, as a
// variation marked wrong. Pure, so the view only draws rows.

/** A wrong move the student tried: where it was played (a solution path) and its SAN. */
export interface SolverMiss {
  path: string;
  san: string;
}

export interface NotationMove {
  path: string;
  /** Spanish SAN: «Dg8+». */
  san: string;
  byPlayer: boolean;
}

export type NotationRow =
  | { kind: "moves"; number: number; white: NotationMove | null; black: NotationMove | null }
  /** «26. Df7», a wrong try, under the row of the move it stood for. */
  | { kind: "miss"; label: string; first: boolean };

/** Plies from the start to the node at `path`. */
const pliesTo = (path: string) => (path.length === 0 ? 0 : path.split(".").length);

/** The paths from the first move to `path`, in order: "0", "0.0", "0.0.0"… */
export function linePaths(path: string): string[] {
  if (path.length === 0) return [];
  const segments = path.split(".");
  return segments.map((_, index) => segments.slice(0, index + 1).join("."));
}

/** The number and the side of the start, from the solution's FEN. */
function startOf(solution: Solution): { number: number; whiteFirst: boolean } {
  const [, turn = "w", , , , fullmove = "1"] = solution.tree.initialFen.split(" ");
  return { number: Number.parseInt(fullmove, 10) || 1, whiteFirst: turn === "w" };
}

/** The move number and side of the ply after `pliesBefore` plies of the line. */
function moveOf(solution: Solution, pliesBefore: number): { number: number; white: boolean } {
  const start = startOf(solution);
  const offset = pliesBefore + (start.whiteFirst ? 0 : 1);
  return { number: start.number + Math.floor(offset / 2), white: offset % 2 === 0 };
}

/**
 * The rows of the line through `path`, with the misses under the row of the
 * move each one stood for; a miss past the end of the line (the move not yet
 * found) goes at the foot.
 */
export function notationRows(solution: Solution, path: string, misses: readonly SolverMiss[]): NotationRow[] {
  const rows: NotationRow[] = [];
  const paths = linePaths(path);
  const missRow = (miss: SolverMiss, first: boolean): NotationRow => {
    const move = moveOf(solution, pliesTo(miss.path));
    return { kind: "miss", label: `${move.number}${move.white ? "." : "…"} ${sanToSpanish(miss.san)}`, first };
  };
  // Each miss once, the student's first try marked as such.
  const firstMiss = misses[0];
  let pending = [...misses];
  const takeMissesUpTo = (ply: number) => {
    const taken = pending.filter((miss) => pliesTo(miss.path) + 1 <= ply);
    pending = pending.filter((miss) => !taken.includes(miss));
    return taken.map((miss) => missRow(miss, miss === firstMiss));
  };

  let row: Extract<NotationRow, { kind: "moves" }> | null = null;
  let rowLastPly = 0;
  const flush = () => {
    if (!row) return;
    rows.push(row, ...takeMissesUpTo(rowLastPly));
    row = null;
  };
  paths.forEach((nodePath, index) => {
    const node = nodeAtPath(solution.tree, nodePath);
    if (!node) return;
    const move = moveOf(solution, index);
    const entry: NotationMove = { path: nodePath, san: sanToSpanish(node.san), byPlayer: index % 2 === 0 };
    if (move.white || !row) {
      flush();
      row = { kind: "moves", number: move.number, white: null, black: null };
    }
    if (move.white) row.white = entry;
    else row.black = entry;
    rowLastPly = index + 1;
  });
  flush();
  // The rest: tried at a move the line has not reached, or past its last row's plies.
  rows.push(...pending.map((miss) => missRow(miss, miss === firstMiss)));
  return rows;
}
