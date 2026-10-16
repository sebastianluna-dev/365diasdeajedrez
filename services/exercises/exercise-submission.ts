import { z } from "zod";
import type { ExerciseAttemptSubmission } from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import { EXERCISE_ATTEMPT_LIMITS } from "@/constants/platform/exercise.const";
import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";

// What `submitExerciseAttempt` accepts from the browser (PLAN.md §5.4). The
// shape is checked strictly — ids, SANs, the number of moves — but the
// figures the solver counts are clamped, never refused: «Pista» has no cap
// (once the author's hints run out it marks the piece again on every press),
// so a student who presses it often must still have the attempt stored, and
// a hint only ever lowers the outcome.

/** A number from the browser, kept within what is credible. */
export function clampFigure(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

const HINTS = z.number().transform((value) => clampFigure(value, 0, EXERCISE_ATTEMPT_LIMITS.hints));

const SUBMISSION_SCHEMA = z.object({
  exerciseId: z.string().min(1).max(64),
  context: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal(ATTEMPT_CONTEXT.SERIES), seriesId: z.string().min(1).max(64) }),
    z.object({ kind: z.literal(ATTEMPT_CONTEXT.PRACTICE) }),
    z.object({ kind: z.literal(ATTEMPT_CONTEXT.REVIEW) }),
  ]),
  moves: z.array(z.object({ san: z.string().min(1).max(12), hintsBefore: HINTS })).max(EXERCISE_ATTEMPT_LIMITS.moves),
  hintsUsed: HINTS,
  solutionShown: z.boolean(),
  durationMs: z.number().transform((value) => clampFigure(value, 0, EXERCISE_ATTEMPT_LIMITS.durationMs)),
});

/** The submission with its figures clamped, or null when its shape is not one the solver sends. */
export function parseExerciseSubmission(input: unknown): ExerciseAttemptSubmission | null {
  const parsed = SUBMISSION_SCHEMA.safeParse(input);
  return parsed.success ? parsed.data : null;
}
