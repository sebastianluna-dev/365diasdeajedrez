import type { DrawShape } from "@lichess-org/chessground/draw";
import { Chess } from "chessops/chess";
import { ChildNode, type Game, makePgn, Node, parsePgn, type PgnNodeData, startingPosition } from "chessops/pgn";
import { makeSan, parseSan } from "chessops/san";

// Mutaciones sobre el árbol de un PGN: añadir jugadas, abrir y promover
// variantes, comentar y anotar.
//
// El compañero de pgn-tree.ts, que sólo LEE. Aquí se trabaja directamente sobre
// el `Game<PgnNodeData>` de chessops, que es mutable, y la línea principal es
// por convención `children[0]` —es lo que `makePgn` da por hecho al serializar,
// así que «promover» no es más que mover un hijo al índice 0—.
//
// LAS RUTAS SE MUEVEN. Borrar o promover reindexa a los hermanos, así que una
// ruta punteada guardada antes de la mutación puede señalar otra jugada después.
// Por eso el patrón de uso no es «calcular la ruta nueva» sino:
//
//   const node = nodeAtPathIn(game, path);   // referencia al nodo
//   promoteToMainLine(game, path);
//   const nuevaRuta = pathOfNode(game, node);
//
// Módulo puro: sólo chessops. Sin React ni Prisma.

/** Letra de color de los comandos [%cal]/[%csl], según la lee pgn-tree.ts. */
const LETTER_BY_BRUSH: Record<string, string> = { green: "G", red: "R", yellow: "Y", blue: "B" };

/** Los comandos que viven dentro de un comentario y NO son texto del autor. */
const COMMAND_PATTERN = /\[%[a-z]+(?:\s[^\]]*)?\]/g;

export function parseEditableGame(pgn: string): Game<PgnNodeData> | null {
  try {
    return parsePgn(pgn)[0] ?? null;
  } catch {
    return null;
  }
}

export function serializeGame(game: Game<PgnNodeData>): string {
  return makePgn(game);
}

/** Partida vacía desde una posición, para empezar a analizar de cero. */
export function emptyGame(initialFen?: string): Game<PgnNodeData> {
  const headers = new Map<string, string>();
  if (initialFen) {
    headers.set("SetUp", "1");
    headers.set("FEN", initialFen);
  }
  return { headers, moves: new Node<PgnNodeData>() };
}

// --- Direccionar nodos ------------------------------------------------------

/** Nodo en una ruta punteada. `""` es la raíz, que no es un `ChildNode`. */
export function nodeAtPathIn(game: Game<PgnNodeData>, path: string): ChildNode<PgnNodeData> | null {
  if (path.length === 0) return null;

  let current: Node<PgnNodeData> = game.moves;
  for (const segment of path.split(".")) {
    const index = Number.parseInt(segment, 10);
    const child: ChildNode<PgnNodeData> | undefined = current.children[index];
    if (!child) return null;
    current = child;
  }
  return current as ChildNode<PgnNodeData>;
}

/**
 * Ruta punteada de un nodo, buscándolo POR IDENTIDAD.
 *
 * Es la pieza que hace seguras a las demás: tras mutar, la ruta que se tenía
 * puede haber dejado de valer, pero la referencia al nodo sigue siendo la misma
 * y de ella se saca dónde ha quedado.
 */
export function pathOfNode(game: Game<PgnNodeData>, node: ChildNode<PgnNodeData>): string | null {
  const walk = (parent: Node<PgnNodeData>, prefix: string): string | null => {
    for (const [index, child] of parent.children.entries()) {
      const path = prefix.length > 0 ? `${prefix}.${index}` : String(index);
      if (child === node) return path;
      const found = walk(child, path);
      if (found !== null) return found;
    }
    return null;
  };
  return walk(game.moves, "");
}

/** El padre de una ruta, y el índice que ocupa el nodo dentro de él. */
function locate(
  game: Game<PgnNodeData>,
  path: string,
): { parent: Node<PgnNodeData>; index: number } | null {
  if (path.length === 0) return null;

  const segments = path.split(".");
  const index = Number.parseInt(segments[segments.length - 1], 10);
  const parentPath = segments.slice(0, -1).join(".");
  const parent = parentPath.length === 0 ? game.moves : nodeAtPathIn(game, parentPath);

  if (!parent || !parent.children[index]) return null;
  return { parent, index };
}

/** Posición sobre el tablero al final de una ruta. Null si la ruta no es legal. */
export function positionAtPath(game: Game<PgnNodeData>, path: string): Chess | null {
  const position = startingPosition(game.headers).unwrap(
    (start) => start,
    () => Chess.default(),
  );

  if (path.length === 0) return position;

  let current: Node<PgnNodeData> = game.moves;
  for (const segment of path.split(".")) {
    const child: ChildNode<PgnNodeData> | undefined = current.children[Number.parseInt(segment, 10)];
    if (!child) return null;
    const move = parseSan(position, child.data.san);
    if (!move) return null;
    position.play(move);
    current = child;
  }
  return position;
}

// --- Jugadas ----------------------------------------------------------------

export interface AddMoveResult {
  path: string;
  /** false si la jugada ya estaba: entonces sólo se navega a ella. */
  created: boolean;
}

/**
 * Añade una jugada después de `path`, o abre una variante si ese nodo ya tiene
 * continuación.
 *
 * Si la jugada YA existe entre los hijos, no se duplica: se devuelve su ruta con
 * `created: false`. Es lo que hace Lichess, y evita que repetir la línea
 * principal llene el árbol de ramas gemelas idénticas.
 *
 * Devuelve null si la jugada no es legal en esa posición.
 */
export function addMove(game: Game<PgnNodeData>, path: string, san: string): AddMoveResult | null {
  const position = positionAtPath(game, path);
  if (!position) return null;

  const move = parseSan(position, san);
  if (!move) return null;
  // Se guarda el SAN canónico de chessops, no el que llegue: así «e8=Q» y
  // «e8=Q+» no acaban como dos ramas distintas de la misma jugada.
  const canonical = makeSan(position, move);

  const parent = path.length === 0 ? game.moves : nodeAtPathIn(game, path);
  if (!parent) return null;

  const existing = parent.children.findIndex((child) => child.data.san === canonical);
  if (existing !== -1) {
    const childPath = path.length === 0 ? String(existing) : `${path}.${existing}`;
    return { path: childPath, created: false };
  }

  const child = new ChildNode<PgnNodeData>({ san: canonical });
  parent.children.push(child);

  const index = parent.children.length - 1;
  return { path: path.length === 0 ? String(index) : `${path}.${index}`, created: true };
}

/** Borra el nodo y todo lo que cuelga de él. */
export function deleteFrom(game: Game<PgnNodeData>, path: string): boolean {
  const found = locate(game, path);
  if (!found) return false;

  found.parent.children.splice(found.index, 1);
  return true;
}

/** Sube la variante una posición entre sus hermanas. */
export function promoteOneStep(game: Game<PgnNodeData>, path: string): boolean {
  const found = locate(game, path);
  if (!found || found.index === 0) return false;

  const { parent, index } = found;
  [parent.children[index - 1], parent.children[index]] = [parent.children[index], parent.children[index - 1]];
  return true;
}

/**
 * Convierte la variante en la línea principal de la partida.
 *
 * No basta con mover este nodo al índice 0: si cuelga de otra variante seguiría
 * estando dentro de un paréntesis. Hay que subir también a cada ancestro, y por
 * eso se recorre de abajo arriba.
 */
export function promoteToMainLine(game: Game<PgnNodeData>, path: string): boolean {
  const node = nodeAtPathIn(game, path);
  if (!node) return false;

  let current: ChildNode<PgnNodeData> | null = node;
  while (current) {
    const currentPath = pathOfNode(game, current);
    if (currentPath === null) return false;

    const found = locate(game, currentPath);
    if (!found) return false;
    if (found.index !== 0) {
      const [moved] = found.parent.children.splice(found.index, 1);
      found.parent.children.unshift(moved);
    }

    const parentPath = currentPath.split(".").slice(0, -1).join(".");
    current = parentPath.length === 0 ? null : nodeAtPathIn(game, parentPath);
  }
  return true;
}

// --- Comentarios, flechas y anotaciones -------------------------------------

/** El comentario partido en sus dos mitades: lo que escribió el autor y los comandos. */
function splitComment(comments: string[] | undefined): { text: string; commands: string } {
  const raw = (comments ?? []).join(" ");
  const commands = (raw.match(COMMAND_PATTERN) ?? []).join("");
  const text = raw.replace(COMMAND_PATTERN, "").replace(/\s+/g, " ").trim();
  return { text, commands };
}

function joinComment(text: string, commands: string): string[] | undefined {
  const joined = [text.trim(), commands].filter((part) => part.length > 0).join(" ");
  return joined.length > 0 ? [joined] : undefined;
}

/** El texto del comentario de un nodo, ya sin los comandos. */
export function commentTextAt(game: Game<PgnNodeData>, path: string): string {
  if (path.length === 0) return splitComment(game.comments).text;

  const node = nodeAtPathIn(game, path);
  return node ? splitComment(node.data.comments).text : "";
}

/**
 * Cambia el texto del comentario CONSERVANDO las flechas.
 *
 * Texto y comandos comparten el mismo campo del PGN —`{Buena jugada [%cal Ge2e4]}`—,
 * así que escribir el comentario entero borraría lo que dibujó el autor. Por eso
 * esto y `setShapes` sólo tocan su mitad.
 */
export function setCommentText(game: Game<PgnNodeData>, path: string, text: string): boolean {
  if (path.length === 0) {
    const { commands } = splitComment(game.comments);
    game.comments = joinComment(text, commands);
    return true;
  }

  const node = nodeAtPathIn(game, path);
  if (!node) return false;

  const { commands } = splitComment(node.data.comments);
  node.data.comments = joinComment(text, commands);
  return true;
}

/** Serializa las formas al formato que lee `parseCommentCommands`. */
function makeShapeCommands(shapes: DrawShape[]): string {
  const arrows: string[] = [];
  const circles: string[] = [];

  for (const shape of shapes) {
    const letter = LETTER_BY_BRUSH[shape.brush ?? "green"] ?? "G";
    if (shape.dest) arrows.push(`${letter}${shape.orig}${shape.dest}`);
    else circles.push(`${letter}${shape.orig}`);
  }

  return [
    circles.length > 0 ? `[%csl ${circles.join(",")}]` : "",
    arrows.length > 0 ? `[%cal ${arrows.join(",")}]` : "",
  ]
    .filter((part) => part.length > 0)
    .join("");
}

/** Cambia las flechas y casillas marcadas CONSERVANDO el texto del comentario. */
export function setShapes(game: Game<PgnNodeData>, path: string, shapes: DrawShape[]): boolean {
  const commands = makeShapeCommands(shapes);

  if (path.length === 0) {
    const { text } = splitComment(game.comments);
    game.comments = joinComment(text, commands);
    return true;
  }

  const node = nodeAtPathIn(game, path);
  if (!node) return false;

  const { text } = splitComment(node.data.comments);
  node.data.comments = joinComment(text, commands);
  return true;
}

/** Anotación de calidad ($1 = «!», $4 = «??»…). Lista vacía = quitarla. */
export function setNags(game: Game<PgnNodeData>, path: string, nags: number[]): boolean {
  const node = nodeAtPathIn(game, path);
  if (!node) return false;

  node.data.nags = nags.length > 0 ? [...nags] : undefined;
  return true;
}
