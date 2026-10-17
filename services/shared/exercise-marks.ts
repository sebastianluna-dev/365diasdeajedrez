import { ATTEMPT_RESULT } from "@/constants/platform/training-codes.const";

// A student's mark with an exercise INSIDE a container — a series (D24 per
// series, PLAN.md §5.2) or a class block (D29) —, from their attempts made
// there: «Resuelto» with a pass there, «Fallado» with attempts and no pass,
// nothing untried. An attempt elsewhere marks nothing here. The one fold the
// student's series, the student's class and the teacher's «2 de 3 lo
// resolvieron» read, so the three cannot disagree. Pure module.

export type ExerciseMark = "solved" | "failed";

/** An attempt as the fold reads it: where it was made, at what, and how it went. */
export interface ContainerAttemptRow {
  containerId: string | null;
  exerciseId: string | null;
  result: { code: string };
}

/** The marks by container and exercise. An attempt with no container or no exercise counts for nothing. */
export function exerciseMarksBy(attempts: readonly ContainerAttemptRow[]): Map<string, Map<string, ExerciseMark>> {
  const marks = new Map<string, Map<string, ExerciseMark>>();
  for (const attempt of attempts) {
    if (attempt.containerId === null || attempt.exerciseId === null) continue;
    const own = marks.get(attempt.containerId) ?? new Map<string, ExerciseMark>();
    const passed = attempt.result.code === ATTEMPT_RESULT.PASSED;
    if (passed || own.get(attempt.exerciseId) !== "solved") own.set(attempt.exerciseId, passed ? "solved" : "failed");
    marks.set(attempt.containerId, own);
  }
  return marks;
}
