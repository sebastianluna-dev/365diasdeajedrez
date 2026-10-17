import type { ExerciseSolverLink } from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import type { ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import { seriesItemAvailability } from "@/services/shared/exercise-visibility-rules";

// From the rows a class block's solve page reads to what it draws. Pure, so
// which exercises of the block the student may solve — the series' own
// condition on the class teacher's exercises — and the way on are tested here.

/** An exercise of a block, as the solve page reads it. */
export interface ClassBlockExerciseRow {
  id: string;
  teacherId: string | null;
  status: { code: string };
}

/**
 * The exercises of a block the student may solve now, in order: the class
 * teacher's usable ones and the library's (`seriesItemAvailability`, the
 * condition the visibility rule's class branch applies), so the n-th here is
 * the n-th the class page lists.
 */
export function solvableBlockItems<T extends ClassBlockExerciseRow>(
  items: readonly { exercise: T }[],
  classTeacherId: string,
): T[] {
  return items
    .map((item) => item.exercise)
    .filter(
      (exercise) =>
        seriesItemAvailability(
          { teacherId: exercise.teacherId, statusCode: exercise.status.code as ExerciseStatusCode },
          classTeacherId,
        ) === "available",
    );
}

/** «2 / 3». */
export function classBlockPosition(n: number, total: number): string {
  return `${n} / ${total}`;
}

/** What comes after the n-th exercise of the block: the next one, or nothing at the last. */
export function nextInClassBlock(
  classId: string,
  blockId: string,
  n: number,
  total: number,
): ExerciseSolverLink | null {
  return n < total
    ? { href: platformRoutes.classExercise(classId, blockId, n + 1), label: "Siguiente ejercicio" }
    : null;
}
