import type { DrawShape } from "@lichess-org/chessground/draw";
import type { Key } from "@lichess-org/chessground/types";
import { Chess, type Position } from "chessops/chess";
import { chessgroundMove } from "chessops/compat";
import { makeFen } from "chessops/fen";
import { parsePgn, startingPosition, type ChildNode, type PgnNodeData } from "chessops/pgn";
import { parseSan } from "chessops/san";
import { findMalformedMoveTokens } from "./movetext-scan";

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
  // Lo que ni siquiera llegó al árbol va primero: el tokenizador de chessops
  // descarta los tokens sin forma de jugada antes de que `walk` los vea, así
  // que ese aviso hay que sacarlo del texto crudo.
  const warnings = findMalformedMoveTokens(pgn).map(
    (token) => `Token no reconocido como jugada: "${token}". Esa rama no se ha cargado.`,
  );
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

/**
 * Los SAN desde la posición inicial hasta la jugada de `path`, en orden.
 *
 * Es lo que convierte «esta posición del visor» en el formato que guardan los
 * ejercicios y el seed («e4 c5 Nf3»). Ante una ruta rota devuelve la lista
 * vacía: media línea sería peor que ninguna, porque se guardaría sin avisar.
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

/** Final de la línea actual siguiendo siempre el hijo principal. */
export function endPathOf(tree: PgnTree, path: string): string {
  let current = path;
  for (;;) {
    const next = nextPathOf(tree, current);
    if (!next) return current;
    current = next;
  }
}

/**
 * Glifo de un NAG numérico ($1, $14, ...) para mostrar junto al SAN.
 *
 * Los códigos que van en pareja (blancas/negras) comparten símbolo: «↑» es la
 * iniciativa, la tenga quien la tenga, y quién la tiene ya lo dice de quién es
 * la jugada. Los números son los del estándar PGN, con las extensiones que usa
 * ChessBase para novedad ($146), idea ($140) y apuro de tiempo ($138).
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
  /** El código que se escribe cuando la jugada es de las blancas. */
  nag: number;
  /**
   * El mismo símbolo para una jugada de las negras. El PGN distingue bando en
   * casi todos los comentarios simbólicos —$36 es «las blancas tienen la
   * iniciativa» y $37 el equivalente negro—, así que se guarda el que
   * corresponde en vez de escribir siempre el de las blancas.
   */
  blackNag?: number;
  glyph: string;
  label: string;
}

/** Los códigos que ocupa una opción, para saber qué sustituye al elegirla. */
export function nagCodesOf(option: NagOption): number[] {
  return option.blackNag === undefined ? [option.nag] : [option.nag, option.blackNag];
}

/** El código que toca escribir según de quién sea la jugada. */
export function nagCodeFor(option: NagOption, isWhiteMove: boolean): number {
  return isWhiteMove || option.blackNag === undefined ? option.nag : option.blackNag;
}

/**
 * Los NAGs que ofrece el editor, en tres grupos EXCLUYENTES entre sí.
 *
 * Son tres cosas distintas y una jugada puede llevar una de cada: qué tal fue
 * la jugada («??»), qué se quiso decir con ella («N», «→») y cómo queda la
 * posición después («∓»). Por eso elegir dentro de un grupo sustituye lo que
 * hubiera de ese grupo, pero no toca a los otros.
 */
export const MOVE_QUALITY_NAGS: NagOption[] = [
  { nag: 3, glyph: "!!", label: "Jugada brillante" },
  { nag: 1, glyph: "!", label: "Buena jugada" },
  { nag: 5, glyph: "!?", label: "Jugada interesante" },
  { nag: 6, glyph: "?!", label: "Jugada dudosa" },
  { nag: 2, glyph: "?", label: "Error" },
  { nag: 4, glyph: "??", label: "Error grave" },
];

/** El comentario simbólico de siempre: qué pasa en la partida tras la jugada. */
export const MOVE_REMARK_NAGS: NagOption[] = [
  { nag: 7, glyph: "□", label: "Única jugada" },
  { nag: 22, blackNag: 23, glyph: "⊙", label: "Zugzwang" },
  { nag: 146, glyph: "N", label: "Novedad" },
  { nag: 32, blackNag: 33, glyph: "↑↑", label: "Desarrollo" },
  { nag: 36, blackNag: 37, glyph: "↑", label: "Iniciativa" },
  { nag: 40, blackNag: 41, glyph: "→", label: "Ataque" },
  { nag: 132, blackNag: 133, glyph: "⇆", label: "Contrajuego" },
  { nag: 138, blackNag: 139, glyph: "⊕", label: "Problema de tiempo" },
  { nag: 44, blackNag: 45, glyph: "=∞", label: "Con compensación" },
  { nag: 140, glyph: "Δ", label: "Con la idea" },
];

export const POSITION_EVAL_NAGS: NagOption[] = [
  { nag: 10, glyph: "=", label: "Posición igualada" },
  { nag: 13, glyph: "∞", label: "Posición poco clara" },
  { nag: 14, glyph: "⩲", label: "Las blancas están ligeramente mejor" },
  { nag: 15, glyph: "⩱", label: "Las negras están ligeramente mejor" },
  { nag: 16, glyph: "±", label: "Las blancas están mejor" },
  { nag: 17, glyph: "∓", label: "Las negras están mejor" },
  { nag: 18, glyph: "+−", label: "Las blancas están ganando" },
  { nag: 19, glyph: "−+", label: "Las negras están ganando" },
];
