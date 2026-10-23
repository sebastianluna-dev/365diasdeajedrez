import { nodeAtPath, type PgnTree, type PgnTreeNode } from "./pgn-tree";

// How notation is ordered when a lesson is read one move at a time (the
// viewer's `moveList="notes"`): the MAIN line as a row of moves that never
// changes, and beside it what is said about the move of it on the board and
// the variations the author offers there, each whole. A move of a variation
// on the board leaves the main line on the move it branches from (its
// anchor), and is shown inside that move's note.

/** The main line: each move's main continuation, from the start to the end. */
export function mainLineOf(tree: PgnTree): PgnTreeNode[] {
  const line: PgnTreeNode[] = [];
  let next = tree.children[0];
  while (next) {
    line.push(next);
    next = next.children[0];
  }
  return line;
}

/**
 * The move of the main line a path hangs from: the path itself when it is on
 * the main line, or the last main-line move before its variation branches
 * (`""` when the variation is an alternative to the first move). A path is
 * the child indices from the start, and the main continuation is always the
 * first child, so the main line is the run of leading zeros.
 */
export function mainLineAnchor(path: string): string {
  if (path.length === 0) return "";
  const segments = path.split(".");
  const branch = segments.findIndex((segment) => segment !== "0");
  return branch === -1 ? path : segments.slice(0, branch).join(".");
}

/**
 * The other moves the author offers in the position at `path`: the
 * variations that branch where the next move is played, without that move.
 */
export function alternativesAt(tree: PgnTree, path: string): PgnTreeNode[] {
  const children = path.length === 0 ? tree.children : (nodeAtPath(tree, path)?.children ?? []);
  return children.slice(1);
}
