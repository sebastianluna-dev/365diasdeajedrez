import type {
  ExerciseSolverContext,
  ExerciseSolverExercise,
  ExerciseSolverLink,
  ExerciseSolverMode,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";

// What the student's class reads of an EXERCISE block's n-th exercise (D29;
// PLAN.md §7.2): the exercise to solve under the class's address, with the
// context CLASS, the way on to the block's next one and back to the class.
// The block's list itself is drawn by the class page (`ClassContentRenderer`).

/** The n-th exercise of a class block, ready to solve. */
export interface ClassPracticeExercise {
  classBlock: { classId: string; blockId: string; classTitle: string; href: string };
  exercise: ExerciseSolverExercise;
  /** `unscored` when the exercise's family was attempted this study day (§2.7). */
  mode: Extract<ExerciseSolverMode, "solve" | "unscored">;
  context: ExerciseSolverContext;
  /** The next exercise of the block, or null at the last. */
  next: ExerciseSolverLink | null;
  back: ExerciseSolverLink;
}
