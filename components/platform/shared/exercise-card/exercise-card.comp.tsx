import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { DeleteExercise } from "@/components/platform/shared/delete-exercise/delete-exercise.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import { EXERCISE_STATUS, type ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import type { ExerciseCardActions, ExerciseCardData } from "./exercise-card.types";
import "./exercise-card.comp.css";

interface ExerciseCardProps {
  exercise: ExerciseCardData;
  /** The row actions; without them the card only leads to the exercise. An action not given is not drawn. */
  actions?: ExerciseCardActions;
  /** What «Eliminar»'s confirmation says goes; by default, the bank's sentence (the series it leaves). */
  deleteDescription?: string;
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
 * «Duplicar», «Archivar» or «Restaurar», «Proponer a la biblioteca» or
 * «Retirar la propuesta», and «Eliminar» behind its confirmation
 * (`DeleteExercise`, the card's one client leaf), only for one nobody has
 * tried yet. Each word needs its action given and allowed. A returned one
 * carries the staff's note («Devuelto: …»); a library's card may name its
 * author and lead nowhere (a teacher has no page of it).
 */
export function ExerciseCard({ exercise, actions, deleteDescription }: ExerciseCardProps) {
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
          {exercise.href ? (
            <Link href={exercise.href} className="exercise-card__link">
              {exercise.title}
            </Link>
          ) : (
            exercise.title
          )}
        </h3>
        <p className="exercise-card__meta">
          Dificultad {difficulty} · {moves}
          {exercise.authorLabel && ` · ${exercise.authorLabel}`}
        </p>
        {exercise.topicLabels.length > 0 && <p className="exercise-card__topics">{exercise.topicLabels.join(", ")}</p>}
        {exercise.note && (
          <p className="exercise-card__note">
            <CircleInfoIcon variant="classic-solid" className="exercise-card__note-icon" />
            <span>
              <strong>Devuelto:</strong> {exercise.note}
            </span>
          </p>
        )}

        {actions && (
          <div className="exercise-card__actions">
            {exercise.allowed.duplicate && actions.duplicate && (
              <form action={actions.duplicate.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Duplicando…">
                  Duplicar
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.archive && actions.archive && (
              <form action={actions.archive.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Archivando…">
                  Archivar
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.propose && actions.propose && (
              <form action={actions.propose.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Proponiendo…">
                  Proponer a la biblioteca
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.withdraw && actions.withdraw && (
              <form action={actions.withdraw.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Retirando…">
                  Retirar la propuesta
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.restore && actions.restore && (
              <form action={actions.restore.bind(null, exercise.id)}>
                <SubmitButton className="platform-row-action" pendingLabel="Restaurando…">
                  Restaurar
                </SubmitButton>
              </form>
            )}
            {exercise.allowed.delete && actions.delete && (
              <DeleteExercise
                title={exercise.title}
                description={deleteDescription}
                action={actions.delete.bind(null, exercise.id)}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}
