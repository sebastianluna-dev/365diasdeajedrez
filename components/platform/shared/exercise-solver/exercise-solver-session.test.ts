import { describe, expect, it } from "vitest";
import { readSolution, type Solution } from "@/lib/chess/exercise-solver";
import {
  FEEDBACK,
  canMove,
  isSessionOver,
  movesOnBoard,
  reduceSession,
  sessionResult,
  sessionSubmission,
  startSession,
  walkthroughComment,
  type SolverAction,
  type SolverSession,
} from "./exercise-solver-session";

const SMOTHERED = `[SetUp "1"]
[FEN "r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1"]

1. Qg8+ {La dama se entrega.} Rxg8 2. Nf7# *`;
const BLACK_MATE = `[SetUp "1"]
[FEN "3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1"]

1... Rd1# *`;

function solutionOf(pgn: string, hints: string[] = []): Solution {
  const solution = readSolution({ solutionPgn: pgn, kind: "MATE_IN", mateIn: null, hints });
  if (!solution) throw new Error("unreadable");
  return solution;
}

const run = (session: SolverSession, ...actions: SolverAction[]) => actions.reduce(reduceSession, session);

describe("the solve screen's session", () => {
  it("shows the player's move, then the reply after its pause, and is over at the mate", () => {
    const solution = solutionOf(SMOTHERED);
    const moved = run(startSession(solution, "solve"), { type: "move", san: "Qg8+" });
    expect(moved.waiting).toBe("reply");
    expect(moved.feedback).toEqual({ tone: "ok", text: FEEDBACK.correct });
    expect(moved.board.lastMove).toEqual(["c4", "g8"]);
    expect(canMove(moved)).toBe(false);

    const replied = run(moved, { type: "replyShown" });
    expect(replied.board.lastMove).toEqual(["a8", "g8"]);
    expect(canMove(replied)).toBe(true);

    const done = run(replied, { type: "move", san: "Nf7#" });
    expect(isSessionOver(done)).toBe(true);
    expect(sessionResult(done)).toEqual({ kind: "clean", mistake: null });
    expect(sessionSubmission(done)).toEqual({
      moves: [
        { san: "Qg8+", hintsBefore: 0 },
        { san: "Nf7#", hintsBefore: 0 },
      ],
      hintsUsed: 0,
      solutionShown: false,
    });
  });

  it("shows a wrong move in red for a moment, takes it back, and decides the attempt there (D19)", () => {
    const solution = solutionOf(SMOTHERED);
    const wrong = run(startSession(solution, "solve"), { type: "move", san: "Nf7+" });
    expect(wrong.board.tone).toBe("error");
    expect(wrong.board.lastMove).toEqual(["h6", "f7"]);
    expect(wrong.waiting).toBe("flash");
    expect(wrong.feedback?.text).toBe(FEEDBACK.wrong);
    expect(wrong.solve.failed).toBe(true);
    expect(sessionSubmission(wrong)?.moves).toEqual([{ san: "Nf7+", hintsBefore: 0 }]);

    const back = run(wrong, { type: "flashOver" });
    expect(back.board.tone).toBeNull();
    expect(back.board.fen).toBe(solution.tree.initialFen);

    // The student may go on to learn; it stays failed, with the first mistake.
    const finished = run(back, { type: "move", san: "Qg8+" }, { type: "replyShown" }, { type: "move", san: "Nf7#" });
    expect(sessionResult(finished)).toEqual({ kind: "failed", mistake: { played: "Cf7+", expected: "Dg8+" } });
  });

  it("gives the author's hints first, then marks the piece, and a hinted pass is not clean (D33, D37)", () => {
    const solution = solutionOf(SMOTHERED, ["Una entrega en g8."]);
    const text = run(startSession(solution, "solve"), { type: "hint" });
    expect(text.textHints).toEqual(["Una entrega en g8."]);
    expect(text.solve.hintSquare).toBeNull();

    const piece = run(text, { type: "hint" });
    expect(piece.solve.hintSquare).toBe("c4");
    expect(piece.feedback?.text).toBe(FEEDBACK.piece);

    const done = run(piece, { type: "move", san: "Qg8+" }, { type: "replyShown" }, { type: "move", san: "Nf7#" });
    expect(sessionResult(done)?.kind).toBe("hinted");
    expect(sessionSubmission(done)?.hintsUsed).toBe(2);
  });

  it("walks through the solution step by step, with its comments, and counts it as failed (D20)", () => {
    const solution = solutionOf(SMOTHERED);
    const shown = run(startSession(solution, "solve"), { type: "showSolution" });
    expect(shown.walkthrough?.steps.map((step) => step.san)).toEqual(["Qg8+", "Rxg8", "Nf7#"]);
    expect(sessionResult(shown)).toEqual({ kind: "shown", mistake: null });
    expect(sessionSubmission(shown)).toEqual({ moves: [], hintsUsed: 0, solutionShown: true });

    const first = run(shown, { type: "step", to: 1 });
    expect(first.board.lastMove).toEqual(["c4", "g8"]);
    expect(walkthroughComment(first)).toBe("La dama se entrega.");
    expect(run(first, { type: "step", to: 9 }).walkthrough?.shown).toBe(3);
    expect(run(first, { type: "step", to: 0 }).board.fen).toBe(solution.tree.initialFen);
  });

  it("starts again unscored on «Reintentar», and a preview stays a preview", () => {
    const solution = solutionOf(SMOTHERED);
    const failed = run(startSession(solution, "solve"), { type: "move", san: "Nf7+" });
    const again = run(failed, { type: "retry" });
    expect(again.mode).toBe("unscored");
    expect(again.solve.failed).toBe(false);
    expect(run(startSession(solution, "preview"), { type: "retry" }).mode).toBe("preview");
  });

  it("ignores what is not a move of the board, and moves while the reply is on its way", () => {
    const solution = solutionOf(SMOTHERED);
    const start = startSession(solution, "solve");
    expect(run(start, { type: "move", san: "Kh8" })).toBe(start);
    const moved = run(start, { type: "move", san: "Qg8+" });
    expect(run(moved, { type: "move", san: "Nf7#" })).toBe(moved);
  });

  it("numbers the moves from the start's move number, a Black start included", () => {
    const smothered = solutionOf(SMOTHERED);
    const done = run(
      startSession(smothered, "solve"),
      { type: "move", san: "Qg8+" },
      { type: "replyShown" },
      { type: "move", san: "Nf7#" },
    );
    expect(movesOnBoard(smothered, done.board.path)).toBe("1. Dg8+ Txg8 2. Cf7#");
    const black = solutionOf(BLACK_MATE);
    const mated = run(startSession(black, "solve"), { type: "move", san: "Rd1#" });
    expect(movesOnBoard(black, mated.board.path)).toBe("1… Td1#");
  });
});
