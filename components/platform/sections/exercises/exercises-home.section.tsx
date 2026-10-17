import Link from "next/link";
import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { ClockRotateLeftIcon } from "@/components/icons/clock-rotate-left-icon.comp";
import { StopwatchIcon } from "@/components/icons/stopwatch-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { StudentExercisesHome, StudentSeriesSummary } from "@/services/exercises/exercises.types";
import type { PracticeFilters as PracticeFiltersData } from "@/services/exercises/practice.types";
import { PracticeFilters } from "./practice-filters/practice-filters.comp";
import "./exercises-home.section.css";

interface ExercisesHomeSectionProps {
  home: StudentExercisesHome;
  /** «Práctica libre» (D18, D32): the topics and levels to choose from. */
  practice: PracticeFiltersData;
}

/** The rows of a card: each series, its teacher and count, and its row's word. */
function SeriesRows({ series }: { series: StudentSeriesSummary[] }) {
  return (
    <ul className="exercises-home__list">
      {series.map((item) => (
        <li key={item.id} className="exercises-home__row">
          <div className="exercises-home__body">
            <Link href={item.href} className="exercises-home__title">
              {item.title}
            </Link>
            <p className="exercises-home__meta">
              {item.teacherName && <span>{item.teacherName}</span>}
              <span className="exercises-home__count">
                {item.solved} de {item.total}
              </span>
            </p>
          </div>
          {item.nextHref && (
            <Link href={item.nextHref} className="platform-row-action">
              {item.started ? "Continuar" : "Empezar"}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * «Ejercicios», the student's home (PLAN.md §5.1): «De tu profesor», the
 * series their teacher gave them, newest first, each with what they solved
 * of it and its row's word; with the library (phase 4), «Práctica libre»
 * (D18, D32: a topic, a level and «Empezar») and «Series de la academia»,
 * the published ones, drawn only when there are some. The screen's one
 * accent is the way on: the newest series with an exercise left, the
 * teacher's before the academy's, or else «Empezar».
 */
export function ExercisesHomeSection({ home, practice }: ExercisesHomeSectionProps) {
  return (
    <>
      <section className="platform-card exercises-home" aria-labelledby="exercises-home-teacher">
        <h2 className="platform-card__title" id="exercises-home-teacher">
          De tu profesor
        </h2>

        {home.series.length === 0 ? (
          <EmptyState
            title={
              home.hasTeacher
                ? "Tu profesor aún no te ha dado ejercicios."
                : "Todavía no tienes ejercicios de un profesor. Cuando uno te dé una serie, aparecerá aquí."
            }
          />
        ) : (
          <SeriesRows series={home.series} />
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

      <section className="platform-card exercises-home" aria-labelledby="exercises-home-practice">
        <h2 className="platform-card__title" id="exercises-home-practice">
          Práctica libre
        </h2>
        <p className="exercises-home__lead">
          Un ejercicio de la biblioteca al azar, del tema y el nivel que elijas; al terminar, otro.
        </p>
        <PracticeFilters
          filters={practice}
          choice={{ topicCode: null, levelSlug: null }}
          variant="home"
          accent={home.continueWith === null}
        />
      </section>

      {home.academySeries.length > 0 && (
        <section className="platform-card exercises-home" aria-labelledby="exercises-home-academy">
          <h2 className="platform-card__title" id="exercises-home-academy">
            Series de la academia
          </h2>
          <SeriesRows series={home.academySeries} />
        </section>
      )}

      <section className="platform-card exercises-home" aria-labelledby="exercises-home-storm">
        <h2 className="platform-card__title" id="exercises-home-storm">
          Contrarreloj
        </h2>
        <p className="exercises-home__lead">
          Tres minutos, ejercicios cada vez más difíciles: un acierto suma un punto y al tercer error se acaba.
        </p>
        <Link href={platformRoutes.exerciseStorm} className="platform-button exercises-home__go">
          <StopwatchIcon variant="classic-solid" className="platform-button__icon" />
          Jugar contrarreloj
        </Link>
      </section>

      <section className="platform-card exercises-home" aria-labelledby="exercises-home-history">
        <h2 className="platform-card__title" id="exercises-home-history">
          Historial
        </h2>
        <p className="exercises-home__lead">
          Cada intento que contó, con su resultado y, si fallaste, la jugada que era.
        </p>
        <Link href={platformRoutes.exerciseHistory} className="platform-button exercises-home__go">
          <ClockRotateLeftIcon variant="classic-solid" className="platform-button__icon" />
          Ver el historial
        </Link>
      </section>
    </>
  );
}
