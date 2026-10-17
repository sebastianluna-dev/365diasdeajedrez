"use client";

import { useActionState, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { CircleMinusIcon } from "@/components/icons/circle-minus-icon.comp";
import { ReplyIcon } from "@/components/icons/reply-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_ERROR_MESSAGES } from "@/constants/platform/exercise-messages.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import type { StaffExerciseReview } from "@/services/staff-exercises/staff-exercises.types";
import "./exercise-review-bar.comp.css";

export interface ExerciseReviewBarActions {
  /** «Aprobar», bound to the exercise: it redirects to the queue. */
  approve: (formData: FormData) => Promise<void>;
  /** «Devolver», bound to the exercise, through `useActionState`: the note is required. */
  returnWithNote: (prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  /** «Quitar de la biblioteca», bound to the exercise, from its confirmation with the note. */
  remove: (formData: FormData) => Promise<void>;
  /** «Restaurar» an archived academy exercise, bound to it: back to a draft. */
  restore: (formData: FormData) => Promise<void>;
}

export interface ExerciseReviewBarProps {
  title: string;
  review: StaffExerciseReview;
  actions: ExerciseReviewBarActions;
}

/**
 * The staff's decisions on a bank's exercise (PLAN.md §8; D07, D16), under
 * the read-only editor: who wrote it and when it was proposed, the last
 * decision with its note, and the buttons the status allows — «Aprobar» (the
 * accent) and «Devolver» (a popup with the note the teacher reads) on a
 * proposal; «Quitar de la biblioteca» (a confirmation with the verb «Quitar»
 * and the note) on one in the library; «Restaurar» on an archived academy
 * exercise. What is allowed comes decided (`staffExerciseReview`, from the
 * transitions table): the bar draws it.
 */
export function ExerciseReviewBar({ title, review, actions }: ExerciseReviewBarProps) {
  const returnPopup = useRef<PlatformPopupHandle>(null);
  const removeConfirm = useRef<PlatformConfirmPopupHandle>(null);
  const [use, setUse] = useState(0);
  const facts = [review.authorLabel, review.submittedLabel, review.reviewedLabel].filter(Boolean).join(" · ");
  const decides = review.canApprove || review.canReturn || review.canRemove || review.canRestore;
  const removal =
    review.owner === "teacher"
      ? "Vuelve a estar listo para su profesor, que lo sigue dando a sus alumnos; deja de verse en la práctica libre y en las series de la academia."
      : "Se archiva: deja de verse en la práctica libre y en las series de la academia. Los intentos se conservan.";

  return (
    <section className="exercise-review-bar" aria-label="Revisión del ejercicio">
      <div className="exercise-review-bar__facts">
        <p className="exercise-review-bar__status">
          <span className="platform-tag">{review.statusLabel}</span>
          <span>{facts}</span>
        </p>
        {review.reviewNote && (
          <p className="exercise-review-bar__note">
            <strong>Nota:</strong> {review.reviewNote}
          </p>
        )}
      </div>

      {decides && (
        <div className="exercise-review-bar__actions">
          {review.canReturn && (
            <button type="button" className="platform-button" onClick={(event) => returnPopup.current?.open(event)}>
              <ReplyIcon variant="classic-solid" className="platform-button__icon" />
              Devolver
            </button>
          )}
          {review.canApprove && (
            <form action={actions.approve}>
              <SubmitButton className="platform-button platform-button_variant_accent" pendingLabel="Aprobando…">
                <CheckIcon variant="classic-solid" className="platform-button__icon" />
                Aprobar
              </SubmitButton>
            </form>
          )}
          {review.canRemove && (
            <button
              type="button"
              className="platform-button platform-button_variant_caution"
              onClick={(event) => removeConfirm.current?.open(event)}
            >
              <CircleMinusIcon variant="classic-solid" className="platform-button__icon" />
              Quitar de la biblioteca
            </button>
          )}
          {review.canRestore && (
            <form action={actions.restore}>
              <SubmitButton className="platform-button" pendingLabel="Restaurando…">
                <RotateLeftIcon variant="classic-solid" className="platform-button__icon" />
                Restaurar
              </SubmitButton>
            </form>
          )}
        </div>
      )}

      <PlatformPopup ref={returnPopup} title="Devolver al profesor" size="sm" onClose={() => setUse((n) => n + 1)}>
        <ReturnForm key={use} action={actions.returnWithNote} />
      </PlatformPopup>

      <PlatformConfirmPopup
        ref={removeConfirm}
        verb="Quitar"
        subject={title}
        title={`¿Quitar «${title}» de la biblioteca?`}
        description={removal}
        fields={[
          {
            name: "note",
            label: "Nota para el autor",
            required: true,
            maxLength: EXERCISE_LIMITS.reviewNote,
            hint: "Lo que lee para saber por qué se quitó.",
          },
        ]}
        action={actions.remove}
        confirmLabel="Quitar de la biblioteca"
      />
    </section>
  );
}

/** «Devolver»: the note the teacher reads, required; a refusal keeps what was written. */
function ReturnForm({ action }: { action: ExerciseReviewBarActions["returnWithNote"] }) {
  const [state, formAction] = useActionState(action, POPUP_FORM_IDLE);
  const noteError = state.fieldErrors?.note;
  const formError = state.formError
    ? (EXERCISE_ERROR_MESSAGES[state.formError.code] ?? EXERCISE_ERROR_MESSAGES.invalid)
    : undefined;
  // A returned proposal leaves this page: the action redirects to the queue, so nothing closes here.
  return (
    <PlatformForm action={formAction} className="exercise-review-bar__return">
      <p className="exercise-review-bar__return-text">
        El ejercicio vuelve a «Listo» para su profesor, con tu nota; sus alumnos lo siguen viendo.
      </p>
      {formError && <PlatformNotice message={formError} />}
      <PlatformFormField
        name="note"
        label="Nota para el profesor"
        hint="Qué cambiar para que entre en la biblioteca."
        serverError={
          noteError ? (EXERCISE_ERROR_MESSAGES[noteError.code] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined
        }
      >
        <textarea
          rows={4}
          required
          maxLength={EXERCISE_LIMITS.reviewNote}
          defaultValue={typeof state.values?.note === "string" ? state.values.note : ""}
        />
      </PlatformFormField>
      <div className="exercise-review-bar__return-foot">
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Devolviendo…">
          <ReplyIcon variant="classic-solid" className="platform-button__icon" />
          Devolver al profesor
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
