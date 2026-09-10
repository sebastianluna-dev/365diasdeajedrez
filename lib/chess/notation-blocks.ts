import type { PgnTree, PgnTreeNode } from "./pgn-tree";

// How chess notation is ordered so it can be read.
//
// The main line goes in a two-column grid (white / black) and everything else
// — comments and variations — goes full width. They are two boxes that have to
// alternate, so instead of rendering the tree recursively a LIST of blocks is
// emitted in the order they are read. Only that order is decided here; who
// renders it is the component's business.
//
// Pure module and without JSX on purpose: the rules below are subtle — when a
// pair is split, what drops a level — and they are checked with tests instead of
// by looking at a screen.

export interface NotationRow {
  kind: "row";
  key: string;
  number: number;
  white?: PgnTreeNode;
  black?: PgnTreeNode;
  /** White played on an earlier row: its slot carries "…". */
  continuation: boolean;
  /** Black's reply dropped a row: its slot carries "…". */
  pushedBlack: boolean;
}

export interface NotationComment {
  kind: "comment";
  key: string;
  text: string;
}

export type LineItem =
  | { type: "move"; node: PgnTreeNode; withNumber: boolean }
  | { type: "comment"; text: string };

export interface NotationLine {
  kind: "line";
  key: string;
  /** 0 = variation of the main line; each level indents one step more. */
  depth: number;
  items: LineItem[];
}

export type NotationBlock = NotationRow | NotationComment | NotationLine;

const moveNumberOf = (node: PgnTreeNode): number => Math.ceil(node.ply / 2);
const isWhite = (node: PgnTreeNode): boolean => node.ply % 2 === 1;

/**
 * Emits a variation and what hangs from it.
 *
 * The rule that decides where it is cut is the FORK, not the comment: a move
 * with a single continuation stays on the same row, and one with several closes
 * it and drops **all** of its options one level — the main one included.
 *
 * It is clear in a real line: `1...e6 2.Nf3 f5` is cut at f5 because three moves
 * come from there, and all three are listed indented below. If only the
 * alternatives dropped, the main one would stay glued to f5 and the other two
 * would look as though they hung from somewhere else.
 */
function emitLine(start: PgnTreeNode, depth: number, out: NotationBlock[]): void {
  const items: LineItem[] = [];
  let current: PgnTreeNode | undefined = start;
  let withNumber = true;

  while (current) {
    const node: PgnTreeNode = current;
    items.push({ type: "move", node, withNumber });
    withNumber = false;

    if (node.comment) {
      items.push({ type: "comment", text: node.comment });
      // After a comment the next move is numbered again: the text in between cuts the
      // reading and a bare "Nf6" would not say whose it is.
      withNumber = true;
    }

    if (node.children.length > 1) {
      out.push({ kind: "line", key: start.path, depth, items });
      for (const child of node.children) emitLine(child, depth + 1, out);
      return;
    }

    current = node.children[0];
  }

  out.push({ kind: "line", key: start.path, depth, items });
}

/** The whole notation, in the order it is read. */
export function buildNotationBlocks(tree: PgnTree): NotationBlock[] {
  const blocks: NotationBlock[] = [];
  let pending: NotationRow | null = null;

  const flush = () => {
    if (pending) blocks.push(pending);
    pending = null;
  };

  let current: PgnTreeNode | undefined = tree.children[0];
  // The alternatives to a move do NOT live in it, but among the siblings hanging
  // from its parent: they are computed when passing through the parent and emitted
  // on the next round, next to the move they replace.
  let variationsForCurrent = tree.children.slice(1);

  while (current) {
    const node: PgnTreeNode = current;
    const number = moveNumberOf(node);
    const [next, ...siblings] = node.children;
    const variations = variationsForCurrent;
    variationsForCurrent = siblings;

    if (isWhite(node)) {
      flush();
      pending = { kind: "row", key: node.path, number, white: node, continuation: false, pushedBlack: false };
    } else if (pending && !pending.black && pending.number === number) {
      pending.black = node;
    } else {
      const hadPrevious: boolean = pending !== null || blocks.length > 0;
      flush();
      pending = { kind: "row", key: node.path, number, black: node, continuation: hadPrevious, pushedBlack: false };
    }

    if (node.comment || variations.length > 0) {
      // What goes full width closes the row. If what brings it is a White move AND
      // there is a reply behind, Black's slot carries "…": otherwise the row would
      // read as though Black had not replied.
      if (pending && isWhite(node) && next && !isWhite(next)) pending.pushedBlack = true;
      flush();

      if (node.comment) blocks.push({ kind: "comment", key: `${node.path}-comment`, text: node.comment });
      for (const variation of variations) emitLine(variation, 0, blocks);
    }

    current = next;
  }

  flush();
  return blocks;
}
