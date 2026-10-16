"use client";

import Link from "next/link";
import { useRef } from "react";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { EXERCISE_STATUS, type ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import type { ExerciseCardActions, ExerciseCardData } from "./exercise-card.types";
import "./exercise-card.comp.css";

interface ExerciseCardProps {
  exercise: ExerciseCardData;
  /** The row actions; without them the card only leads to the exercise. */
  actions?: ExerciseCardActions;
}

/** The tag's tone by status: a draft is plain, a ready one the success's, an archived one muted. */
const TAG_VARIANTS: Record<ExerciseStatusCode, string | null> = {
  [EXERCISE_STATUS.DRAFT]: null,
  [EXERCISE_STATUS.READY]: "success",
  [EXERCISE_STATUS.IN_REVIEW]: "warning",
  [EXERCISE_STATUS.PUBLISHED]: "accent",
  [EXERCISE_STATUS.ARCHIVED]: null,
};

/**
 * An exercise of a bank: its start position drawn small, the title that
 * opens it, its status, its kind, its difficulty with the level it falls in,
 * the student's moves and its topics; and, with `actions`, the row's words —
 * «Duplicar», «Archivar» or «Restaurar», and «Eliminar» behind its
 * confirmation, only for one nobody has tried yet.
 */
export function ExerciseCard({ exercise, actions }: ExerciseCardProps) {
  const confirmRef = useRef<PlatformConfirmPopupHandle>(null);
  const variant = TAG_VARIANTS[exercise.statusCode];
  const moves = `${exercise.playerMoves} ${exercise.playerMoves === 1 ? "jugada" : "jugadas"}`;
  const difficulty = exercise.levelName ? `${exercise.difficulty} · ${exercise.levelName}` : `${exercise.difficulty}`;

  return (
    <article
      className={`exercise-card${exercise.statusCode === EXERCISE_STATUS.ARCHIVED ? " exercise-card_state_archived" : ""}`}
    >
      <div className="exercise-card__diagram">
        <StaticDiagram fen={exercise.startFen} orientation={exercise.orientation} />
      </div>

      <div className="exercise-card__body">
        <p className="exercise-card__tags">
          <span className={`platform-tag${variant ? ` platform-tag_variant_${variant}` : ""}`}>
            {exercise.statusLabel}
          </span>
          <span className="platform-tag">{exercise.kindLabel}</span>
        </p>
        <h3 className="exercise-card__title">
          <Link href={exercise.href} className="exercise-card__link">
            {exercise.title}
          </Link>
        </h3>
        <p className="exercise-card__meta">
          Dificultad {difficulty} · {moves}
        </p>
        {exercise.topicLabels.length > 0 && <p className="exercise-card__topics">{exercise.topicLabels.join(", ")}</p>}

        {actions && (
          <div className="exercise-card__actions">
            {exercise.allowed.duplicate && (
              <form action={actions.duplicate.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Duplicando…">
                  Duplicar
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.archive && (
              <form action={actions.archive.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Archivando…">
                  Archivar
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.restore && (
              <form action={actions.restore.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Restaurando…">
                  Restaurar
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.delete && (
              <button
                type="button"
                className="platform-row-action platform-row-action_variant_danger"
                onClick={(event) => confirmRef.current?.open(event)}
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>

      {actions && exercise.allowed.delete && (
        <PlatformConfirmPopup
          ref={confirmRef}
          subject={exercise.title}
          description="Se elimina el ejercicio con su solución. Si está en alguna serie, sale de ella."
          confirmLabel="Eliminar ejercicio"
          action={actions.delete.bind(null, exercise.id)}
        />
      )}
    </article>
  );
}
