import { ExerciseCard } from "@/components/platform/shared/exercise-card/exercise-card.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import {
  archiveTeacherExercise,
  deleteTeacherExercise,
  duplicateTeacherExercise,
  restoreTeacherExercise,
} from "@/services/teacher-exercises/teacher-exercises.actions";
import type { TeacherExercisesView } from "@/services/teacher-exercises/teacher-exercises.types";
import "./teacher-exercises.section.css";

interface TeacherExercisesSectionProps {
  view: TeacherExercisesView;
  notice?: string;
  errorMessage?: string;
}

/**
 * «Ejercicios» of a teacher: the two views as pills — what is in use, and
 * what was archived — and the cards, the last changed first. The row actions
 * are imported here and handed to the cards, which import none.
 */
export function TeacherExercisesSection({ view, notice, errorMessage }: TeacherExercisesSectionProps) {
  const archived = view.tab === "archivados";
  return (
    <section className="teacher-exercises">
      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <FilterPills
        label="Vista"
        pills={[
          { label: "En uso", href: teacherRoutes.exercises, count: view.counts.active, active: !archived },
          {
            label: "Archivados",
            href: teacherRoutes.archivedExercises,
            count: view.counts.archived,
            active: archived,
          },
        ]}
      />

      {view.exercises.length === 0 ? (
        archived ? (
          <EmptyState title="No tienes ejercicios archivados." />
        ) : (
          <EmptyState
            title="Todavía no tienes ejercicios."
            description="Coloca una posición, juega la solución en el tablero y dale un título: tus alumnos lo verán cuando lo marques como listo."
            actionLabel="Nuevo ejercicio"
            actionHref={teacherRoutes.newExercise()}
          />
        )
      ) : (
        <ul className="teacher-exercises__list">
          {view.exercises.map((exercise) => (
            <li key={exercise.id}>
              <ExerciseCard
                exercise={exercise}
                actions={{
                  duplicate: duplicateTeacherExercise,
                  archive: archiveTeacherExercise,
                  restore: restoreTeacherExercise,
                  delete: deleteTeacherExercise,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
