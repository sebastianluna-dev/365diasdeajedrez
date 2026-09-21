import type { DrawShape } from "@lichess-org/chessground/draw";
import { Chess } from "chessops/chess";
import { ChildNode, type Game, makePgn, Node, parsePgn, type PgnNodeData, startingPosition } from "chessops/pgn";
import { makeSan, parseSan } from "chessops/san";

// Mutations on the tree of a PGN: adding moves, opening and promoting
// variations, commenting and annotating.
//
// The companion of pgn-tree.ts, which only READS. Here the work is done
// directly on chessops's `Game<PgnNodeData>`, which is mutable, and the main
// line is by convention `children[0]` — that is what `makePgn` assumes when
// serialising, so "promoting" is no more than moving a child to index 0.
//
// PATHS MOVE. Deleting or promoting reindexes the siblings, so a dotted path
// stored before the mutation may point at another move afterwards. That is why
// the usage pattern is not "compute the new path" but:
//
//   const node = nodeAtPathIn(game, path);   // reference to the node
//   promoteToMainLine(game, path);
//   const newPath = pathOfNode(game, node);
//
// Pure module: only chessops. No React, no Prisma.

/** Colour letter of the [%cal]/[%csl] commands, as pgn-tree.ts reads it. */
const LETTER_BY_BRUSH: Record<string, string> = { green: "G", red: "R", yellow: "Y", blue: "B" };

/** The commands that live inside a comment and are NOT the author's text. */
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

/** Empty game from a position, to start analysing from scratch. */
export function emptyGame(initialFen?: string): Game<PgnNodeData> {
  const headers = new Map<string, string>();
  if (initialFen) {
    headers.set("SetUp", "1");
    headers.set("FEN", initialFen);
  }
  return { headers, moves: new Node<PgnNodeData>() };
}

// --- Addressing nodes ------------------------------------------------------

/** Node at a dotted path. `""` is the root, which is not a `ChildNode`. */
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
 * Dotted path of a node, found BY IDENTITY.
 *
 * It is the piece that makes the others safe: after mutating, the path one had
 * may have stopped being valid, but the reference to the node is still the same
 * and from it comes where it ended up.
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

/** The parent of a path, and the index the node occupies within it. */
function locate(game: Game<PgnNodeData>, path: string): { parent: Node<PgnNodeData>; index: number } | null {
  if (path.length === 0) return null;

  const segments = path.split(".");
  const index = Number.parseInt(segments[segments.length - 1], 10);
  const parentPath = segments.slice(0, -1).join(".");
  const parent = parentPath.length === 0 ? game.moves : nodeAtPathIn(game, parentPath);

  if (!parent || !parent.children[index]) return null;
  return { parent, index };
}

/** Position on the board at the end of a path. Null if the path is not legal. */
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

// --- Moves -----------------------------------------------------------------

export interface AddMoveResult {
  path: string;
  /** false when the move was already there: then it is only navigated to. */
  created: boolean;
}

/**
 * Adds a move after `path`, or opens a variation if that node already has a
 * continuation.
 *
 * If the move ALREADY exists among the children, it is not duplicated: its path
 * is returned with `created: false`. It is what Lichess does, and it keeps
 * replaying the main line from filling the tree with identical twin branches.
 *
 * Returns null if the move is not legal in that position.
 */
export function addMove(game: Game<PgnNodeData>, path: string, san: string): AddMoveResult | null {
  const position = positionAtPath(game, path);
  if (!position) return null;

  const move = parseSan(position, san);
  if (!move) return null;
  // Chessops's canonical SAN is stored, not whatever arrives: that way "e8=Q" and
  // "e8=Q+" do not end up as two different branches of the same move.
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

/** Deletes the node and everything hanging from it. */
export function deleteFrom(game: Game<PgnNodeData>, path: string): boolean {
  const found = locate(game, path);
  if (!found) return false;

  found.parent.children.splice(found.index, 1);
  return true;
}

/** Moves the variation up one place among its siblings. */
export function promoteOneStep(game: Game<PgnNodeData>, path: string): boolean {
  const found = locate(game, path);
  if (!found || found.index === 0) return false;

  const { parent, index } = found;
  [parent.children[index - 1], parent.children[index]] = [parent.children[index], parent.children[index - 1]];
  return true;
}

/**
 * Turns the variation into the game's main line.
 *
 * Moving this node to index 0 is not enough: if it hangs from another variation
 * it would still be inside parentheses. Every ancestor has to be promoted too,
 * which is why it walks from the bottom up.
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

/**
 * PGN of ONE line: from the initial position to the move at `path` and then
 * following its main continuation.
 *
 * Without siblings or parentheses, which is what is expected when copying a
 * variation to paste it somewhere else: the legal sequence of moves that leads
 * to it and how it ends. The headers travel with it so the recipient knows
 * which game it came from.
 */
export function variationPgn(game: Game<PgnNodeData>, path: string): string | null {
  if (path.length === 0) return null;

  const line: ChildNode<PgnNodeData>[] = [];
  let current: Node<PgnNodeData> = game.moves;
  for (const segment of path.split(".")) {
    const child: ChildNode<PgnNodeData> | undefined = current.children[Number.parseInt(segment, 10)];
    if (!child) return null;
    line.push(child);
    current = child;
  }

  for (let tail = current.children[0]; tail; tail = tail.children[0]) line.push(tail);

  // It is copied node by node instead of reusing the originals: chaining them
  // would move the game's real children into this throwaway tree.
  const moves = new Node<PgnNodeData>();
  let cursor: Node<PgnNodeData> = moves;
  for (const node of line) {
    const copy = new ChildNode<PgnNodeData>({ ...node.data });
    cursor.children.push(copy);
    cursor = copy;
  }

  return makePgn({ headers: new Map(game.headers), comments: game.comments, moves });
}

// --- Comments, arrows and annotations ---------------------------------------

/** The comment split into its two halves: what the author wrote and the commands. */
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

/** The text of a node's comment, already without the commands. */
export function commentTextAt(game: Game<PgnNodeData>, path: string): string {
  if (path.length === 0) return splitComment(game.comments).text;

  const node = nodeAtPathIn(game, path);
  return node ? splitComment(node.data.comments).text : "";
}

/**
 * Changes the comment text KEEPING the arrows.
 *
 * Text and commands share the same PGN field — `{Good move [%cal Ge2e4]}` —, so
 * writing the whole comment would erase what the author drew. That is why this
 * and `setShapes` only touch their own half.
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

/**
 * Writes the engine's evaluation KEEPING the text and the arrows.
 *
 * It goes in the same field as them — `{Good move [%cal Ge2e4] [%eval 0.34]}` —,
 * so only its command is replaced: `null` removes it. An empty `path` is the
 * starting position, whose evaluation lives in the root's comment.
 */
export function setEvaluation(
  game: Game<PgnNodeData>,
  path: string,
  evaluation: { score: number; mateIn: number | null } | null,
): boolean {
  const command =
    evaluation === null
      ? ""
      : evaluation.mateIn !== null
        ? `[%eval #${evaluation.mateIn}]`
        : `[%eval ${evaluation.score.toFixed(2)}]`;

  if (path.length === 0) {
    game.comments = joinComment(...withEvaluation(game.comments, command));
    return true;
  }

  const node = nodeAtPathIn(game, path);
  if (!node) return false;

  node.data.comments = joinComment(...withEvaluation(node.data.comments, command));
  return true;
}

/** The comment split into text and commands, with the `[%eval]` replaced. */
function withEvaluation(comments: string[] | undefined, command: string): [string, string] {
  const { text, commands } = splitComment(comments);
  return [text, commands.replace(/\[%eval[^\]]*\]/g, "") + command];
}

/** Serialises the shapes to the format `parseCommentCommands` reads. */
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

/** Changes the arrows and highlighted squares KEEPING the comment text. */
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

/** Quality annotation ($1 = "!", $4 = "??"…). Empty list = remove it. */
export function setNags(game: Game<PgnNodeData>, path: string, nags: number[]): boolean {
  const node = nodeAtPathIn(game, path);
  if (!node) return false;

  node.data.nags = nags.length > 0 ? [...nags] : undefined;
  return true;
}
