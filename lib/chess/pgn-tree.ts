import type { DrawShape } from "@lichess-org/chessground/draw";
import type { Key } from "@lichess-org/chessground/types";
import { Chess, type Position } from "chessops/chess";
import { chessgroundMove } from "chessops/compat";
import { makeFen } from "chessops/fen";
import { parsePgn, startingPosition, type ChildNode, type PgnNodeData } from "chessops/pgn";
import { parseSan } from "chessops/san";

// Árbol completo de un PGN: variantes, comentarios, NAGs y anotaciones
// visuales ([%cal] flechas, [%csl] casillas, [%diagram] diagrama forzado).
// Complementa a replay.ts (que sólo sigue la línea principal y el blog usa).
//
// La ruta punteada ("0", "0.1.0", ...) son los índices de hijo desde la raíz
// y es el formato canónico de TrainingExercise.path y ClassBlock.movePath.

export interface PgnTreeNode {
  path: string;
  san: string;
  /** Ply 1-based desde la posición inicial de SU línea troncal. */
  ply: number;
  fen: string;
  lastMove?: [Key, Key];
  check: boolean;
  comment?: string;
  nags: number[];
  shapes: DrawShape[];
  showDiagram: boolean;
  children: PgnTreeNode[];
}

export interface PgnTree {
  initialFen: string;
  initialComment?: string;
  initialShapes: DrawShape[];
  /** children[0] es la continuación principal. */
  children: PgnTreeNode[];
  nodesByPath: Map<string, PgnTreeNode>;
  /**
   * Ramas descartadas por contener jugadas ilegales o no parseables. Vacío
   * cuando el PGN es correcto; la interfaz lo muestra en desarrollo para que
   * un PGN mal cargado no se vea simplemente «recortado».
   */
  warnings: string[];
}

const BRUSH_BY_LETTER: Record<string, string> = { G: "green", R: "red", Y: "yellow", B: "blue" };

function parseCommentCommands(comments: string[] | undefined): {
  text?: string;
  shapes: DrawShape[];
  showDiagram: boolean;
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

  return { text: text.length > 0 ? text : undefined, shapes, showDiagram };
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
      // SAN ilegal: se descarta esa rama y se anota; el resto del árbol sigue.
      const at = parentPath.length > 0 ? `tras la ruta "${parentPath}"` : "en la posición inicial";
      warnings.push(`Jugada ilegal o no reconocida "${child.data.san}" ${at} (jugada ${ply}).`);
      return;
    }

    const next = pos.clone();
    next.play(move);
    const [from, to] = chessgroundMove(move);
    const path = parentPath.length > 0 ? `${parentPath}.${index}` : `${index}`;
    const { text, shapes, showDiagram } = parseCommentCommands(child.data.comments);

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
      children: [],
    };
    node.children = walk(child.children, next, path, ply + 1, nodesByPath, warnings);
    nodesByPath.set(path, node);
    result.push(node);
  });

  return result;
}

/** Parsea el PGN completo a árbol. Devuelve null si no hay nada parseable. */
export function parsePgnTree(pgn: string): PgnTree | null {
  const game = parsePgn(pgn)[0];
  if (!game) return null;

  const pos = startingPosition(game.headers).unwrap(
    (start) => start,
    () => Chess.default(),
  );

  const nodesByPath = new Map<string, PgnTreeNode>();
  const warnings: string[] = [];
  const { text, shapes } = parseCommentCommands(game.comments);
  const children = walk(game.moves.children, pos, "", 1, nodesByPath, warnings);

  return {
    initialFen: makeFen(pos.toSetup()),
    initialComment: text,
    initialShapes: shapes,
    children,
    nodesByPath,
    warnings,
  };
}

/** Nodo en una ruta punteada; undefined para "" (posición inicial) o ruta rota. */
export function nodeAtPath(tree: PgnTree, path: string): PgnTreeNode | undefined {
  return path.length > 0 ? tree.nodesByPath.get(path) : undefined;
}

/** Ruta del padre ("" si el nodo cuelga de la raíz). */
export function parentPathOf(path: string): string {
  const cut = path.lastIndexOf(".");
  return cut === -1 ? "" : path.slice(0, cut);
}

/** Siguiente jugada de la línea actual (el hijo principal). */
export function nextPathOf(tree: PgnTree, path: string): string | undefined {
  const children = path.length === 0 ? tree.children : nodeAtPath(tree, path)?.children;
  return children?.[0]?.path;
}

/** Final de la línea actual siguiendo siempre el hijo principal. */
export function endPathOf(tree: PgnTree, path: string): string {
  let current = path;
  for (;;) {
    const next = nextPathOf(tree, current);
    if (!next) return current;
    current = next;
  }
}

/** Glifo de un NAG numérico ($1, $14, ...) para mostrar junto al SAN. */
const NAG_GLYPHS: Record<number, string> = {
  1: "!",
  2: "?",
  3: "!!",
  4: "??",
  5: "!?",
  6: "?!",
  10: "=",
  13: "∞",
  14: "⩲",
  15: "⩱",
  16: "±",
  17: "∓",
  18: "+−",
  19: "−+",
};

export function nagGlyph(nag: number): string {
  return NAG_GLYPHS[nag] ?? `$${nag}`;
}

export interface NagOption {
  nag: number;
  glyph: string;
  label: string;
}

/**
 * Los NAGs que ofrece el editor, en dos grupos EXCLUYENTES entre sí.
 *
 * Son dos cosas distintas y una jugada puede llevar una de cada: qué tal fue la
 * jugada («??») y cómo queda la posición después («∓»). Por eso elegir dentro de
 * un grupo sustituye lo que hubiera de ese grupo, pero no toca al otro.
 */
export const MOVE_QUALITY_NAGS: NagOption[] = [
  { nag: 3, glyph: "!!", label: "Jugada brillante" },
  { nag: 1, glyph: "!", label: "Buena jugada" },
  { nag: 5, glyph: "!?", label: "Jugada interesante" },
  { nag: 6, glyph: "?!", label: "Jugada dudosa" },
  { nag: 2, glyph: "?", label: "Error" },
  { nag: 4, glyph: "??", label: "Error grave" },
];

export const POSITION_EVAL_NAGS: NagOption[] = [
  { nag: 10, glyph: "=", label: "Posición igualada" },
  { nag: 13, glyph: "∞", label: "Posición poco clara" },
  { nag: 14, glyph: "⩲", label: "Blancas algo mejor" },
  { nag: 15, glyph: "⩱", label: "Negras algo mejor" },
  { nag: 16, glyph: "±", label: "Blancas mejor" },
  { nag: 17, glyph: "∓", label: "Negras mejor" },
  { nag: 18, glyph: "+−", label: "Blancas ganan" },
  { nag: 19, glyph: "−+", label: "Negras ganan" },
];
