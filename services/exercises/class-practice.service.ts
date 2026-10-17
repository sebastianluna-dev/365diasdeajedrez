import "server-only";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { classTitleOf } from "@/services/classes/classes.mapper";
import { exerciseFamilyIds } from "@/services/shared/exercise-attempt.service";
import { getExerciseViewer } from "@/services/shared/exercise-visibility";
import { solvableInContextWhere, studentSolvableClassBlockWhere } from "@/services/shared/exercise-visibility-rules";
import { classBlockPosition, nextInClassBlock, solvableBlockItems } from "./class-practice.mapper";
import { attemptedToday, mapSolverExercise } from "./exercises.mapper";
import type { ClassPracticeExercise } from "./class-practice.types";

// The student's side of a class's EXERCISE block (D29; PLAN.md §7.2): the
// n-th exercise to solve, under the class's address, with the context CLASS.
// The block is read through the rule of what the student may solve from
// (`studentSolvableClassBlockWhere`: a seat not moved, the class not
// cancelled, the block visible in the class's phase), and the exercise again
// through the visibility rule for the path the attempt will claim
// (`solvableInContextWhere`, CLASS), the same `where` the submit checks at its
// own `now`. A block's exercise whose family was attempted this study day
// opens in the `block` mode (D49): the attempt is stored for the block's mark
// and the teacher's count, and nothing else counts. Behind
// `EXERCISES_ENABLED`: off, the page answers 404.

/**
 * The n-th exercise of an EXERCISE block (1-based, among the ones the student
 * may solve there), or null: a block they may not see now — an AFTER block
 * before the class ends, a class they hold no seat in — is not found. It opens
 * in the `block` mode when the exercise's family was attempted this study day.
 */
export async function getClassBlockExercise(
  classId: string,
  blockId: string,
  n: number,
): Promise<ClassPracticeExercise | null> {
  if (!EXERCISES_ENABLED) return null;
  if (!Number.isInteger(n) || n < 1) return null;
  const viewer = await getExerciseViewer();
  const db = getPlatformDb();
  const now = new Date();
  const block = await db.classBlock.findFirst({
    where: { AND: [{ id: blockId, classId }, studentSolvableClassBlockWhere(viewer.userId, now)] },
    select: {
      id: true,
      class: {
        select: {
          id: true,
          title: true,
          teacherId: true,
          format: { select: { code: true } },
          teacher: { select: { displayName: true } },
        },
      },
      exercises: {
        orderBy: { order: "asc" },
        select: { exercise: { select: { id: true, teacherId: true, status: { select: { code: true } } } } },
      },
    },
  });
  if (!block) return null;
  const items = solvableBlockItems(block.exercises, block.class.teacherId);
  const item = items[n - 1];
  if (!item) return null;

  const attempt = { kind: ATTEMPT_CONTEXT.CLASS, classId: block.class.id, classBlockId: block.id } as const;
  const exercise = await db.exercise.findFirst({
    where: { AND: [{ id: item.id }, solvableInContextWhere(attempt, viewer, now)] },
    select: {
      id: true,
      title: true,
      prompt: true,
      kind: { select: { code: true } },
      mateIn: true,
      solutionPgn: true,
      hints: true,
      explanation: true,
      difficulty: true,
      copiedFromId: true,
      lessonId: true,
    },
  });
  if (!exercise) return null;

  const states = await db.userExerciseState.findMany({
    where: { userId: viewer.userId, exerciseId: { in: await exerciseFamilyIds(db, exercise) } },
    select: { lastAttemptAt: true },
  });
  const href = platformRoutes.classDetail(block.class.id);
  return {
    classBlock: { classId: block.class.id, blockId: block.id, classTitle: classTitleOf(block.class, "student"), href },
    exercise: mapSolverExercise(exercise),
    mode: attemptedToday(states, now) ? "block" : "solve",
    context: { attempt, position: classBlockPosition(n, items.length) },
    next: nextInClassBlock(block.class.id, block.id, n, items.length),
    back: { href, label: "Volver a la clase" },
  };
}
