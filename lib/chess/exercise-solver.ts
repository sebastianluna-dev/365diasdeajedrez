import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { makeSan, parseSan } from "chessops/san";
import { makeSquare, makeUci } from "chessops/util";
import type { ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import type { ExerciseOutcome } from "@/lib/training/review-schedule";
import { readSolutionStart } from "./exercise-format";
import { nodeAtPath, parsePgnTree, type PgnTree, type PgnTreeNode } from "./pgn-tree";

// Solving an exercise (docs → Chess → Library, «Exercises: the format and the
// solver»): the student plays the player's moves, the platform answers
// with the opponent's main reply, until the line ends. The first wrong move
// decides the attempt as failed (D19); «Ver la solución» does too (D20); a
// hint shows the author's texts, then the piece to move (D37).
//
// Pure module: only chessops. The solve screen runs it in the browser, and
// the server replays the submitted moves with `replayAttempt`, so the stored
// result is the server's, never the client's word.

export interface SolverExercise {
  solutionPgn: string;
  kind: ExerciseKindCode;
  mateIn: number | null;
  hints: readonly string[];
}

export interface Solution {
  tree: PgnTree;
  player: "white" | "black";
  kind: ExerciseKindCode;
  mateIn: number | null;
  hints: readonly string[];
}

/** The solution ready to solve, or null when it does not read or has no moves. */
export function readSolution(exercise: SolverExercise): Solution | null {
  const start = readSolutionStart(exercise.solutionPgn);
  if (!start.ok) return null;
  const tree = parsePgnTree(start.normalizedPgn);
  if (!tree || tree.children.length === 0) return null;
  return {
    tree,
    player: start.startFen.split(" ")[1] === "b" ? "black" : "white",
    kind: exercise.kind,
    mateIn: exercise.mateIn,
    hints: exercise.hints.map((hint) => hint.trim()).filter((hint) => hint.length > 0),
  };
}

export interface Mistake {
  /** 1-based ply within the solution, so it can be crossed with `reachedPly`. */
  ply: number;
  /** The position the wrong move was played in. */
  fen: string;
  playedSan: string;
  /** The main child's move: the one the platform would have accepted first. Canonical SAN. */
  expectedSan: string;
  hintShownBefore: boolean;
}

export interface PlayedMove {
  /** Canonical SAN (chessops' `makeSan`). */
  san: string;
  /** `hintsUsed` when it was played. */
  hintsBefore: number;
}

export interface SolveState {
  /** Node the board stands on: "" at the start; always a node where the player moves, or the end. */
  path: string;
  fen: string;
  /** Decided as failed: a wrong move (D19) or «Ver la solución» (D20). Further moves teach, they do not score. */
  failed: boolean;
  firstMistake: Mistake | null;
  hintsUsed: number;
  textHintsShown: number;
  /** Square of the piece to move, while a piece hint is on (D37). */
  hintSquare: string | null;
  solutionShown: boolean;
  completed: boolean;
  /**
   * For the attempt: player moves along the line taken, right first time, and
   * plies reached. Frozen once the attempt is decided as failed: what is
   * played afterwards is not the attempt's.
   */
  requiredMoves: number;
  correctMoves: number;
  reachedPly: number;
  /** The player's matched moves, in order, as the decision's record takes them. */
  played: PlayedMove[];
  /** The decision point: the moves (SAN) up to it, and hintsUsed at each, for the server's replay. */
  decisive: { moves: PlayedMove[]; at: "wrongMove" | "solution" | "completed" } | null;
}

/** Plies from the start to the node at `path`. */
const pliesTo = (path: string) => (path.length === 0 ? 0 : path.split(".").length);

function childrenAt(solution: Solution, path: string): PgnTreeNode[] {
  return path.length === 0 ? solution.tree.children : (nodeAtPath(solution.tree, path)?.children ?? []);
}

function positionOf(fen: string): Chess {
  return Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
}

/** Player moves of the line through `path` that then follows the main continuation to its end. */
function requiredMovesThrough(solution: Solution, path: string): number {
  let plies = pliesTo(path);
  for (let next = childrenAt(solution, path)[0]; next; next = next.children[0]) plies += 1;
  return Math.ceil(plies / 2);
}

export function startSolving(solution: Solution): SolveState {
  return {
    path: "",
    fen: solution.tree.initialFen,
    failed: false,
    firstMistake: null,
    hintsUsed: 0,
    textHintsShown: 0,
    hintSquare: null,
    solutionShown: false,
    completed: false,
    requiredMoves: requiredMovesThrough(solution, ""),
    correctMoves: 0,
    reachedPly: 0,
    played: [],
    decisive: null,
  };
}

export type MoveResult =
  | { kind: "illegal" }
  | {
      kind: "correct";
      state: SolveState;
      playerPath: string;
      reply: { san: string; path: string } | null;
      completed: boolean;
    }
  | { kind: "wrong"; state: SolveState; mistake: Mistake; isFirst: boolean };

/**
 * The player's move, as the board gives it (SAN from a FEN). It matches any
 * child of the node, the main line or a variant (D02), compared as moves and
 * not as text, so «Rd8» is «Rd8#» and «=N» is not «=Q»; a matched variant is
 * followed from then on, and the platform answers with the main reply (D01).
 * A move outside the tree is wrong, even one that mates (D02); the first wrong
 * move decides the attempt (D19), and the board takes it back.
 */
export function playMove(solution: Solution, state: SolveState, san: string): MoveResult {
  if (state.completed) return { kind: "illegal" };
  const pos = positionOf(state.fen);
  const move = parseSan(pos, san);
  if (!move) return { kind: "illegal" };

  const uci = makeUci(move);
  const children = childrenAt(solution, state.path);
  const match = children.find((child) => {
    const candidate = parseSan(pos, child.san);
    return candidate !== undefined && makeUci(candidate) === uci;
  });
  const playedSan = makeSan(pos, move);

  if (match) {
    const reply = match.children[0] ?? null;
    const end = reply ?? match;
    const completed = end.children.length === 0;
    const played = [...state.played, { san: playedSan, hintsBefore: state.hintsUsed }];
    const next: SolveState = {
      ...state,
      path: end.path,
      fen: end.fen,
      hintSquare: null,
      completed,
      played,
      ...(state.failed
        ? {}
        : {
            correctMoves: state.correctMoves + 1,
            reachedPly: pliesTo(end.path),
            requiredMoves: requiredMovesThrough(solution, end.path),
          }),
      decisive: state.decisive ?? (completed && !state.failed ? { moves: played, at: "completed" as const } : null),
    };
    return {
      kind: "correct",
      state: next,
      playerPath: match.path,
      reply: reply ? { san: reply.san, path: reply.path } : null,
      completed,
    };
  }

  const expected = children[0];
  const expectedMove = expected ? parseSan(pos, expected.san) : undefined;
  const mistake: Mistake = {
    ply: pliesTo(state.path) + 1,
    fen: state.fen,
    playedSan,
    expectedSan: expectedMove ? makeSan(pos, expectedMove) : (expected?.san ?? ""),
    hintShownBefore: state.hintsUsed > 0,
  };
  const isFirst = !state.failed;
  const next: SolveState = isFirst
    ? {
        ...state,
        failed: true,
        firstMistake: mistake,
        decisive: {
          moves: [...state.played, { san: playedSan, hintsBefore: state.hintsUsed }],
          at: "wrongMove",
        },
      }
    : state;
  return { kind: "wrong", state: next, mistake, isFirst };
}

export type Hint = { kind: "text"; text: string; index: number } | { kind: "piece"; square: string };

/**
 * A hint (D20, D37): each press counts. The author's texts first, in order;
 * after them, or with none, the piece the main line moves next is marked —
 * which works at any step of the sequence. Null, and the state as it was,
 * once the exercise is over: there is nothing left to hint.
 */
export function takeHint(solution: Solution, state: SolveState): { state: SolveState; hint: Hint | null } {
  const expected = childrenAt(solution, state.path)[0];
  if (state.completed || !expected) return { state, hint: null };

  const hintsUsed = state.hintsUsed + 1;
  const text = solution.hints[state.textHintsShown];
  if (text !== undefined) {
    const index = state.textHintsShown;
    return {
      state: { ...state, hintsUsed, textHintsShown: index + 1 },
      hint: { kind: "text", text, index },
    };
  }

  const move = parseSan(positionOf(state.fen), expected.san);
  const square = move && "from" in move ? makeSquare(move.from) : null;
  if (!square) return { state: { ...state, hintsUsed }, hint: null };
  return { state: { ...state, hintsUsed, hintSquare: square }, hint: { kind: "piece", square } };
}

export interface SolutionStep {
  path: string;
  san: string;
  fen: string;
  comment?: string;
  byPlayer: boolean;
}

/**
 * «Ver la solución» (D20): the main line from where the board stands to its
 * end, with its comments, and the state marked failed and over. Once the
 * exercise is over it changes nothing and has no steps left.
 */
export function showSolution(solution: Solution, state: SolveState): { state: SolveState; steps: SolutionStep[] } {
  if (state.completed) return { state, steps: [] };

  const steps: SolutionStep[] = [];
  for (let node = childrenAt(solution, state.path)[0]; node; node = node.children[0]) {
    steps.push({
      path: node.path,
      san: node.san,
      fen: node.fen,
      ...(node.comment ? { comment: node.comment } : {}),
      byPlayer: pliesTo(node.path) % 2 === 1,
    });
  }
  const end = steps[steps.length - 1];
  return {
    state: {
      ...state,
      path: end?.path ?? state.path,
      fen: end?.fen ?? state.fen,
      hintSquare: null,
      failed: true,
      solutionShown: true,
      completed: true,
      decisive: state.decisive ?? { moves: state.played, at: "solution" },
    },
    steps,
  };
}

export interface AttemptOutcome {
  result: "PASSED" | "FAILED";
  isPerfect: boolean;
  hintsUsed: number;
  solutionShown: boolean;
  mistake: Mistake | null;
  requiredMoves: number;
  correctMoves: number;
  reachedPly: number;
  review: ExerciseOutcome;
}

/**
 * The attempt as it is stored (D33): PASSED is completed and never failed;
 * perfect is PASSED without a hint; the review hears «clean», «hinted» or
 * «failed». A state not yet decided reads as FAILED: callers ask once
 * `decisive` is set.
 */
export function outcomeOf(state: SolveState): AttemptOutcome {
  const passed = state.completed && !state.failed;
  return {
    result: passed ? "PASSED" : "FAILED",
    isPerfect: passed && state.hintsUsed === 0,
    hintsUsed: state.hintsUsed,
    solutionShown: state.solutionShown,
    mistake: state.firstMistake,
    requiredMoves: state.requiredMoves,
    correctMoves: state.correctMoves,
    reachedPly: state.reachedPly,
    review: passed ? (state.hintsUsed === 0 ? "clean" : "hinted") : "failed",
  };
}

export type ReplayRefusal = "unreadable" | "illegal" | "movesAfterDecision" | "undecided";

/**
 * The server's check: the submitted moves replayed from the start must reach
 * the decision they claim — all matched and completed is PASSED; all matched
 * but the last, which is not, is FAILED with that mistake; all matched and
 * the solution shown is FAILED. A move after the decision, a move the board
 * cannot play or a sequence that decides nothing is refused. The hints only
 * lower the outcome, so they are taken as sent; the SANs and the FEN of the
 * mistake are the server's own.
 */
export function replayAttempt(
  solution: Solution,
  input: { moves: readonly PlayedMove[]; hintsUsed: number; solutionShown: boolean },
): { ok: true; outcome: AttemptOutcome } | { ok: false; reason: ReplayRefusal } {
  if (solution.tree.children.length === 0) return { ok: false, reason: "unreadable" };

  let state = startSolving(solution);
  for (const move of input.moves) {
    if (state.decisive) return { ok: false, reason: "movesAfterDecision" };
    state = { ...state, hintsUsed: Math.max(state.hintsUsed, move.hintsBefore) };
    const result = playMove(solution, state, move.san);
    if (result.kind === "illegal") return { ok: false, reason: "illegal" };
    state = result.state;
  }
  if (input.solutionShown && !state.decisive) state = showSolution(solution, state).state;
  if (!state.decisive) return { ok: false, reason: "undecided" };

  const outcome = outcomeOf({ ...state, hintsUsed: Math.max(state.hintsUsed, input.hintsUsed) });
  if (!input.solutionShown) return { ok: true, outcome };
  return {
    ok: true,
    outcome: { ...outcome, result: "FAILED", isPerfect: false, solutionShown: true, review: "failed" },
  };
}
