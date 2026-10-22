import { nodeAtPath, type PgnTree, type PgnTreeNode } from "./pgn-tree";

// How notation is ordered when a lesson is read one move at a time (the
// viewer's `moveList="notes"`): the ONE line being followed as a row of moves,
// and beside it what is said about the move on the board and which other moves
// the author offers at that point. A variation is not printed after the main
// line: it is entered from the move it branches at, and from then on it is the
// line.

/**
 * The line through `path`: the moves from the start to it, then on along each
 * move's main continuation to the end. Empty for an empty game; from the
 * initial position (`""`), the main line.
 */
export function lineThrough(tree: PgnTree, path: string): PgnTreeNode[] {
  const line: PgnTreeNode[] = [];
  if (path.length > 0) {
    let prefix = "";
    for (const segment of path.split(".")) {
      prefix = prefix.length === 0 ? segment : `${prefix}.${segment}`;
      const node = tree.nodesByPath.get(prefix);
      if (!node) return [];
      line.push(node);
    }
  }

  let next = path.length === 0 ? tree.children[0] : line.at(-1)?.children[0];
  while (next) {
    line.push(next);
    next = next.children[0];
  }
  return line;
}

/**
 * The other moves the author offers in the position at `path`: the
 * variations that branch where the next move is played, without that move.
 */
export function alternativesAt(tree: PgnTree, path: string): PgnTreeNode[] {
  const children = path.length === 0 ? tree.children : (nodeAtPath(tree, path)?.children ?? []);
  return children.slice(1);
}
