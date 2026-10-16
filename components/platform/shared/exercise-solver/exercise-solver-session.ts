import type { Key } from "@lichess-org/chessground/types";
import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { parseSan } from "chessops/san";
import { makeSquare } from "chessops/util";
import {
  outcomeOf,
  playMove,
  showSolution,
  startSolving,
  takeHint,
  type PlayedMove,
  type Solution,
  type SolutionStep,
  type SolveState,
} from "@/lib/chess/exercise-solver";
import { sanToSpanish } from "@/lib/chess/notation";
import { nodeAtPath, sansAlongPath } from "@/lib/chess/pgn-tree";
import type { ExerciseSolverMode } from "./exercise-solver.types";

// The solve screen's state, pure (PLAN.md §5.3): the solver's own state
// (`lib/chess/exercise-solver.ts`) plus what the screen shows of it — the
// board, which lags the solver while the opponent's reply is on its way or a
// wrong move is shown before it is taken back, the feedback line, the author's
// hints shown so far and the walk through «Ver la solución». A reducer, so
// `useExerciseSolver` only adds the timers and the submit, and a story can
// reach any state with the same actions a student takes.

export const FEEDBACK = {
  correct: "¡Bien!",
  wrong: "No es la jugada. Sigue intentándolo o mira la solución.",
  piece: "Mueve la pieza marcada.",
} as const;

export interface SolverFeedback {
  tone: "ok" | "error" | "info";
  text: string;
}

/** What the board shows: a node of the solution, or the wrong move for a moment. */
export interface SolverBoard {
  path: string;
  fen: string;
  lastMove: [Key, Key] | null;
  check: boolean;
  /** `error` while a wrong move is shown before it is taken back. */
  tone: "error" | null;
}

export interface SolverWalkthrough {
  /** Where the board stood when «Ver la solución» was pressed. */
  from: SolverBoard;
  steps: SolutionStep[];
  /** How many steps the board has played: 0 is `from`. */
  shown: number;
}

export interface SolverSession {
  solution: Solution;
  mode: ExerciseSolverMode;
  solve: SolveState;
  board: SolverBoard;
  /** What the board waits for before the student moves again. */
  waiting: "reply" | "flash" | null;
  feedback: SolverFeedback | null;
  /** The author's hints shown so far, in order (D20). */
  textHints: string[];
  walkthrough: SolverWalkthrough | null;
}

export type SolverAction =
  | { type: "move"; san: string }
  /** The reply's delay is over: the board plays it. */
  | { type: "replyShown" }
  /** The wrong move has been seen: the board takes it back. */
  | { type: "flashOver" }
  | { type: "hint" }
  | { type: "showSolution" }
  /** «Ver la solución»'s ‹ ›: the number of steps the board shows. */
  | { type: "step"; to: number }
  /** «Reintentar»: the board from the start, scored no more today (§2.7). */
  | { type: "retry" };

function positionOf(fen: string): Chess {
  return Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
}

/** The board on a node of the solution ("" is the start). */
export function boardAt(solution: Solution, path: string): SolverBoard {
  const node = nodeAtPath(solution.tree, path);
  if (!node) return { path: "", fen: solution.tree.initialFen, lastMove: null, check: false, tone: null };
  return { path, fen: node.fen, lastMove: node.lastMove ?? null, check: node.check, tone: null };
}

/** The board after a move that is not in the solution, marked as wrong. */
function wrongBoard(board: SolverBoard, san: string): SolverBoard {
  const pos = positionOf(board.fen);
  const move = parseSan(pos, san);
  if (!move || !("from" in move)) return board;
  const after = pos.clone();
  after.play(move);
  return {
    path: board.path,
    fen: makeFen(after.toSetup()),
    lastMove: [makeSquare(move.from) as Key, makeSquare(move.to) as Key],
    check: after.isCheck(),
    tone: "error",
  };
}

export function startSession(solution: Solution, mode: ExerciseSolverMode): SolverSession {
  return {
    solution,
    mode,
    solve: startSolving(solution),
    board: boardAt(solution, ""),
    waiting: null,
    feedback: null,
    textHints: [],
    walkthrough: null,
  };
}

/** Whether the student may move now. */
export function canMove(session: SolverSession): boolean {
  return !session.solve.completed && session.waiting === null && session.walkthrough === null;
}

export function reduceSession(session: SolverSession, action: SolverAction): SolverSession {
  const { solution, solve } = session;
  switch (action.type) {
    case "move": {
      if (!canMove(session)) return session;
      const result = playMove(solution, solve, action.san);
      if (result.kind === "illegal") return session;
      if (result.kind === "wrong") {
        return {
          ...session,
          solve: result.state,
          board: wrongBoard(session.board, action.san),
          waiting: "flash",
          feedback: { tone: "error", text: FEEDBACK.wrong },
        };
      }
      return {
        ...session,
        solve: result.state,
        board: boardAt(solution, result.playerPath),
        waiting: result.reply ? "reply" : null,
        feedback: { tone: "ok", text: FEEDBACK.correct },
      };
    }
    case "replyShown":
      if (session.waiting !== "reply") return session;
      return { ...session, board: boardAt(solution, solve.path), waiting: null };
    case "flashOver":
      if (session.waiting !== "flash") return session;
      return { ...session, board: boardAt(solution, solve.path), waiting: null };
    case "hint": {
      if (!canMove(session)) return session;
      const { state, hint } = takeHint(solution, solve);
      if (!hint) return session;
      return hint.kind === "text"
        ? { ...session, solve: state, textHints: [...session.textHints, hint.text], feedback: null }
        : { ...session, solve: state, feedback: { tone: "info", text: FEEDBACK.piece } };
    }
    case "showSolution": {
      if (solve.completed || session.walkthrough) return session;
      // A reply or a flash on its way is settled first: the walk starts where the solver stands.
      const from = boardAt(solution, solve.path);
      const shown = showSolution(solution, solve);
      return {
        ...session,
        solve: shown.state,
        board: from,
        waiting: null,
        feedback: null,
        walkthrough: { from, steps: shown.steps, shown: 0 },
      };
    }
    case "step": {
      const walk = session.walkthrough;
      if (!walk) return session;
      const shown = Math.max(0, Math.min(walk.steps.length, action.to));
      const step = walk.steps[shown - 1];
      return {
        ...session,
        board: step ? boardAt(solution, step.path) : walk.from,
        walkthrough: { ...walk, shown },
      };
    }
    case "retry":
      return startSession(solution, session.mode === "preview" ? "preview" : "unscored");
  }
}

/** Over: completed, and nothing left on its way to the board (the solution's walk may still be stepped). */
export function isSessionOver(session: SolverSession): boolean {
  return session.solve.completed && session.waiting === null;
}

/** How it went, once it is over (D33): clean, with a hint, failed, or the solution seen. */
export type SolverResultKind = "clean" | "hinted" | "failed" | "shown";

export interface SolverResult {
  kind: SolverResultKind;
  /** The first wrong move and the one that was expected, in Spanish SAN (D19): «Cf7+», «Dg8+». */
  mistake: { played: string; expected: string } | null;
}

export function sessionResult(session: SolverSession): SolverResult | null {
  if (!isSessionOver(session)) return null;
  const outcome = outcomeOf(session.solve);
  const mistake = session.solve.firstMistake
    ? {
        played: sanToSpanish(session.solve.firstMistake.playedSan),
        expected: sanToSpanish(session.solve.firstMistake.expectedSan),
      }
    : null;
  if (session.solve.solutionShown && !mistake) return { kind: "shown", mistake: null };
  if (outcome.result === "FAILED") return { kind: "failed", mistake };
  return { kind: outcome.isPerfect ? "clean" : "hinted", mistake: null };
}

/** What the server is sent, once the attempt is decided: the moves up to the decision, the hints and the solution. */
export interface SolverSubmission {
  moves: PlayedMove[];
  hintsUsed: number;
  solutionShown: boolean;
}

export function sessionSubmission(session: SolverSession): SolverSubmission | null {
  const decisive = session.solve.decisive;
  if (!decisive) return null;
  return { moves: decisive.moves, hintsUsed: session.solve.hintsUsed, solutionShown: decisive.at === "solution" };
}

/** The comment of the step the walk stands on, if it has one. */
export function walkthroughComment(session: SolverSession): string | null {
  const walk = session.walkthrough;
  if (!walk || walk.shown === 0) return null;
  return walk.steps[walk.shown - 1]?.comment ?? null;
}

/**
 * The moves on the board so far, in Spanish and numbered from the start's
 * move number: «1. Dg8+ Txg8 2. Cf7#», or «24… Tg1+ 25. Rxg1» when Black begins.
 */
export function movesOnBoard(solution: Solution, path: string): string {
  const sans = sansAlongPath(solution.tree, path).map(sanToSpanish);
  if (sans.length === 0) return "";
  const [, turn = "w", , , , fullmove = "1"] = solution.tree.initialFen.split(" ");
  let number = Number.parseInt(fullmove, 10) || 1;
  let white = turn === "w";
  const parts: string[] = [];
  sans.forEach((san, index) => {
    if (white) parts.push(`${number}. ${san}`);
    else parts.push(index === 0 ? `${number}… ${san}` : san);
    if (!white) number += 1;
    white = !white;
  });
  return parts.join(" ");
}

/** Whether the move the board stands on took a piece: the reply sounds as a capture then. */
export function isCaptureAt(solution: Solution, path: string): boolean {
  return nodeAtPath(solution.tree, path)?.san.includes("x") ?? false;
}
