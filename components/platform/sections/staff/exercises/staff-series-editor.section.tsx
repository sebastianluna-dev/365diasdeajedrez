import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { AddSeriesExercisesButton } from "@/components/platform/shared/add-series-exercises-popup/add-series-exercises-popup.comp";
import { DeleteSeries } from "@/components/platform/shared/delete-series/delete-series.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { EditSeriesButton } from "@/components/platform/shared/series-data-popup/series-data-popup.comp";
import { SeriesItems } from "@/components/platform/shared/series-items/series-items.comp";
import { staffRoutes } from "@/lib/platform-routes";
import {
  addExercisesToAcademySeries,
  deleteAcademySeries,
  removeExerciseFromAcademySeries,
  reorderAcademySeries,
  setAcademySeriesPublished,
  updateAcademySeries,
} from "@/services/staff-exercises/staff-exercises.actions";
import type { StaffSeriesEditor } from "@/services/staff-exercises/staff-exercises.types";
import { SeriesPublishSwitch } from "./series-publish-switch/series-publish-switch.comp";
import "./staff-series-editor.section.css";

interface StaffSeriesEditorSectionProps {
  editor: StaffSeriesEditor;
  notice?: string;
  errorMessage?: string;
}

/**
 * An academy series (PLAN.md §8, D32): the teacher's series editor without
 * the share panel — the title with its pen, the exercises in order, sortable,
 * each with «Quitar», «Agregar ejercicios» over the library alone — plus the
 * «Publicada» switch, which gives it to every student, and «Eliminar la
 * serie». The pieces are the shared series pieces, with the academy's wording; every
 * action is bound here, on the server, and handed down.
 */
export function StaffSeriesEditorSection({ editor, notice, errorMessage }: StaffSeriesEditorSectionProps) {
  const { series } = editor;
  const items = editor.items.length;
  return (
    <div className="staff-series">
      <header className="platform-page__head">
        <Link href={staffRoutes.exerciseSeriesList} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Series
        </Link>
        <div className="staff-series__title-row">
          <h1 className="platform-page__title">{series.title}</h1>
          <EditSeriesButton
            series={{ title: series.title, description: series.description }}
            save={updateAcademySeries.bind(null, series.id)}
            audience="academy"
          />
        </div>
        <p className="platform-page__subtitle">
          {`${items} ${items === 1 ? "ejercicio" : "ejercicios"} · ${series.isPublished ? "publicada: la ven todos los alumnos" : "sin publicar: sólo la ve el equipo"}`}
        </p>
        {series.description && <p className="staff-series__description">{series.description}</p>}
        <div className="platform-page__actions">
          <AddSeriesExercisesButton
            seriesId={series.id}
            exercises={editor.pickable}
            itemCount={items}
            addExercisesToSeries={addExercisesToAcademySeries}
            source="library"
          />
        </div>
      </header>

      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <div className="staff-series__layout">
        <section className="staff-series__items" aria-labelledby="staff-series-items">
          <h2 id="staff-series-items" className="staff-series__heading">
            Ejercicios, en orden
          </h2>
          <SeriesItems
            seriesId={series.id}
            items={editor.items}
            actions={{ reorder: reorderAcademySeries, remove: removeExerciseFromAcademySeries }}
            audience="academy"
          />
        </section>

        <aside className="staff-series__aside" aria-label="Publicación y ajustes de la serie">
          <SeriesPublishSwitch
            seriesId={series.id}
            published={series.isPublished}
            publishedLabel={series.publishedLabel}
            itemCount={items}
            action={setAcademySeriesPublished}
          />
          <div className="staff-series__danger">
            <DeleteSeries
              title={series.title}
              studentCount={0}
              audience="academy"
              published={series.isPublished}
              action={deleteAcademySeries.bind(null, series.id)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
