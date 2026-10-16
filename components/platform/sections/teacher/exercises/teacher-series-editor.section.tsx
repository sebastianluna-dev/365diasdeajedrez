import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { SeriesProgressTable } from "@/components/platform/shared/series-progress-table/series-progress-table.comp";
import { StudentSharePanel } from "@/components/platform/shared/student-share-panel/student-share-panel.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import {
  addExercisesToSeries,
  deleteExerciseSeries,
  removeExerciseFromSeries,
  reorderExerciseSeries,
  shareSeriesWithStudent,
  unshareSeriesWithStudent,
  updateExerciseSeries,
} from "@/services/teacher-exercises/teacher-exercises.actions";
import type { SeriesProgressView, TeacherSeriesEditor } from "@/services/teacher-exercises/teacher-exercises.types";
import { AddSeriesExercisesButton } from "./add-series-exercises-popup/add-series-exercises-popup.comp";
import { DeleteSeries } from "./delete-series/delete-series.comp";
import { EditSeriesButton } from "./series-data-popup/series-data-popup.comp";
import { SeriesItems } from "./series-items/series-items.comp";
import "./teacher-series-editor.section.css";

interface TeacherSeriesEditorSectionProps {
  editor: TeacherSeriesEditor;
  /** On «Progreso»: who solved what. Null on «Ejercicios». */
  progress?: SeriesProgressView | null;
  notice?: string;
  errorMessage?: string;
}

/** «5 ejercicios · la tienen 2 alumnos». */
function factsOf(editor: TeacherSeriesEditor): string {
  const items = editor.items.length;
  const students = editor.shares.length;
  return [
    `${items} ${items === 1 ? "ejercicio" : "ejercicios"}`,
    students === 0
      ? "no la tiene ningún alumno"
      : `la ${students === 1 ? "tiene 1 alumno" : `tienen ${students} alumnos`}`,
  ].join(" · ");
}

/**
 * A series of the teacher's (D18, D31; PLAN.md §6.2): its title with the pen
 * that edits it, its exercises in the order its students solve them —
 * sortable, each with «Quitar» and the warning when the students no longer
 * see it —, «Agregar ejercicios» as the page's accent, who has it
 * (`StudentSharePanel`, the same panel as a collection's), and «Eliminar la
 * serie». Two views as pills: «Ejercicios», all that, and «Progreso», who
 * solved what (`SeriesProgressTable`, D24). Every action is bound here, on
 * the server, and handed down.
 */
export function TeacherSeriesEditorSection({
  editor,
  progress,
  notice,
  errorMessage,
}: TeacherSeriesEditorSectionProps) {
  const { series } = editor;
  const onProgress = progress !== null && progress !== undefined;
  return (
    <div className="teacher-series">
      <header className="platform-page__head">
        <Link href={teacherRoutes.exerciseSeriesList} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Series
        </Link>
        <div className="teacher-series__title-row">
          <h1 className="platform-page__title">{series.title}</h1>
          <EditSeriesButton
            series={{ title: series.title, description: series.description }}
            save={updateExerciseSeries.bind(null, series.id)}
          />
        </div>
        <p className="platform-page__subtitle">{factsOf(editor)}</p>
        {series.description && <p className="teacher-series__description">{series.description}</p>}
        <div className="platform-page__actions">
          <AddSeriesExercisesButton
            seriesId={series.id}
            exercises={editor.pickable}
            itemCount={editor.items.length}
            addExercisesToSeries={addExercisesToSeries}
          />
        </div>
      </header>

      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <FilterPills
        label="Vista"
        pills={[
          {
            label: "Ejercicios",
            href: teacherRoutes.exerciseSeries(series.id),
            count: editor.items.length,
            active: !onProgress,
          },
          { label: "Progreso", href: teacherRoutes.exerciseSeriesProgress(series.id), active: onProgress },
        ]}
      />

      {onProgress ? (
        <SeriesProgressTable progress={progress} />
      ) : (
        <div className="teacher-series__layout">
          <section className="teacher-series__items" aria-labelledby="teacher-series-items">
            <h2 id="teacher-series-items" className="teacher-series__heading">
              Ejercicios, en orden
            </h2>
            <SeriesItems
              seriesId={series.id}
              items={editor.items}
              actions={{ reorder: reorderExerciseSeries, remove: removeExerciseFromSeries }}
            />
          </section>

          <aside className="teacher-series__aside" aria-label="Alumnos y ajustes de la serie">
            <StudentSharePanel
              subject="series"
              layout="compact"
              shares={editor.shares}
              students={editor.students}
              share={shareSeriesWithStudent.bind(null, series.id)}
              unshare={unshareSeriesWithStudent.bind(null, series.id)}
            />
            <div className="teacher-series__danger">
              <DeleteSeries
                title={series.title}
                studentCount={editor.shares.length}
                action={deleteExerciseSeries.bind(null, series.id)}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
