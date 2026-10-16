import Link from "next/link";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import type { StudentExercisesHome } from "@/services/exercises/exercises.types";
import "./exercises-home.section.css";

interface ExercisesHomeSectionProps {
  home: StudentExercisesHome;
}

/**
 * «Ejercicios», the student's home (PLAN.md §5.1). Until the library (phase 4)
 * it holds one card, «De tu profesor»: the series their teacher gave them,
 * newest first, each with what they solved of it and its row's word. The
 * screen's one accent is the way on: the newest series with an exercise left.
 */
export function ExercisesHomeSection({ home }: ExercisesHomeSectionProps) {
  return (
    <section className="platform-card exercises-home" aria-labelledby="exercises-home-teacher">
      <h2 className="platform-card__title" id="exercises-home-teacher">
        De tu profesor
      </h2>

      {home.series.length === 0 ? (
        <EmptyState
          title={
            home.hasTeacher
              ? "Tu profesor aún no te ha dado ejercicios."
              : "Todavía no tienes ejercicios. Cuando un profesor te dé una serie, aparecerá aquí."
          }
        />
      ) : (
        <ul className="exercises-home__list">
          {home.series.map((series) => (
            <li key={series.id} className="exercises-home__row">
              <div className="exercises-home__body">
                <Link href={series.href} className="exercises-home__title">
                  {series.title}
                </Link>
                <p className="exercises-home__meta">
                  {series.teacherName && <span>{series.teacherName}</span>}
                  <span className="exercises-home__count">
                    {series.solved} de {series.total}
                  </span>
                </p>
              </div>
              {series.nextHref && (
                <Link href={series.nextHref} className="platform-row-action">
                  {series.started ? "Continuar" : "Empezar"}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      {home.continueWith && (
        <Link
          href={home.continueWith.href}
          className="platform-button platform-button_variant_accent exercises-home__go"
        >
          Continuar con «{home.continueWith.title}»
          <AngleRightIcon variant="classic-solid" className="platform-button__icon" />
        </Link>
      )}
    </section>
  );
}
