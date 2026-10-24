import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type { StudentSeriesExercise } from "@/services/exercises/exercises.types";
import { ExercisesToolbar } from "./exercises-toolbar.comp";

interface ExerciseSolveSectionProps {
  item: StudentSeriesExercise;
}

/**
 * The n-th exercise of a series, to solve (PLAN.md §5.3), on the panel of
 * «Ejercicios» (the new design system, 2026-10-23): the toolbar — the
 * exercise's title, read out, and «Ejercicio 3 de 10» — and the
 * solve page, which `ExerciseSolver` draws from the exercise, its place in
 * the series, the way on and back, and the action that records the attempt.
 */
export function ExerciseSolveSection({ item }: ExerciseSolveSectionProps) {
  return (
    <section className="platform-workspace__panel">
      <ExercisesToolbar
        title={item.exercise.title}
        summary={`Ejercicio ${item.series.position} de ${item.series.total}`}
      />
      {/* A new exercise is a new board: «Siguiente ejercicio» never carries the last one's state. */}
      <ExerciseSolver
        key={`${item.series.id}:${item.exercise.id}`}
        exercise={item.exercise}
        mode={item.mode}
        context={item.context}
        next={item.next ?? undefined}
        back={item.back}
        submit={submitExerciseAttempt}
        aside={{
          scope: `series:${item.series.id}`,
          href: platformRoutes.exerciseSeriesItem(item.series.id, item.series.position),
        }}
      />
    </section>
  );
}
