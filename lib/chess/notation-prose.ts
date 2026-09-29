import { sanToSpanish } from "./notation";
import { nagGlyph, type PgnTreeNode } from "./pgn-tree";

// How notation is ordered when the game is READ instead of consulted: a
// lesson. The moves run on one after another and a comment breaks the line,
// because what a comment explains is the move it hangs from, and that is
// where whoever is reading stops to look at the board.
//
// `notation-blocks` is the other half of this: the two-column grid of a game
// gone through move by move. Both are pure modules without JSX on purpose —
// what is subtle here is when a move has to repeat its number, and that is
// checked with tests instead of by looking at a screen.

/**
 * One thing inside a run of moves: the move, an aside (a comment belonging to
 * a variation, which stays in its parenthesis) or a whole variation.
 */
export type ProseItem =
  | { kind: "move"; key: string; path: string; label: string }
  | { kind: "aside"; key: string; text: string }
  | { kind: "variation"; key: string; items: ProseItem[] };

/** A run of moves, or the comment that closed it. */
export type ProseBlock =
  | { kind: "moves"; key: string; items: ProseItem[] }
  | { kind: "comment"; key: string; text: string };

/**
 * A move as it is written: the number when it is White's, when it opens a
 * line, or when a comment or a variation came just before it ("2… Cc6"),
 * which is the rule a printed book follows.
 */
function moveLabel(node: PgnTreeNode, needsNumber: boolean): string {
  const isWhiteMove = node.ply % 2 === 1;
  const moveNumber = Math.ceil(node.ply / 2);
  const prefix = isWhiteMove ? `${moveNumber}. ` : needsNumber ? `${moveNumber}... ` : "";
  return `${prefix}${sanToSpanish(node.san)}${node.nags.map(nagGlyph).join("")}`;
}

const moveItem = (node: PgnTreeNode, needsNumber: boolean): ProseItem => ({
  kind: "move",
  key: node.path,
  path: node.path,
  label: moveLabel(node, needsNumber),
});

/**
 * A variation, always inline: it is an aside inside the line it hangs from,
 * so its own comments stay in the parenthesis instead of breaking the page in
 * two over a move that is not the one being followed.
 */
function variationItems(nodes: PgnTreeNode[]): ProseItem[] {
  const items: ProseItem[] = [];
  let current = nodes;
  let needsNumber = true;

  while (current.length > 0) {
    const [main, ...variations] = current;
    if (!main) break;

    items.push(moveItem(main, needsNumber));

    if (main.comment) {
      items.push({ kind: "aside", key: `${main.path}-comment`, text: main.comment });
    }

    for (const variation of variations) {
      items.push({ kind: "variation", key: `${variation.path}-variation`, items: variationItems([variation]) });
    }

    needsNumber = Boolean(main.comment) || variations.length > 0;
    current = main.children;
  }

  return items;
}

/** Cuts the main line into runs of moves and the comments that close them. */
export function buildProseBlocks(nodes: PgnTreeNode[]): ProseBlock[] {
  const blocks: ProseBlock[] = [];
  let run: ProseItem[] = [];
  let runKey = "start";
  let current = nodes;
  let needsNumber = true;

  const closeRun = () => {
    if (run.length === 0) return;
    blocks.push({ kind: "moves", key: runKey, items: run });
    run = [];
  };

  while (current.length > 0) {
    const [main, ...variations] = current;
    if (!main) break;
    if (run.length === 0) runKey = main.path;

    run.push(moveItem(main, needsNumber));

    // Before the comment: a variation belongs to the line it hangs from, and
    // left after it would open under a paragraph that has already moved on.
    for (const variation of variations) {
      run.push({ kind: "variation", key: `${variation.path}-variation`, items: variationItems([variation]) });
    }

    if (main.comment) {
      closeRun();
      blocks.push({ kind: "comment", key: `${main.path}-comment`, text: main.comment });
    }

    needsNumber = Boolean(main.comment) || variations.length > 0;
    current = main.children;
  }

  closeRun();
  return blocks;
}
