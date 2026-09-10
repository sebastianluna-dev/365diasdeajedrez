import type { DrawShape } from "@lichess-org/chessground/draw";
import type { Key } from "@lichess-org/chessground/types";
import { Chess, type Position } from "chessops/chess";
import { chessgroundMove } from "chessops/compat";
import { makeFen } from "chessops/fen";
import { parsePgn, startingPosition, type ChildNode, type PgnNodeData } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { findMalformedMoveTokens } from "./movetext-scan";

// Complete tree of a PGN: variations, comments, NAGs and visual annotations
// ([%cal] arrows, [%csl] squares, [%diagram] forced diagram).
// Complements replay.ts (which only follows the main line and is used by the blog).
//
// The dotted path ("0", "0.1.0", ...) is the child indexes from the root and is
// the canonical format of TrainingExercise.path and ClassBlock.movePath.

/**
 * The evaluation of a position, exactly as it travels inside the PGN in the
 * `[%eval …]` command that Lichess writes (and reads).
 */
export interface MoveEvaluation {
  /** Advantage in pawns, ALWAYS in White's sign. */
  score: number;
  /** Moves to mate, in White's sign. `null` when there is no mate. */
  mateIn: number | null;
}

export interface PgnTreeNode {
  path: string;
  san: string;
  /** 1-based ply from the initial position of ITS trunk line. */
  ply: number;
  fen: string;
  lastMove?: [Key, Key];
  check: boolean;
  comment?: string;
  nags: number[];
  shapes: DrawShape[];
  showDiagram: boolean;
  /** What the engine scored for THIS position, if the game is evaluated. */
  evaluation?: MoveEvaluation;
  children: PgnTreeNode[];
}

export interface PgnTree {
  initialFen: string;
  initialComment?: string;
  initialShapes: DrawShape[];
  /** That of the starting position, which hangs from no move. */
  initialEvaluation?: MoveEvaluation;
  /** children[0] is the main continuation. */
  children: PgnTreeNode[];
  nodesByPath: Map<string, PgnTreeNode>;
  /**
   * Branches discarded for containing illegal or unparseable moves. Empty when
   * the PGN is correct; the interface shows it in development so a badly loaded
   * PGN is not simply seen "truncated".
   */
  warnings: string[];
}

const BRUSH_BY_LETTER: Record<string, string> = { G: "green", R: "red", Y: "yellow", B: "blue" };

/**
 * A mate is drawn as an enormous advantage, not as a separate number: the chart
 * and the bar need a value to work with, and "is going to mate" is the ceiling
 * of the scale.
 */
const MATE_SCORE = 100;

/** `[%eval 0.34]`, `[%eval -1.2]`, `[%eval #3]`, `[%eval #-3]`. */
function parseEvaluation(raw: string): MoveEvaluation | undefined {
  const match = /\[%eval\s+(#?)(-?\d+(?:\.\d+)?)\]/.exec(raw);
  if (!match) return undefined;

  const value = Number(match[2]);
  if (!Number.isFinite(value)) return undefined;

  if (match[1] === "#") {
    return { score: value >= 0 ? MATE_SCORE : -MATE_SCORE, mateIn: value };
  }
  return { score: value, mateIn: null };
}

function parseCommentCommands(comments: string[] | undefined): {
  text?: string;
  shapes: DrawShape[];
  showDiagram: boolean;
  evaluation?: MoveEvaluation;
} {
  if (!comments || comments.length === 0) return { shapes: [], showDiagram: false };

  const raw = comments.join(" ");
  const shapes: DrawShape[] = [];

  for (const match of raw.matchAll(/\[%cal ([^\]]+)\]/g)) {
    for (const entry of match[1].split(",")) {
      const value = entry.trim();
      if (value.length < 5) continue;
      shapes.push({
        brush: BRUSH_BY_LETTER[value[0]] ?? "green",
        orig: value.slice(1, 3) as Key,
        dest: value.slice(3, 5) as Key,
      });
    }
  }
  for (const match of raw.matchAll(/\[%csl ([^\]]+)\]/g)) {
    for (const entry of match[1].split(",")) {
      const value = entry.trim();
      if (value.length < 3) continue;
      shapes.push({ brush: BRUSH_BY_LETTER[value[0]] ?? "green", orig: value.slice(1, 3) as Key });
    }
  }

  const showDiagram = /\[%diagram\]/.test(raw);
  const text = raw
    .replace(/\[%[a-z]+ [^\]]*\]/g, "")
    .replace(/\[%diagram\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return { text: text.length > 0 ? text : undefined, shapes, showDiagram, evaluation: parseEvaluation(raw) };
}

function walk(
  children: ChildNode<PgnNodeData>[],
  pos: Position,
  parentPath: string,
  ply: number,
  nodesByPath: Map<string, PgnTreeNode>,
  warnings: string[],
): PgnTreeNode[] {
  const result: PgnTreeNode[] = [];

  children.forEach((child, index) => {
    const move = parseSan(pos, child.data.san);
    if (!move) {
      // Illegal SAN: that branch is discarded and noted; the rest of the tree goes on.
      const at = parentPath.length > 0 ? `tras la ruta "${parentPath}"` : "en la posición inicial";
      warnings.push(`Jugada ilegal o no reconocida "${child.data.san}" ${at} (jugada ${ply}).`);
      return;
    }

    const next = pos.clone();
    next.play(move);
    const [from, to] = chessgroundMove(move);
    const path = parentPath.length > 0 ? `${parentPath}.${index}` : `${index}`;
    const { text, shapes, showDiagram, evaluation } = parseCommentCommands(child.data.comments);

    const node: PgnTreeNode = {
      path,
      san: child.data.san,
      ply,
      fen: makeFen(next.toSetup()),
      lastMove: [from as Key, to as Key],
      check: next.isCheck(),
      comment: text,
      nags: child.data.nags ?? [],
      shapes,
      showDiagram,
      evaluation,
      children: [],
    };
    node.children = walk(child.children, next, path, ply + 1, nodesByPath, warnings);
    nodesByPath.set(path, node);
    result.push(node);
  });

  return result;
}

/** Parses the whole PGN into a tree. Returns null if there is nothing parseable. */
export function parsePgnTree(pgn: string): PgnTree | null {
  const game = parsePgn(pgn)[0];
  if (!game) return null;

  const pos = startingPosition(game.headers).unwrap(
    (start) => start,
    () => Chess.default(),
  );

  // The ply is ABSOLUTE, not relative to the PGN: it comes from the turn and the
  // move number of the starting FEN. A position that starts at "44." has to be
  // numbered 44 and not 1, and if Black moves the first move has to read "44…"
  // and not "44.".
  //
  // Everything that numbers — the table, the variation tree, the move labels and
  // the side that decides which NAG is written — takes the number from here with
  // `Math.ceil(ply / 2)` and the colour with `ply % 2 === 1`, so starting right
  // is enough.
  const startPly = (pos.fullmoves - 1) * 2 + (pos.turn === "white" ? 1 : 2);

  const nodesByPath = new Map<string, PgnTreeNode>();
  // What did not even reach the tree goes first: chessops's tokeniser discards
  // tokens without the shape of a move before `walk` sees them, so that warning
  // has to come from the raw text.
  const warnings = findMalformedMoveTokens(pgn).map(
    (token) => `Token no reconocido como jugada: "${token}". Esa rama no se ha cargado.`,
  );
  const { text, shapes, evaluation } = parseCommentCommands(game.comments);
  const children = walk(game.moves.children, pos, "", startPly, nodesByPath, warnings);

  return {
    initialFen: makeFen(pos.toSetup()),
    initialComment: text,
    initialShapes: shapes,
    initialEvaluation: evaluation,
    children,
    nodesByPath,
    warnings,
  };
}

/** Node at a dotted path; undefined for "" (initial position) or a broken path. */
export function nodeAtPath(tree: PgnTree, path: string): PgnTreeNode | undefined {
  return path.length > 0 ? tree.nodesByPath.get(path) : undefined;
}

/** Path of the parent ("" when the node hangs from the root). */
export function parentPathOf(path: string): string {
  const cut = path.lastIndexOf(".");
  return cut === -1 ? "" : path.slice(0, cut);
}

/** Next move of the current line (the main child). */
export function nextPathOf(tree: PgnTree, path: string): string | undefined {
  const children = path.length === 0 ? tree.children : nodeAtPath(tree, path)?.children;
  return children?.[0]?.path;
}

/**
 * The SANs from the initial position to the move at `path`, in order.
 *
 * It is what turns "this position in the viewer" into the format the exercises
 * and the seed store ("e4 c5 Nf3"). On a broken path it returns the empty list:
 * half a line would be worse than none, because it would be stored without warning.
 */
export function sansAlongPath(tree: PgnTree, path: string): string[] {
  if (path.length === 0) return [];

  const sans: string[] = [];
  let prefix = "";
  for (const segment of path.split(".")) {
    prefix = prefix.length === 0 ? segment : `${prefix}.${segment}`;
    const node = tree.nodesByPath.get(prefix);
    if (!node) return [];
    sans.push(node.san);
  }
  return sans;
}

/** End of the current line, always following the main child. */
export function endPathOf(tree: PgnTree, path: string): string {
  let current = path;
  for (;;) {
    const next = nextPathOf(tree, current);
    if (!next) return current;
    current = next;
  }
}

/**
 * Glyph of a numeric NAG ($1, $14, ...) to show next to the SAN.
 *
 * The codes that come in pairs (white/black) share a symbol: "↑" is the
 * initiative, whoever has it, and who has it is already said by whose move it
 * is. The numbers are those of the PGN standard, with the extensions ChessBase
 * uses for novelty ($146), idea ($140) and time trouble ($138).
 */
const NAG_GLYPHS: Record<number, string> = {
  1: "!",
  2: "?",
  3: "!!",
  4: "??",
  5: "!?",
  6: "?!",
  7: "□",
  10: "=",
  13: "∞",
  14: "⩲",
  15: "⩱",
  16: "±",
  17: "∓",
  18: "+−",
  19: "−+",
  22: "⊙",
  23: "⊙",
  32: "↑↑",
  33: "↑↑",
  36: "↑",
  37: "↑",
  40: "→",
  41: "→",
  44: "=∞",
  45: "=∞",
  132: "⇆",
  133: "⇆",
  138: "⊕",
  139: "⊕",
  140: "Δ",
  146: "N",
};

export function nagGlyph(nag: number): string {
  return NAG_GLYPHS[nag] ?? `$${nag}`;
}

export interface NagOption {
  /** The code written when the move is White's. */
  nag: number;
  /**
   * Short name, for the lists where the symbol is already next to it and what is
   * left over is text. The long one stays for the button's title, which is what
   * whoever does not recognise the symbol reads — and what a screen reader hears.
   */
  short: string;
  /**
   * The same symbol for a Black move. The PGN distinguishes side in almost every
   * symbolic comment — $36 is "White has the initiative" and $37 the black
   * equivalent — so the corresponding one is stored instead of always writing
   * White's.
   */
  blackNag?: number;
  glyph: string;
  label: string;
}

/** The codes an option occupies, to know what it replaces when chosen. */
export function nagCodesOf(option: NagOption): number[] {
  return option.blackNag === undefined ? [option.nag] : [option.nag, option.blackNag];
}

/** The code to write depending on whose move it is. */
export function nagCodeFor(option: NagOption, isWhiteMove: boolean): number {
  return isWhiteMove || option.blackNag === undefined ? option.nag : option.blackNag;
}

/**
 * The NAGs the editor offers, in three groups that are EXCLUSIVE among
 * themselves.
 *
 * They are three different things and a move can carry one of each: how the move
 * went ("??"), what was meant by it ("N", "→") and how the position stands
 * afterwards ("∓"). That is why choosing within a group replaces whatever that
 * group had, but does not touch the others.
 */
export const MOVE_QUALITY_NAGS: NagOption[] = [
  { nag: 3, glyph: "!!", label: "Jugada brillante", short: "Brillante" },
  { nag: 1, glyph: "!", label: "Buena jugada", short: "Buena" },
  { nag: 5, glyph: "!?", label: "Jugada interesante", short: "Interesante" },
  { nag: 6, glyph: "?!", label: "Jugada dudosa", short: "Dudosa" },
  { nag: 2, glyph: "?", label: "Error", short: "Error" },
  { nag: 4, glyph: "??", label: "Error grave", short: "Error grave" },
];

/** The time-honoured symbolic comment: what happens in the game after the move. */
export const MOVE_REMARK_NAGS: NagOption[] = [
  { nag: 7, glyph: "□", label: "Única jugada", short: "Única jugada" },
  { nag: 22, blackNag: 23, glyph: "⊙", label: "Zugzwang", short: "Zugzwang" },
  { nag: 146, glyph: "N", label: "Novedad", short: "Novedad" },
  { nag: 32, blackNag: 33, glyph: "↑↑", label: "Desarrollo", short: "Desarrollo" },
  { nag: 36, blackNag: 37, glyph: "↑", label: "Iniciativa", short: "Iniciativa" },
  { nag: 40, blackNag: 41, glyph: "→", label: "Ataque", short: "Ataque" },
  { nag: 132, blackNag: 133, glyph: "⇆", label: "Contrajuego", short: "Contrajuego" },
  { nag: 138, blackNag: 139, glyph: "⊕", label: "Problema de tiempo", short: "Apuro de tiempo" },
  { nag: 44, blackNag: 45, glyph: "=∞", label: "Con compensación", short: "Compensación" },
  { nag: 140, glyph: "Δ", label: "Con la idea", short: "Con la idea" },
];

export const POSITION_EVAL_NAGS: NagOption[] = [
  { nag: 10, glyph: "=", label: "Posición igualada", short: "Igualada" },
  { nag: 13, glyph: "∞", label: "Posición poco clara", short: "Poco clara" },
  { nag: 14, glyph: "⩲", label: "Las blancas están ligeramente mejor", short: "Blancas algo mejor" },
  { nag: 15, glyph: "⩱", label: "Las negras están ligeramente mejor", short: "Negras algo mejor" },
  { nag: 16, glyph: "±", label: "Las blancas están mejor", short: "Blancas mejor" },
  { nag: 17, glyph: "∓", label: "Las negras están mejor", short: "Negras mejor" },
  { nag: 18, glyph: "+−", label: "Las blancas están ganando", short: "Blancas ganan" },
  { nag: 19, glyph: "−+", label: "Las negras están ganando", short: "Negras ganan" },
];
