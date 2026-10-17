import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { StudentSeriesView } from "@/services/exercises/exercises.types";
import "./exercise-series.section.css";

interface ExerciseSeriesSectionProps {
  series: StudentSeriesView;
}

/**
 * A series given to the student (PLAN.md §5.2): its head with who gave it and
 * what they solved, the page's one accent to the first exercise not solved
 * yet, and its exercises in order — each the start position small, its title
 * and facts, and the student's mark in THIS series: «Resuelto» or «Fallado»,
 * always written beside its icon. Only the exercises they may solve are listed.
 */
export function ExerciseSeriesSection({ series }: ExerciseSeriesSectionProps) {
  const subtitle = [
    series.teacherName ? `De ${series.teacherName}` : null,
    `${series.solved} de ${series.items.length} resueltos`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <header className="platform-page__head">
        <Link href={platformRoutes.exerciseOverview} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Series y más
        </Link>
        <h1 className="platform-page__title">{series.title}</h1>
        <p className="platform-page__subtitle">{subtitle}</p>
        {series.start && (
          <div className="platform-page__actions">
            <Link
              href={series.start.href}
              className="platform-button platform-button_variant_accent platform-button_size_lg"
            >
              {series.start.label}
            </Link>
          </div>
        )}
      </header>

      <section className="exercise-series" aria-label="Ejercicios de la serie">
        {series.description && <p className="exercise-series__description">{series.description}</p>}

        {series.items.length === 0 ? (
          <EmptyState title="Esta serie todavía no tiene ejercicios para ti." />
        ) : (
          <ol className="exercise-series__list">
            {series.items.map((item) => (
              <li key={item.n} className="exercise-series__item">
                <Link href={item.href} className="exercise-series__link">
                  <span className="exercise-series__diagram">
                    <StaticDiagram fen={item.startFen} orientation={item.orientation} />
                  </span>
                  <span className="exercise-series__body">
                    <span className="exercise-series__title">
                      {item.n}. {item.title}
                    </span>
                    <span className="exercise-series__facts">{item.facts}</span>
                  </span>
                  {item.mark === "solved" && (
                    <span className="exercise-series__mark exercise-series__mark_state_solved">
                      <CircleCheckIcon variant="classic-solid" className="exercise-series__mark-icon" />
                      Resuelto
                    </span>
                  )}
                  {item.mark === "failed" && (
                    <span className="exercise-series__mark exercise-series__mark_state_failed">
                      <CircleXmarkIcon variant="classic-solid" className="exercise-series__mark-icon" />
                      Fallado
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
