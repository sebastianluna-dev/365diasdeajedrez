import { parsePgnTree } from "./pgn-tree";

// The main line of a PGN, which is the only thing trained from memory.
//
// Variations and sub-variations still exist inside the PGN and study mode walks
// through all of them; the review does NOT evaluate them. That is why "a
// trainable lesson" is ONE line and not a set of root-to-leaf paths: it fits
// the TrainingExercise that already exists without inventing a table of lines.
//
// Pure module: it only reuses the tree from pgn-tree.ts.

export interface MainlineResult {
  /** SANs of the main line, in order. */
  sans: string[];
  /** Starting FEN of the PGN, or null when it starts at the initial position. */
  initialFen: string | null;
}

/** Standard starting position, so as not to store a FEN that adds nothing. */
const STANDARD_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/**
 * Which position a PGN starts from, or `null` if it is the initial one.
 *
 * Unlike `extractMainline`, this also answers when the PGN HAS NO MOVES: a lone
 * diagram — headers and nothing else — is legitimate lesson content, and in fact
 * that is what almost all of the Kotov course's lessons are. Whoever only needs
 * the position should not be left without an answer for want of a line to train.
 */
export function startFenOf(pgn: string): string | null {
  const initialFen = parsePgnTree(pgn)?.initialFen;
  if (!initialFen || initialFen === STANDARD_START) return null;
  return initialFen;
}

/**
 * Walks `children[0]` from the root, which by convention is the main line — and
 * is what `makePgn` assumes when serialising.
 *
 * Returns null if the PGN cannot be read or has no moves at all: a lesson like
 * that cannot be trained, and it is better to say so than to derive an empty
 * exercise the trainer would reject later.
 */
export function extractMainline(pgn: string): MainlineResult | null {
  const tree = parsePgnTree(pgn);
  if (!tree) return null;

  const sans: string[] = [];
  const children = tree.children;
  for (let first = children[0]; first; first = first.children[0]) {
    sans.push(first.san);
  }

  if (sans.length === 0) return null;

  return {
    sans,
    initialFen: tree.initialFen === STANDARD_START ? null : tree.initialFen,
  };
}
