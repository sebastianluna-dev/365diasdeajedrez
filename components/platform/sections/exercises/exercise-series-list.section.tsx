import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { mdButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import type { StudentExercisesHome } from "@/services/exercises/exercises.types";
import { ExercisesToolbar } from "./exercises-toolbar.comp";
import "./exercise-series-list.section.css";

interface ExerciseSeriesListSectionProps {
  home: StudentExercisesHome;
  /** «De tu profesor» (`teacher`) or «Series de la academia» (`academy`, `?de=academia`). */
  view: "teacher" | "academy";
}

/**
 * The series the student may solve, on the panel of «Ejercicios» (the new
 * design system, 2026-10-23; PLAN.md §5.1): «De tu profesor», the series
 * their teacher gave them, newest first, or «Series de la academia», the
 * published ones, the last published first — each a row as Gmail lists mail,
 * with who gave it, what they solved of it IN that series and its row's
 * word, «Empezar» or «Continuar». The toolbar's one filled button is the way
 * on: the newest series with an exercise left that can count today, the
 * teacher's before the academy's, when it is in this view. Before the move
 * this was «Series y más», which also led to the practice, the contrarreloj
 * and the history: those are the side column's now.
 */
export function ExerciseSeriesListSection({ home, view }: ExerciseSeriesListSectionProps) {
  const series = view === "teacher" ? home.series : home.academySeries;
  const title = view === "teacher" ? "De tu profesor" : "Series de la academia";
  const continueWith =
    home.continueWith && series.some((item) => item.nextHref === home.continueWith?.href) ? home.continueWith : null;

  return (
    <section className="platform-workspace__panel exercise-series-list">
      <ExercisesToolbar
        trail={[{ label: "Ejercicios", href: platformRoutes.exercises }, { label: title }]}
        actions={
          continueWith
            ? [{ label: `Continuar con «${continueWith.title}»`, href: continueWith.href, tone: "filled" }]
            : []
        }
      />

      {series.length === 0 ? (
        <EmptyState
          title={
            view === "academy"
              ? "La academia aún no tiene series publicadas."
              : home.hasTeacher
                ? "Tu profesor aún no te ha dado ejercicios."
                : "Todavía no tienes ejercicios de un profesor. Cuando uno te dé una serie, aparecerá aquí."
          }
        />
      ) : (
        <ul className="exercise-series-list__rows">
          {series.map((item) => (
            <li key={item.id} className="exercise-series-list__row">
              <Link href={item.href} className="exercise-series-list__link">
                <span className="exercise-series-list__title">{item.title}</span>
                {item.teacherName && <span className="exercise-series-list__meta">{item.teacherName}</span>}
              </Link>
              <span className="exercise-series-list__count">
                {item.solved} de {item.total}
              </span>
              {item.nextHref && (
                <Link href={item.nextHref} className={`${mdButton("text", "sm")} exercise-series-list__go`}>
                  {item.started ? "Continuar" : "Empezar"}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
