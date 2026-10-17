import Link from "next/link";
import { TriangleExclamationIcon } from "@/components/icons/triangle-exclamation-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { ExerciseCard } from "@/components/platform/shared/exercise-card/exercise-card.comp";
import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { staffRoutes } from "@/lib/platform-routes";
import type { StaffExercisesView, StaffSeriesCard } from "@/services/staff-exercises/staff-exercises.types";
import "./staff-exercises.section.css";

interface StaffExercisesSectionProps {
  view: StaffExercisesView;
  notice?: string;
  errorMessage?: string;
}

/** «5 ejercicios · publicada» / «· sin publicar». */
function seriesFacts(series: StaffSeriesCard): string {
  return [
    `${series.itemCount} ${series.itemCount === 1 ? "ejercicio" : "ejercicios"}`,
    series.isPublished ? "publicada" : "sin publicar",
  ].join(" · ");
}

/** The «Series» view: each academy series with what it holds, whether every student sees it, and what they no longer see. */
function SeriesList({ series }: { series: StaffSeriesCard[] }) {
  if (series.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay series de la academia."
        description="Una serie es una lista ordenada de ejercicios de la biblioteca que ven todos los alumnos en «Ejercicios» al publicarla: créala con «Nueva serie»."
      />
    );
  }
  return (
    <ul className="staff-exercises__series">
      {series.map((item) => (
        <li key={item.id} className="staff-exercises__series-item">
          <h3 className="staff-exercises__series-title">
            <Link href={item.href} className="staff-exercises__series-link">
              {item.title}
            </Link>
          </h3>
          <p className="staff-exercises__series-facts">{seriesFacts(item)}</p>
          {item.description && <p className="staff-exercises__series-description">{item.description}</p>}
          {item.unavailableCount > 0 && (
            <p className="staff-exercises__series-warning">
              <TriangleExclamationIcon variant="classic-solid" className="staff-exercises__series-warning-icon" />
              {item.unavailableCount === 1
                ? "Los alumnos ya no ven 1 de sus ejercicios."
                : `Los alumnos ya no ven ${item.unavailableCount} de sus ejercicios.`}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * The academy's exercise bank (PLAN.md §8): its views as pills — «Biblioteca»,
 * every exercise approved or published, the last first, then the academy's
 * drafts and archived ones; «En revisión», the teachers' proposals, the
 * oldest first, each with who proposed it and when; «Series», the academy's
 * series — and the cards, whose title opens the staff editor with its review
 * bar. The cards carry no row words: every decision is taken on the
 * exercise's page.
 */
export function StaffExercisesSection({ view, notice, errorMessage }: StaffExercisesSectionProps) {
  const review = view.tab === "revision";
  const series = view.tab === "series";
  return (
    <section className="staff-exercises">
      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <FilterPills
        label="Vista"
        pills={[
          {
            label: "Biblioteca",
            href: staffRoutes.exercises,
            count: view.counts.library,
            active: !review && !series,
          },
          { label: "En revisión", href: staffRoutes.exercisesReview, count: view.counts.review, active: review },
          { label: "Series", href: staffRoutes.exerciseSeriesList, count: view.counts.series, active: series },
        ]}
      />

      {series ? (
        <SeriesList series={view.series} />
      ) : review ? (
        view.review.length === 0 ? (
          <EmptyState
            title="No hay propuestas pendientes."
            description="Cuando un profesor proponga un ejercicio a la biblioteca aparecerá aquí, el más antiguo primero."
          />
        ) : (
          <ul className="staff-exercises__list">
            {view.review.map((item) => (
              <li key={item.card.id} className="staff-exercises__item">
                <p className="staff-exercises__submitted">{item.submittedLabel}</p>
                <ExerciseCard exercise={item.card} />
              </li>
            ))}
          </ul>
        )
      ) : view.library.length === 0 ? (
        <EmptyState
          title="La biblioteca todavía está vacía."
          description="Entra en ella lo que apruebes de los profesores en «En revisión» y lo que publique la academia con «Nuevo ejercicio». Es lo que los alumnos practican por su cuenta."
          actionLabel="Nuevo ejercicio"
          actionHref={staffRoutes.newExercise}
        />
      ) : (
        <ul className="staff-exercises__list">
          {view.library.map((card) => (
            <li key={card.id}>
              <ExerciseCard exercise={card} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
