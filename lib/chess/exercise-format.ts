import { Chess, type Position } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { ChildNode, type Game, makePgn, Node, parsePgn, type PgnNodeData, startingPosition } from "chessops/pgn";
import { makeSan, parseSan } from "chessops/san";
import type { ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { nodeAtPathIn, parseEditableGame, positionAtPath } from "./pgn-edit";
import { parsePgnTree, type PgnTree, type PgnTreeNode } from "./pgn-tree";
import { positionPlausibility } from "./position-setup";

// An exercise's solution as it is authored and stored (docs → Chess →
// Library, «Exercises: the format and the solver»): a PGN whose `[FEN]` is the start position and whose moves are
// the answer, the player's moves and the opponent's replies, with variants,
// comments and NAGs. The player is the side to move at the start.
//
// Pure module: only chessops. The editor runs it live in the browser, and the
// server runs the same functions on every save, so what the author is told
// and what the save refuses never disagree. Solving it is exercise-solver.ts.

/** The longest «Mate en N» an author may label (the column's CHECK, exercise_mate_in_range). */
export const MATE_IN_MAX = 5;

/** «Mate en N» up to this N is proven by an exhaustive search; above it, the author's lines are trusted. */
export const FORCED_MATE_SEARCH_MAX = 2;

/** The NAGs that mark a move as a mistake: ? ($2), ?? ($4) and ?! ($6). */
const MISTAKE_NAGS = new Set([2, 4, 6]);

/** The `[Variant]` values a solution may carry: none, or the two that mean standard chess. */
const STANDARD_VARIANTS = new Set(["", "standard", "from position"]);

export interface SolutionInput {
  solutionPgn: string;
  kind: ExerciseKindCode;
  mateIn: number | null;
}

/** What every save needs, a draft included: a readable start and the frozen columns. */
export type SolutionStart =
  | { ok: true; normalizedPgn: string; startFen: string; solutionPlies: number; playerMoves: number }
  | { ok: false; problem: "unreadable" | "badPosition" | "unsupportedVariant" };

export type SolutionProblem =
  | { code: "unreadable" }
  | { code: "badPosition" }
  | { code: "unsupportedVariant" }
  | { code: "noMoves" }
  /** A branch `parsePgnTree` stopped reading; `detail` is its warning. */
  | { code: "illegalMove"; detail: string }
  | { code: "mateInMissing" }
  | { code: "mateInOnSequence" }
  /** A MATE_IN line that does not end with the PLAYER's move mating. */
  | { code: "notMate"; path: string }
  /** A MATE_IN line with more than N player moves. */
  | { code: "mateTooLong"; path: string }
  /** The main line mates in fewer than N player moves. */
  | { code: "mateLengthMismatch" }
  /** N ≤ 2: a defence the tree does not hold escapes mate in N. */
  | { code: "notForced" }
  /** An accepted player variant whose move carries $2, $4 or $6 (?, ??, ?!). */
  | { code: "mistakeVariant"; path: string };

export type SolutionWarning =
  /** The opponent's variants are shown in the solution, never played: replies follow the main line. */
  | { code: "opponentVariant"; path: string }
  /** Several player moves accepted at one point («Se aceptan: Ab8#, Da8#»); `at` is the node before them. */
  | { code: "playerAlternatives"; at: string; sans: string[] }
  /** SEQUENCE: an accepted variant, starting at `path`, ends before the main line does. */
  | { code: "shortAlternative"; path: string };

export type SolutionAnalysis =
  | {
      ok: true;
      normalizedPgn: string;
      startFen: string;
      solutionPlies: number;
      playerMoves: number;
      warnings: SolutionWarning[];
    }
  | { ok: false; problems: SolutionProblem[]; warnings: SolutionWarning[] };

// --- Reading the start -------------------------------------------------------

function readGame(pgn: string): Game<PgnNodeData> | null {
  try {
    return parsePgn(pgn)[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * The start position of a game, or why it cannot be one. It does not trust
 * `parsePgnTree`'s fallback, which turns a broken `[FEN]` into the standard
 * start: a `[Variant]` other than standard chess, a FEN chessops refuses and a
 * position `positionPlausibility` rules out are all refusals.
 */
function readStart(headers: Map<string, string>): Chess | "badPosition" | "unsupportedVariant" {
  const variant = (headers.get("Variant") ?? "").trim().toLowerCase();
  if (!STANDARD_VARIANTS.has(variant)) return "unsupportedVariant";

  const start = startingPosition(headers);
  if (start.isErr) return "badPosition";
  const pos = start.value as Chess;
  return positionPlausibility(pos) ? "badPosition" : pos;
}

/**
 * The tree's legal part, copied: every move re-read on its position and
 * written as chessops' canonical SAN (`Rd8` becomes `Rd8#`), and a branch cut
 * where its first illegal move stands, exactly where `parsePgnTree` stops
 * reading it. Comments, NAGs and `[%cal]` travel with each move.
 */
function legalCopy(source: Node<PgnNodeData>, pos: Position, target: Node<PgnNodeData>): void {
  for (const child of source.children) {
    const move = parseSan(pos, child.data.san);
    if (!move) continue;
    const copy = new ChildNode<PgnNodeData>({ ...child.data, san: makeSan(pos, move) });
    target.children.push(copy);
    const next = pos.clone();
    next.play(move);
    legalCopy(child, next, copy);
  }
}

/**
 * The reading every save shares, a draft's included: the start position and
 * the frozen columns, deterministic for any readable PGN.
 *
 * - `startFen` is chessops' normalised start (an impossible castling right or
 *   en passant square dropped), and the stored PGN's `[FEN]` is rewritten to
 *   it, so the header, `startFen` and its hash never disagree.
 * - `solutionPlies` counts the legal main line up to its first illegal move;
 *   `playerMoves` the player's moves among those plies.
 * - `normalizedPgn` keeps only `SetUp`/`FEN` (the source lives in columns)
 *   and the legal part of the tree.
 *
 * Reading the stored `normalizedPgn` again gives the same result.
 */
export function readSolutionStart(pgn: string): SolutionStart {
  const game = readGame(pgn);
  if (!game) return { ok: false, problem: "unreadable" };
  // chessops reads any text as a game; one with no start of its own, no moves
  // and no comment had nothing in it to read.
  if (!game.headers.has("FEN") && game.moves.children.length === 0 && !game.comments?.length) {
    return { ok: false, problem: "unreadable" };
  }

  const start = readStart(game.headers);
  if (typeof start === "string") return { ok: false, problem: start };

  const startFen = makeFen(start.toSetup());
  const moves = new Node<PgnNodeData>();
  legalCopy(game.moves, start, moves);

  let solutionPlies = 0;
  for (let node = moves.children[0]; node; node = node.children[0]) solutionPlies += 1;

  const normalized: Game<PgnNodeData> = {
    headers: new Map([
      ["SetUp", "1"],
      ["FEN", startFen],
    ]),
    comments: game.comments,
    moves,
  };

  return {
    ok: true,
    normalizedPgn: makePgn(normalized),
    startFen,
    solutionPlies,
    playerMoves: Math.ceil(solutionPlies / 2),
  };
}

// --- The readiness gate --------------------------------------------------------

/** Depth 0 is the first move, the player's: every even depth is the player's. */
const isPlayerDepth = (depth: number) => depth % 2 === 0;

const hasMistakeNag = (nags: readonly number[] | undefined) => (nags ?? []).some((nag) => MISTAKE_NAGS.has(nag));

/** Every leaf of the tree with the nodes that lead to it (the main line's first). */
function linesOf(children: PgnTreeNode[], prefix: PgnTreeNode[] = []): PgnTreeNode[][] {
  return children.flatMap((child) => {
    const line = [...prefix, child];
    return child.children.length === 0 ? [line] : linesOf(child.children, line);
  });
}

function positionOf(fen: string): Chess {
  return Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
}

/** Whether the side to move can be mated in `n` of the OTHER side's moves, against every defence. */
function matesInAtMost(pos: Chess, moves: number): boolean {
  if (pos.isCheckmate()) return true;
  if (moves === 0 || pos.isEnd()) return false;
  // The defender moves first, then the attacker needs a mate in `moves`.
  for (const [from, dests] of pos.allDests()) {
    for (const to of dests) {
      for (const move of movesFor(pos, from, to)) {
        const defended = pos.clone();
        defended.play(move);
        if (!canMateIn(defended, moves)) return false;
      }
    }
  }
  return true;
}

/** Whether the side to move mates in at most `moves` of its own moves, whatever the defence. */
function canMateIn(pos: Chess, moves: number): boolean {
  if (moves === 0 || pos.isEnd()) return false;
  for (const [from, dests] of pos.allDests()) {
    for (const to of dests) {
      for (const move of movesFor(pos, from, to)) {
        const next = pos.clone();
        next.play(move);
        if (next.isCheckmate()) return true;
        if (moves > 1 && !next.isEnd() && matesInAtMost(next, moves - 1)) return true;
      }
    }
  }
  return false;
}

/** A from/to pair as moves: a pawn reaching the last rank is four. */
function movesFor(pos: Chess, from: number, to: number) {
  const isPromotion = pos.board.pawn.has(from) && (to >> 3 === 0 || to >> 3 === 7);
  if (!isPromotion) return [{ from, to }];
  return (["queen", "rook", "bishop", "knight"] as const).map((promotion) => ({ from, to, promotion }));
}

/**
 * The tree as the solver walks it: every player move (the main one and its
 * variants), and only the main reply. Each node comes with its depth and the
 * path of the player variant it is reached through, if any.
 */
function walkReachable(
  tree: PgnTree,
  visit: (
    node: PgnTreeNode,
    context: { depth: number; siblings: PgnTreeNode[]; index: number; branch: string | null },
  ) => void,
): void {
  const walk = (children: PgnTreeNode[], depth: number, branch: string | null) => {
    const followed = isPlayerDepth(depth) ? children : children.slice(0, 1);
    followed.forEach((child, index) => {
      const through = branch ?? (index > 0 ? child.path : null);
      visit(child, { depth, siblings: children, index, branch: through });
      walk(child.children, depth + 1, through);
    });
  };
  walk(tree.children, 0, null);
}

function warningsOf(tree: PgnTree, kind: ExerciseKindCode): SolutionWarning[] {
  const warnings: SolutionWarning[] = [];
  const mainLength = linesOf(tree.children)[0]?.length ?? 0;
  const shortFrom = new Set<string>();

  if (tree.children.length > 1) {
    warnings.push({ code: "playerAlternatives", at: "", sans: tree.children.map((child) => child.san) });
  }
  walkReachable(tree, (node, { depth, siblings, index, branch }) => {
    if (!isPlayerDepth(depth) && index === 0) {
      for (const variant of siblings.slice(1)) warnings.push({ code: "opponentVariant", path: variant.path });
    }
    // The player moves next at a reply's children.
    if (!isPlayerDepth(depth) && node.children.length > 1) {
      warnings.push({ code: "playerAlternatives", at: node.path, sans: node.children.map((child) => child.san) });
    }
    if (kind === "SEQUENCE" && node.children.length === 0 && branch !== null && depth + 1 < mainLength) {
      shortFrom.add(branch);
    }
  });
  for (const path of shortFrom) warnings.push({ code: "shortAlternative", path });
  return warnings;
}

function mateProblems(tree: PgnTree, mateIn: number): SolutionProblem[] {
  const problems: SolutionProblem[] = [];
  const lines = linesOf(tree.children);

  for (const line of lines) {
    const last = line[line.length - 1];
    if (!last) continue;
    const byPlayer = isPlayerDepth(line.length - 1);
    if (!byPlayer || !positionOf(last.fen).isCheckmate()) problems.push({ code: "notMate", path: last.path });
    if (Math.ceil(line.length / 2) > mateIn) problems.push({ code: "mateTooLong", path: last.path });
  }

  const main = lines[0] ?? [];
  const mainEnd = main[main.length - 1];
  const mainMates = mainEnd !== undefined && isPlayerDepth(main.length - 1) && positionOf(mainEnd.fen).isCheckmate();
  if (mainMates && Math.ceil(main.length / 2) < mateIn) problems.push({ code: "mateLengthMismatch" });

  const key = main[0];
  if (key && mateIn <= FORCED_MATE_SEARCH_MAX && !matesInAtMost(positionOf(key.fen), mateIn - 1)) {
    problems.push({ code: "notForced" });
  }
  return problems;
}

/**
 * The readiness gate (READY, PUBLISHED, an import as ready):
 * `readSolutionStart` plus every rule below (docs → Chess → Library).
 *
 * - The solution has moves, and none was cut as illegal.
 * - The kind and `mateIn` agree: «Mate en N» needs an N from 1 to
 *   `MATE_IN_MAX`, a sequence has none.
 * - No accepted player variant carries a mistake NAG: every variant is an
 *   accepted answer, so a refuted try copied from a study must go first.
 * - «Mate en N»: every line ends with the player's move mating, none takes
 *   more than N player moves, the main line takes exactly N, and for
 *   N ≤ `FORCED_MATE_SEARCH_MAX` the key move mates in N against every
 *   defence (an exhaustive search by the rules, never an engine).
 *
 * Warnings never block: the opponent's variants are not played, the accepted
 * alternatives are listed, and a sequence's variant that stops early is named.
 */
export function analyzeSolution(input: SolutionInput): SolutionAnalysis {
  const start = readSolutionStart(input.solutionPgn);
  if (!start.ok) return { ok: false, problems: [{ code: start.problem }], warnings: [] };

  const problems: SolutionProblem[] = [];
  for (const detail of parsePgnTree(input.solutionPgn)?.warnings ?? []) problems.push({ code: "illegalMove", detail });

  const tree = parsePgnTree(start.normalizedPgn);
  if (!tree) return { ok: false, problems: [{ code: "unreadable" }], warnings: [] };
  if (tree.children.length === 0) problems.push({ code: "noMoves" });

  const validMateIn =
    input.mateIn !== null && Number.isInteger(input.mateIn) && input.mateIn >= 1 && input.mateIn <= MATE_IN_MAX;
  if (input.kind === "MATE_IN" && !validMateIn) problems.push({ code: "mateInMissing" });
  if (input.kind === "SEQUENCE" && input.mateIn !== null) problems.push({ code: "mateInOnSequence" });

  walkReachable(tree, (node, { depth, index }) => {
    if (isPlayerDepth(depth) && index > 0 && hasMistakeNag(node.nags)) {
      problems.push({ code: "mistakeVariant", path: node.path });
    }
  });

  if (input.kind === "MATE_IN" && validMateIn && input.mateIn !== null && tree.children.length > 0) {
    problems.push(...mateProblems(tree, input.mateIn));
  }

  const warnings = warningsOf(tree, input.kind);
  if (problems.length > 0) return { ok: false, problems, warnings };
  return {
    ok: true,
    normalizedPgn: start.normalizedPgn,
    startFen: start.startFen,
    solutionPlies: start.solutionPlies,
    playerMoves: start.playerMoves,
    warnings,
  };
}

// --- Shaping a solution ----------------------------------------------------------

/**
 * «Quitar las variantes marcadas como error» (the editor, the D11 seed and the
 * import): drops every player variant — a player move that is not its node's
 * main child — carrying $2, $4 or $6, with what hangs from it. A PGN chessops
 * cannot read is given back as it came.
 */
export function dropMistakeVariants(pgn: string): string {
  const game = readGame(pgn);
  if (!game) return pgn;

  const prune = (node: Node<PgnNodeData>, depth: number) => {
    if (isPlayerDepth(depth)) {
      node.children = node.children.filter((child, index) => index === 0 || !hasMistakeNag(child.data.nags));
    }
    for (const child of node.children) prune(child, depth + 1);
  };
  prune(game.moves, 0);
  return makePgn(game);
}

/** The editor's empty solution over a position: `[SetUp]`/`[FEN]` and no moves. */
export function emptySolutionPgn(startFen: string): string {
  return makePgn({
    headers: new Map([
      ["SetUp", "1"],
      ["FEN", startFen],
    ]),
    moves: new Node<PgnNodeData>(),
  });
}

/** A node's subtree copied node by node: reusing the nodes would move them out of the game they belong to. */
function copySubtree(source: Node<PgnNodeData>, target: Node<PgnNodeData>): void {
  for (const child of source.children) {
    const copy = new ChildNode<PgnNodeData>({
      ...child.data,
      nags: child.data.nags ? [...child.data.nags] : undefined,
      comments: child.data.comments ? [...child.data.comments] : undefined,
    });
    target.children.push(copy);
    copySubtree(child, copy);
  }
}

/**
 * «Crear ejercicio desde aquí» and «Desde una partida» (D11): the position
 * after the move at `path` («» is the game's start) and, as the solution,
 * everything that follows it — all its children, their variants, comments and
 * NAGs. Null for a game that does not read or a path it does not hold.
 */
export function exerciseSeedFromGame(gamePgn: string, path: string): { startFen: string; solutionPgn: string } | null {
  const game = parseEditableGame(gamePgn);
  if (!game) return null;
  const position = positionAtPath(game, path);
  if (!position) return null;
  const node = path.length === 0 ? game.moves : nodeAtPathIn(game, path);
  if (!node) return null;

  const startFen = makeFen(position.toSetup());
  const moves = new Node<PgnNodeData>();
  copySubtree(node, moves);
  return {
    startFen,
    solutionPgn: makePgn({
      headers: new Map([
        ["SetUp", "1"],
        ["FEN", startFen],
      ]),
      moves,
    }),
  };
}

/** The seed's and the phase 2 migration's shape: a frozen line of SANs as a solution PGN. */
export function solutionPgnFromLine(startFen: string, sans: readonly string[]): string {
  const moves = new Node<PgnNodeData>();
  let cursor: Node<PgnNodeData> = moves;
  for (const san of sans) {
    const child = new ChildNode<PgnNodeData>({ san });
    cursor.children.push(child);
    cursor = child;
  }
  return makePgn({
    headers: new Map([
      ["SetUp", "1"],
      ["FEN", startFen],
    ]),
    moves,
  });
}
