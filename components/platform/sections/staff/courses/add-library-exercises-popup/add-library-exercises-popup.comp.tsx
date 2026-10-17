"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, useTransition, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookIcon } from "@/components/icons/book-icon.comp";
import { ExercisePicker } from "@/components/platform/shared/exercise-picker/exercise-picker.comp";
import type { ExercisePickOption } from "@/components/platform/shared/exercise-picker/exercise-picker.types";
import { PlatformForm } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { EXERCISE_ERROR_MESSAGES } from "@/constants/platform/exercise-messages.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import "./add-library-exercises-popup.comp.css";

export interface AddLibraryExercisesPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface AddLibraryExercisesPopupProps {
  /** The library's exercises the lesson holds no copy of yet (`LessonAdminDetail.libraryExercises`). */
  exercises: ExercisePickOption[];
  /** `addLibraryExercisesToLesson`, bound to the lesson, through `useActionState`. */
  addToLesson: (prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  ref?: Ref<AddLibraryExercisesPopupHandle>;
}

/**
 * «Agregar desde la biblioteca» (D28, phase 4): the library's exercises the
 * lesson has no copy of yet, as cards to tick (`ExercisePicker`), with a
 * search once there are a few. What is chosen is copied into the lesson —
 * owned by it, published at once — at the end, in the order it was ticked.
 */
export function AddLibraryExercisesPopup({ ref, ...props }: AddLibraryExercisesPopupProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [use, setUse] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  useImperativeHandle(
    ref,
    () => ({ open: (event) => popup.current?.open(event), close: () => popup.current?.close() }),
    [],
  );
  return (
    <PlatformPopup
      ref={popup}
      title="Agregar desde la biblioteca"
      size="md"
      phone="sheet"
      onClose={() => setUse((n) => n + 1)}
    >
      <AddLibraryExercisesForm
        key={use}
        {...props}
        onDone={(notice) => {
          popup.current?.close();
          router.replace(withNoticeParam(pathname, notice.code, notice.args));
        }}
      />
    </PlatformPopup>
  );
}

/** «Agregar desde la biblioteca», the lesson panel's secondary button, with the popup behind it. */
export function AddLibraryExercisesButton(props: Omit<AddLibraryExercisesPopupProps, "ref">) {
  const popup = useRef<AddLibraryExercisesPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        <BookIcon variant="classic-solid" className="platform-button__icon" />
        Agregar desde la biblioteca
      </button>
      <AddLibraryExercisesPopup ref={popup} {...props} />
    </>
  );
}

interface AddLibraryExercisesFormProps extends Omit<AddLibraryExercisesPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function AddLibraryExercisesForm({ exercises, addToLesson, onDone }: AddLibraryExercisesFormProps) {
  const [state, formAction] = useActionState(addToLesson, POPUP_FORM_IDLE);
  const [pending, startSubmit] = useTransition();
  const sent = state.values?.exercises;
  const [chosen, setChosen] = useState<string[]>(Array.isArray(sent) ? sent : sent ? [sent] : []);

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const fieldError = state.fieldErrors?.exercises;
  const formError = state.formError
    ? (EXERCISE_ERROR_MESSAGES[state.formError.code] ?? EXERCISE_ERROR_MESSAGES.invalid)
    : undefined;

  if (exercises.length === 0) {
    return (
      <div className="add-library-exercises__form">
        <p className="add-library-exercises__empty">
          No hay nada que agregar: la lección ya tiene una copia de cada ejercicio de la biblioteca, o la biblioteca
          está vacía.
        </p>
      </div>
    );
  }

  return (
    // Submitted by hand, so React's reset of the form does not reach the controlled cards (AGENTS.md, «NewClassForm»).
    <PlatformForm
      className="add-library-exercises__form"
      onSubmit={(event) => {
        event.preventDefault();
        startSubmit(() => formAction(new FormData(event.currentTarget)));
      }}
    >
      <p className="add-library-exercises__summary">
        {chosen.length === 0
          ? "Cada uno se copia a la lección, publicado, al final de la lista."
          : `${chosen.length} ${chosen.length === 1 ? "elegido" : "elegidos"} · se copian a la lección, publicados.`}
      </p>
      {formError && <PlatformNotice message={formError} />}
      <ExercisePicker
        name="exercises"
        exercises={exercises}
        value={chosen}
        onValueChange={setChosen}
        label="Ejercicios de la biblioteca"
        serverError={
          fieldError ? (EXERCISE_ERROR_MESSAGES[fieldError.code] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined
        }
      />
      <div className="add-library-exercises__foot">
        <SubmitButton
          className="platform-button platform-button_variant_ink"
          pending={pending}
          disabled={chosen.length === 0}
          pendingLabel="Agregando…"
        >
          Agregar a la lección
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
