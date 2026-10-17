import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type { ClassPracticeExercise } from "@/services/exercises/class-practice.types";

interface ClassPracticeSectionProps {
  item: ClassPracticeExercise;
}

/**
 * The n-th exercise of a class's EXERCISE block, to solve (D29; PLAN.md §7.2):
 * the server side of the solve screen, which hands `ExerciseSolver` the
 * exercise, its place in the block («2 / 3»), the way on and back to the
 * class, and the action that records the attempt with the context CLASS.
 */
export function ClassPracticeSection({ item }: ClassPracticeSectionProps) {
  return (
    // A new exercise is a new board: «Siguiente ejercicio» never carries the last one's state.
    <ExerciseSolver
      key={`${item.classBlock.blockId}:${item.exercise.id}`}
      exercise={item.exercise}
      mode={item.mode}
      context={item.context}
      next={item.next ?? undefined}
      back={item.back}
      submit={submitExerciseAttempt}
    />
  );
}
