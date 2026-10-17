import Link from "next/link";
import { TriangleExclamationIcon } from "@/components/icons/triangle-exclamation-icon.comp";
import { ExerciseCard } from "@/components/platform/shared/exercise-card/exercise-card.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import {
  archiveTeacherExercise,
  deleteTeacherExercise,
  duplicateTeacherExercise,
  proposeTeacherExercise,
  restoreTeacherExercise,
  withdrawTeacherExercise,
} from "@/services/teacher-exercises/teacher-exercises.actions";
import type { TeacherExercisesView, TeacherSeriesCard } from "@/services/teacher-exercises/teacher-exercises.types";
import "./teacher-exercises.section.css";

interface TeacherExercisesSectionProps {
  view: TeacherExercisesView;
  notice?: string;
  errorMessage?: string;
}

/** «5 ejercicios · la tienen 2 alumnos». */
function seriesFacts(series: TeacherSeriesCard): string {
  const students = series.studentCount;
  return [
    `${series.itemCount} ${series.itemCount === 1 ? "ejercicio" : "ejercicios"}`,
    students === 0
      ? "no la tiene ningún alumno"
      : `la ${students === 1 ? "tiene 1 alumno" : `tienen ${students} alumnos`}`,
  ].join(" · ");
}

/** The «Series» view: each series with what it holds, who has it and what its students no longer see. */
function SeriesList({ series }: { series: TeacherSeriesCard[] }) {
  if (series.length === 0) {
    return (
      <EmptyState
        title="Todavía no tienes series."
        description="Una serie es una lista ordenada de tus ejercicios que das a tus alumnos: créala con «Nueva serie» y agrégale los que estén listos."
      />
    );
  }
  return (
    <ul className="teacher-exercises__series">
      {series.map((item) => (
        <li key={item.id} className="teacher-exercises__series-item">
          <h3 className="teacher-exercises__series-title">
            <Link href={item.href} className="teacher-exercises__series-link">
              {item.title}
            </Link>
          </h3>
          <p className="teacher-exercises__series-facts">{seriesFacts(item)}</p>
          {item.description && <p className="teacher-exercises__series-description">{item.description}</p>}
          {item.unavailableCount > 0 && (
            <p className="teacher-exercises__series-warning">
              <TriangleExclamationIcon variant="classic-solid" className="teacher-exercises__series-warning-icon" />
              {item.unavailableCount === 1
                ? "Tus alumnos ya no ven 1 de sus ejercicios."
                : `Tus alumnos ya no ven ${item.unavailableCount} de sus ejercicios.`}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * «Ejercicios» of a teacher: the four views as pills — what is in use, what
 * was archived, the series and the library (D08: the approved exercises they
 * may pick for a series or a block, read-only) — and the cards, the last
 * changed first. The row actions are imported here and handed to the cards,
 * which import none; a library card gets none.
 */
export function TeacherExercisesSection({ view, notice, errorMessage }: TeacherExercisesSectionProps) {
  const archived = view.tab === "archivados";
  const series = view.tab === "series";
  const library = view.tab === "biblioteca";
  return (
    <section className="teacher-exercises">
      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <FilterPills
        label="Vista"
        pills={[
          {
            label: "En uso",
            href: teacherRoutes.exercises,
            count: view.counts.active,
            active: !archived && !series && !library,
          },
          {
            label: "Archivados",
            href: teacherRoutes.archivedExercises,
            count: view.counts.archived,
            active: archived,
          },
          { label: "Series", href: teacherRoutes.exerciseSeriesList, count: view.counts.series, active: series },
          {
            label: "Biblioteca",
            href: teacherRoutes.libraryExercises,
            count: view.counts.library,
            active: library,
          },
        ]}
      />

      {series ? (
        <SeriesList series={view.series} />
      ) : view.exercises.length === 0 ? (
        archived ? (
          <EmptyState title="No tienes ejercicios archivados." />
        ) : library ? (
          <EmptyState
            title="La biblioteca todavía está vacía."
            description="Aquí verás los ejercicios aprobados de la academia y de otros profesores: puedes agregarlos a tus series y a tus clases. Propón los tuyos desde «En uso»."
          />
        ) : (
          <EmptyState
            title="Todavía no tienes ejercicios."
            description="Coloca una posición, juega la solución en el tablero y dale un título. Cuando esté listo, agrégalo a una serie y dásela a tus alumnos: así lo ven."
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
                actions={
                  library
                    ? undefined
                    : {
                        duplicate: duplicateTeacherExercise,
                        archive: archiveTeacherExercise,
                        restore: restoreTeacherExercise,
                        delete: deleteTeacherExercise,
                        propose: proposeTeacherExercise,
                        withdraw: withdrawTeacherExercise,
                      }
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
