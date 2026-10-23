import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { StudentSeriesView } from "@/services/exercises/exercises.types";
import { ExercisesToolbar } from "./exercises-toolbar.comp";
import "./exercise-series.section.css";

interface ExerciseSeriesSectionProps {
  series: StudentSeriesView;
  /** Whose it is, for the trail: the teacher's («De tu profesor») or the academy's. */
  academy: boolean;
}

/**
 * A series given to the student (PLAN.md §5.2), on the panel of «Ejercicios»
 * (the new design system, 2026-10-23): the toolbar — the trail through its
 * view, what they solved of it, and the page's one filled button to the first
 * exercise not solved yet — its description and who gave it, and its
 * exercises in order, as Gmail lists mail — each the start position small on
 * the material board, its title and facts, and the student's mark in THIS
 * series: «Resuelto» or «Fallado», always written beside its icon. Only the
 * exercises they may solve are listed.
 */
export function ExerciseSeriesSection({ series, academy }: ExerciseSeriesSectionProps) {
  const about = [series.teacherName ? `De ${series.teacherName}` : null, series.description].filter(Boolean);

  return (
    <section className="platform-workspace__panel exercise-series">
      <ExercisesToolbar
        trail={[
          { label: "Ejercicios", href: platformRoutes.exercises },
          academy
            ? { label: "Series de la academia", href: platformRoutes.exerciseAcademySeries }
            : { label: "De tu profesor", href: platformRoutes.exerciseOverview },
          { label: series.title },
        ]}
        summary={`${series.solved} de ${series.items.length} resueltos`}
        actions={series.start ? [{ label: series.start.label, href: series.start.href, tone: "filled" }] : []}
      />

      {about.length > 0 && <p className="exercise-series__description">{about.join(" · ")}</p>}

      {series.items.length === 0 ? (
        <EmptyState title="Esta serie todavía no tiene ejercicios para ti." />
      ) : (
        <ol className="exercise-series__list" aria-label="Ejercicios de la serie">
          {series.items.map((item) => (
            <li key={item.n}>
              <Link href={item.href} className="exercise-series__link">
                <span className="exercise-series__diagram">
                  <StaticDiagram fen={item.startFen} orientation={item.orientation} look="material" />
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
  );
}
