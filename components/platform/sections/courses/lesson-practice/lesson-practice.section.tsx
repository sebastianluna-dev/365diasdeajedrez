import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type { LessonPracticeExercise } from "@/services/exercises/lesson-practice.types";

interface LessonPracticeSectionProps {
  item: LessonPracticeExercise;
}

/**
 * The n-th exercise of a lesson, to solve (D25; PLAN.md §7.1): the server
 * side of the solve screen, which hands `ExerciseSolver` the exercise, its
 * place in the lesson («2 / 3»), the way on and back to the lesson, and the
 * action that records the attempt with the context LESSON.
 */
export function LessonPracticeSection({ item }: LessonPracticeSectionProps) {
  return (
    // A new exercise is a new board: «Siguiente ejercicio» never carries the last one's state.
    <ExerciseSolver
      key={`${item.lesson.id}:${item.exercise.id}`}
      exercise={item.exercise}
      mode={item.mode}
      context={item.context}
      next={item.next ?? undefined}
      back={item.back}
      submit={submitExerciseAttempt}
    />
  );
}
