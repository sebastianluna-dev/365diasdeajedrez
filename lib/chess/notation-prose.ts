import { sanToSpanish } from "./notation";
import { nagGlyph, type PgnTreeNode } from "./pgn-tree";

// How notation is ordered when the game is READ instead of consulted: a
// lesson. The moves run on one after another and a comment breaks the line,
// because what a comment explains is the move it hangs from, and that is
// where whoever is reading stops to look at the board.
//
// A variation breaks it too, into a paragraph of its own. It is not put in
// parentheses: what says it is another line is its colour, and what says
// where it ends is that the main line starts again below it, numbered.
//
// `notation-blocks` is the other half of this: the two-column grid of a game
// gone through move by move. Both are pure modules without JSX on purpose —
// what is subtle here is when a move has to repeat its number, and that is
// checked with tests instead of by looking at a screen.

/** One thing inside a paragraph: a move, or a comment that follows it. */
export type ProseItem =
  | { kind: "move"; key: string; path: string; label: string }
  | { kind: "aside"; key: string; text: string };

/**
 * A paragraph. A run of moves of the main line, the comment that closed it,
 * or a variation — which carries its own comments inside, because what it
 * says belongs to the line it is proposing and not to the lesson.
 */
export type ProseBlock =
  | { kind: "moves"; key: string; items: ProseItem[] }
  | { kind: "comment"; key: string; text: string }
  | { kind: "variation"; key: string; depth: number; items: ProseItem[] };

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
 * A variation as its own paragraphs: its moves run on with its comments after
 * them, and a variation OF the variation opens a paragraph one step deeper,
 * after which this one resumes, numbered again.
 */
function pushVariation(start: PgnTreeNode, depth: number, out: ProseBlock[]): void {
  let items: ProseItem[] = [];
  let blockKey = start.path;
  let current: PgnTreeNode[] = [start];
  let needsNumber = true;

  const close = () => {
    if (items.length === 0) return;
    out.push({ kind: "variation", key: blockKey, depth, items });
    items = [];
  };

  while (current.length > 0) {
    const [main, ...deeper] = current;
    if (!main) break;
    if (items.length === 0) blockKey = main.path;

    items.push(moveItem(main, needsNumber));

    // The comment stays in the paragraph: it is what this line is being
    // proposed for, and on its own it would read as the lesson's own voice.
    if (main.comment) {
      items.push({ kind: "aside", key: `${main.path}-comment`, text: main.comment });
    }

    for (const variation of deeper) {
      close();
      pushVariation(variation, depth + 1, out);
    }

    // Same rule as the main line: a comment between a white move and Black's
    // reply leaves the reply having to say its number again.
    needsNumber = Boolean(main.comment) || deeper.length > 0;
    current = main.children;
  }

  close();
}

/**
 * Cuts the game into paragraphs: runs of the main line, the comments that
 * close them and the variations that hang from them.
 */
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

    // What is said about the move, then what could have been played instead:
    // the order a book gives them, and the order the reader needs — the
    // alternative only makes sense once the move has been explained.
    if (main.comment) {
      closeRun();
      blocks.push({ kind: "comment", key: `${main.path}-comment`, text: main.comment });
    }

    for (const variation of variations) {
      closeRun();
      pushVariation(variation, 0, blocks);
    }

    needsNumber = Boolean(main.comment) || variations.length > 0;
    current = main.children;
  }

  closeRun();
  return blocks;
}
