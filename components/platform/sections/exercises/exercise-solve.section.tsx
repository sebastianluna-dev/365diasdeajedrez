import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type { StudentSeriesExercise } from "@/services/exercises/exercises.types";
import { ExercisesToolbar } from "./exercises-toolbar.comp";

interface ExerciseSolveSectionProps {
  item: StudentSeriesExercise;
  /** Whose the series is, for the trail: the teacher's («De tu profesor») or the academy's. */
  academy: boolean;
}

/**
 * The n-th exercise of a series, to solve (PLAN.md §5.3), on the panel of
 * «Ejercicios» (the new design system, 2026-10-23): the toolbar — the trail
 * through the series' view and the series, and «Ejercicio 3 de 10» — and the
 * solve page, which `ExerciseSolver` draws from the exercise, its place in
 * the series, the way on and back, and the action that records the attempt.
 */
export function ExerciseSolveSection({ item, academy }: ExerciseSolveSectionProps) {
  return (
    <section className="platform-workspace__panel">
      <ExercisesToolbar
        trail={[
          { label: "Ejercicios", href: platformRoutes.exercises },
          academy
            ? { label: "Series de la academia", href: platformRoutes.exerciseAcademySeries }
            : { label: "De tu profesor", href: platformRoutes.exerciseOverview },
          { label: item.series.title, href: item.series.href },
          { label: item.exercise.title },
        ]}
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
