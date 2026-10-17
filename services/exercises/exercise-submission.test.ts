import { describe, expect, it } from "vitest";
import { EXERCISE_ATTEMPT_LIMITS } from "@/constants/platform/exercise.const";
import { readSolution, replayAttempt } from "@/lib/chess/exercise-solver";
import { parseExerciseSubmission } from "./exercise-submission";

// «Pista» has no cap in the solver, so the hint figures a submission carries
// are clamped, never a reason to refuse the attempt: a refused attempt stores
// nothing, and a failure would vanish from the study day (D19).

const PHILIDOR = "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1";
const solution = readSolution({
  solutionPgn: `[SetUp "1"]\n[FEN "${PHILIDOR}"]\n\n1. Qg8+ Rxg8 2. Nf7# *`,
  kind: "MATE_IN",
  mateIn: 2,
  hints: [],
});

function submission(moves: { san: string; hintsBefore: number }[], hintsUsed: number) {
  return {
    exerciseId: "exercise-1",
    context: { kind: "SERIES", seriesId: "series-1" },
    moves,
    hintsUsed,
    solutionShown: false,
    durationMs: 30_000,
  };
}

describe("parseExerciseSubmission", () => {
  it("acepta el camino de una lección, sin más dato que el tipo (fase 2)", () => {
    const parsed = parseExerciseSubmission({
      ...submission([{ san: "Qg8+", hintsBefore: 0 }], 0),
      context: { kind: "LESSON" },
    });
    expect(parsed?.context).toEqual({ kind: "LESSON" });
  });

  it("acepta el camino de un bloque de clase con su clase y su bloque, y nada menos (fase 3)", () => {
    const context = { kind: "CLASS", classId: "c-1", classBlockId: "b-1" };
    expect(parseExerciseSubmission({ ...submission([], 0), context })?.context).toEqual(context);
    expect(parseExerciseSubmission({ ...submission([], 0), context: { kind: "CLASS" } })).toBeNull();
    expect(
      parseExerciseSubmission({ ...submission([], 0), context: { kind: "CLASS", classBlockId: "b-1" } }),
    ).toBeNull();
    expect(parseExerciseSubmission({ ...submission([], 0), context: { kind: "STORM" } })).toBeNull();
  });

  it("acota las pistas de cada jugada en vez de rechazar el intento", () => {
    const parsed = parseExerciseSubmission(
      submission(
        [
          { san: "Qg8+", hintsBefore: 25 },
          { san: "Nf7#", hintsBefore: 25 },
        ],
        25,
      ),
    );

    expect(parsed?.moves.map((move) => move.hintsBefore)).toEqual([
      EXERCISE_ATTEMPT_LIMITS.hints,
      EXERCISE_ATTEMPT_LIMITS.hints,
    ]);
    expect(parsed?.hintsUsed).toBe(EXERCISE_ATTEMPT_LIMITS.hints);
  });

  it("un intento con 25 pistas se guarda como resuelto con pista o como fallado", () => {
    if (!solution) throw new Error("the solution must read");
    const passed = parseExerciseSubmission(
      submission(
        [
          { san: "Qg8+", hintsBefore: 25 },
          { san: "Nf7#", hintsBefore: 25 },
        ],
        25,
      ),
    );
    const failed = parseExerciseSubmission(submission([{ san: "Qh3", hintsBefore: 25 }], 25));
    if (!passed || !failed) throw new Error("both submissions must parse");

    expect(replayAttempt(solution, passed)).toMatchObject({
      ok: true,
      outcome: { result: "PASSED", isPerfect: false, review: "hinted", hintsUsed: EXERCISE_ATTEMPT_LIMITS.hints },
    });
    expect(replayAttempt(solution, failed)).toMatchObject({
      ok: true,
      outcome: { result: "FAILED", review: "failed" },
    });
  });

  it("acota la duración y lleva las cifras negativas a cero", () => {
    const parsed = parseExerciseSubmission({
      ...submission([{ san: "Qg8+", hintsBefore: -3 }], -2),
      durationMs: 10 * EXERCISE_ATTEMPT_LIMITS.durationMs,
    });

    expect(parsed).toMatchObject({ hintsUsed: 0, durationMs: EXERCISE_ATTEMPT_LIMITS.durationMs });
    expect(parsed?.moves[0]?.hintsBefore).toBe(0);
  });

  it("rechaza lo que el solver nunca envía", () => {
    expect(parseExerciseSubmission(submission([{ san: "", hintsBefore: 0 }], 0))).toBeNull();
    // A class block's attempt comes with phase 3; until then its path is not one the solver sends.
    expect(
      parseExerciseSubmission({ ...submission([], 0), context: { kind: "CLASS", classBlockId: "b-1" } }),
    ).toBeNull();
    expect(
      parseExerciseSubmission(
        submission(
          Array.from({ length: EXERCISE_ATTEMPT_LIMITS.moves + 1 }, () => ({ san: "Qg8+", hintsBefore: 0 })),
          0,
        ),
      ),
    ).toBeNull();
  });
});
