"use client";

import Link from "next/link";
import { ArrowDownRightIcon } from "@/components/icons/arrow-down-right-icon.comp";
import { ArrowUpRightIcon } from "@/components/icons/arrow-up-right-icon.comp";
import { BullseyeIcon } from "@/components/icons/bullseye-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { ChessKingIcon } from "@/components/icons/chess-king-icon.comp";
import { PlatformSwitch } from "@/components/platform/shared/platform-switch/platform-switch.comp";
import { exerciseKindLabel } from "@/lib/chess/exercise-labels";
import { setRatingSwitch, useExerciseRating } from "./exercise-rating.store";
import type {
  ExerciseSolverAside,
  ExerciseSolverExercise,
} from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import "./exercise-solve-aside.comp.css";

interface ExerciseSolveAsideProps {
  aside: ExerciseSolverAside;
  exercise: ExerciseSolverExercise;
}

/** The ring's radius, in the 88-unit box it is drawn in. */
const RING_RADIUS = 36;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * The full solve page's left column: the exercise and where it comes from,
 * the rating (sample data, kept in this browser), the series' ring or the
 * topic's card, and the settings. Under 1024px it goes under the board.
 */
export function ExerciseSolveAside({ aside, exercise }: ExerciseSolveAsideProps) {
  const rating = useExerciseRating();
  const topicTally = aside.topic ? rating.topics[aside.topic.code] : undefined;
  const delta = rating.lastDelta;

  return (
    <aside className="exercise-solve-aside" aria-label="Datos del ejercicio">
      <section className="exercise-solve-aside__card">
        <div className="exercise-solve-aside__fact">
          <BullseyeIcon className="exercise-solve-aside__fact-icon" />
          <div className="exercise-solve-aside__fact-text">
            <p className="exercise-solve-aside__title">{exercise.title}</p>
            <p className="exercise-solve-aside__muted">
              {exerciseKindLabel(exercise.kind, exercise.mateIn)} · {exercise.difficulty}
            </p>
          </div>
        </div>
        <div className="exercise-solve-aside__fact exercise-solve-aside__fact_rule_top">
          <ChessBoardIcon className="exercise-solve-aside__fact-icon" />
          <p className="exercise-solve-aside__muted">Posición de estudio</p>
        </div>
      </section>

      <section className="exercise-solve-aside__card" aria-label="Tu puntuación">
        <PlatformSwitch
          label="Cuenta para tu puntuación"
          checked={rating.rated}
          onCheckedChange={(on) => setRatingSwitch("rated", on)}
          tone="accent"
          layout="inline"
        />
        <p className="exercise-solve-aside__rating">
          <span className="exercise-solve-aside__rating-value">{rating.rating}</span>
          {delta !== null && delta !== 0 && (
            <span
              className={`exercise-solve-aside__delta exercise-solve-aside__delta_tone_${delta > 0 ? "up" : "down"}`}
            >
              {delta > 0 ? (
                <ArrowUpRightIcon variant="classic-solid" className="exercise-solve-aside__delta-icon" />
              ) : (
                <ArrowDownRightIcon variant="classic-solid" className="exercise-solve-aside__delta-icon" />
              )}
              {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
            </span>
          )}
        </p>
      </section>

      {aside.series && (
        <section className="exercise-solve-aside__card exercise-solve-aside__card_kind_series">
          <svg
            className="exercise-solve-aside__ring"
            viewBox="0 0 88 88"
            role="img"
            aria-label={`Ejercicio ${aside.series.position} de ${aside.series.total}`}
          >
            <circle className="exercise-solve-aside__ring-track" cx="44" cy="44" r={RING_RADIUS} />
            <circle
              className="exercise-solve-aside__ring-fill"
              cx="44"
              cy="44"
              r={RING_RADIUS}
              strokeDasharray={`${(RING_LENGTH * aside.series.position) / Math.max(1, aside.series.total)} ${RING_LENGTH}`}
              transform="rotate(-90 44 44)"
            />
            <text className="exercise-solve-aside__ring-text" x="44" y="50" textAnchor="middle">
              {aside.series.position}/{aside.series.total}
            </text>
          </svg>
          <div className="exercise-solve-aside__fact-text">
            <p className="exercise-solve-aside__title">{aside.series.title}</p>
            <p className="exercise-solve-aside__muted">Serie de ejercicios</p>
          </div>
        </section>
      )}

      {aside.topic && (
        <section className="exercise-solve-aside__card">
          <div className="exercise-solve-aside__fact">
            <span className="exercise-solve-aside__topic-mark">
              <ChessKingIcon variant="duotone-solid" className="exercise-solve-aside__topic-icon" />
            </span>
            <div className="exercise-solve-aside__fact-text">
              <p className="exercise-solve-aside__muted">Tema</p>
              <p className="exercise-solve-aside__title">{aside.topic.label}</p>
              <Link href={aside.topic.changeHref} className="exercise-solve-aside__link">
                Cambiar de tema
              </Link>
            </div>
          </div>
          <div className="exercise-solve-aside__stats">
            <p className="exercise-solve-aside__stat">
              <span className="exercise-solve-aside__stat-value">
                {topicTally && topicTally.attempts > 0
                  ? `${Math.round((topicTally.passed / topicTally.attempts) * 100)}%`
                  : "—"}
              </span>
              <span className="exercise-solve-aside__muted">de acierto</span>
            </p>
            <p className="exercise-solve-aside__stat">
              <span className="exercise-solve-aside__stat-value">{topicTally?.passed ?? 0}</span>
              <span className="exercise-solve-aside__muted">resueltos</span>
            </p>
          </div>
        </section>
      )}

      <section className="exercise-solve-aside__card" aria-label="Ajustes">
        <PlatformSwitch
          label="Pasar al siguiente al resolver"
          checked={rating.autoNext}
          onCheckedChange={(on) => setRatingSwitch("autoNext", on)}
          tone="accent"
          layout="inline"
        />
      </section>
    </aside>
  );
}
