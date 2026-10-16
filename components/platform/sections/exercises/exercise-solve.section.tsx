import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type { StudentSeriesExercise } from "@/services/exercises/exercises.types";

interface ExerciseSolveSectionProps {
  item: StudentSeriesExercise;
}

/**
 * The n-th exercise of a series, to solve (PLAN.md §5.3): the server side of
 * the solve screen, which hands `ExerciseSolver` the exercise, its place in
 * the series, the way on and back, and the action that records the attempt.
 */
export function ExerciseSolveSection({ item }: ExerciseSolveSectionProps) {
  return (
    // A new exercise is a new board: «Siguiente ejercicio» never carries the last one's state.
    <ExerciseSolver
      key={`${item.series.id}:${item.exercise.id}`}
      exercise={item.exercise}
      mode={item.mode}
      context={item.context}
      next={item.next ?? undefined}
      back={item.back}
      submit={submitExerciseAttempt}
    />
  );
}
