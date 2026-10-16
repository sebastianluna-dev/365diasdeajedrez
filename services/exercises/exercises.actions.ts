"use server";

import { revalidatePath } from "next/cache";
import type {
  ExerciseAttemptReply,
  ExerciseAttemptSubmission,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";
import { readSolution, replayAttempt } from "@/lib/chess/exercise-solver";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { parseExerciseSubmission } from "@/services/exercises/exercise-submission";
import { recordExerciseAttempt } from "@/services/shared/exercise-attempt.service";
import { getExerciseViewer } from "@/services/shared/exercise-visibility";
import { solvableInContextWhere, type AttemptContextInput } from "@/services/shared/exercise-visibility-rules";
import type { ExerciseKindCode } from "@/constants/platform/exercise-codes.const";

// The student's one write in «Ejercicios» (PLAN.md §5.4): an attempt, sent
// by the solve screen the moment it is decided. Reachable by direct POST, so
// nothing the browser says is taken on its word:
// - the student is the DAL's, the flag is checked and the submits are limited;
// - the exercise must be solvable by them through the path the attempt claims
//   (`solvableInContextWhere`, the same `where` the page read it with);
// - the moves are replayed on the server (`replayAttempt`): the result, the
//   mistake and its SANs are the server's, and a sequence that decides
//   nothing, or goes on after the decision, stores nothing;
// - everything else — the family's lock, the study day's one scored attempt,
//   the mistake, the review ladder and the activity counted once — is the
//   shared writer's (`recordExerciseAttempt`), in one transaction.
// A student writes attempts, never exercises (exercise-roles.test.ts).

/**
 * Records a decided attempt at an exercise. `scored: false` when the exercise
 * was already attempted this study day (nothing moved); `ok: false` with the
 * reason when nothing was stored, which the solver says as «No se guardó el
 * intento.».
 */
export async function submitExerciseAttempt(input: ExerciseAttemptSubmission): Promise<ExerciseAttemptReply> {
  const user = await getCurrentUser();
  if (!EXERCISES_ENABLED) return { ok: false, reason: "disabled" };
  if (!(await allowAction(`${user.id}:exercise-attempt`, 120, 60_000))) return { ok: false, reason: "throttled" };

  const submission = parseExerciseSubmission(input);
  if (!submission) return { ok: false, reason: "invalid" };
  const context: AttemptContextInput = submission.context;

  const db = getPlatformDb();
  const viewer = await getExerciseViewer();
  const exercise = await db.exercise.findFirst({
    where: { AND: [{ id: submission.exerciseId }, solvableInContextWhere(context, viewer)] },
    select: {
      id: true,
      copiedFromId: true,
      solutionPgn: true,
      kind: { select: { code: true } },
      mateIn: true,
      hints: true,
    },
  });
  if (!exercise) return { ok: false, reason: "notFound" };

  const solution = readSolution({
    solutionPgn: exercise.solutionPgn,
    kind: exercise.kind.code as ExerciseKindCode,
    mateIn: exercise.mateIn,
    hints: exercise.hints,
  });
  if (!solution) return { ok: false, reason: "refused" };
  const replay = replayAttempt(solution, {
    moves: submission.moves,
    hintsUsed: submission.hintsUsed,
    solutionShown: submission.solutionShown,
  });
  if (!replay.ok) return { ok: false, reason: "refused" };

  const now = new Date();
  const recorded = await db.$transaction((tx) =>
    recordExerciseAttempt(tx, {
      userId: user.id,
      exercise: { id: exercise.id, copiedFromId: exercise.copiedFromId },
      contextCode: context.kind,
      seriesId: context.kind === ATTEMPT_CONTEXT.SERIES ? context.seriesId : null,
      outcome: replay.outcome,
      durationMs: submission.durationMs,
      now,
    }),
  );

  revalidatePath(platformRoutes.dashboard);
  revalidatePath(platformRoutes.exercises);
  if (context.kind === ATTEMPT_CONTEXT.SERIES) revalidatePath(platformRoutes.exerciseSeries(context.seriesId));
  return recorded.scored
    ? { ok: true, scored: true, firstSolve: recorded.firstSolve }
    : { ok: true, scored: false, firstSolve: false };
}
