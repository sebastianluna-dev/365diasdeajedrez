"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PenIcon } from "@/components/icons/pen-icon.comp";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { SERIES_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_ERROR_MESSAGES } from "@/constants/platform/exercise-messages.const";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import "./series-data-popup.comp.css";

export interface SeriesDataPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface SeriesDataPopupProps {
  /** The series as stored, to edit it; null for «Nueva serie». */
  series: { title: string; description: string | null } | null;
  /**
   * The save, through `useActionState`: `createExerciseSeries`, which opens
   * the new series itself, or `updateExerciseSeries` bound to the series,
   * which answers with its notice.
   */
  save: (prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  ref?: Ref<SeriesDataPopupHandle>;
}

/**
 * The title and the description of a series, the two things its students
 * read before they start: «Nueva serie» from the bank, «Editar la serie»
 * from the pen beside its title. A refusal keeps what was written.
 */
export function SeriesDataPopup({ ref, ...props }: SeriesDataPopupProps) {
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
      title={props.series ? "Editar la serie" : "Nueva serie"}
      size="sm"
      onClose={() => setUse((n) => n + 1)}
    >
      <SeriesDataForm
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

/** «Nueva serie», the bank's secondary button, with the popup behind it. */
export function NewSeriesButton({ save }: Pick<SeriesDataPopupProps, "save">) {
  const popup = useRef<SeriesDataPopupHandle>(null);
  return (
    <>
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        <PlusIcon variant="classic-solid" className="platform-button__icon" />
        Nueva serie
      </button>
      <SeriesDataPopup ref={popup} series={null} save={save} />
    </>
  );
}

/** The square pen beside a series' title, with the popup behind it. */
export function EditSeriesButton(props: Omit<SeriesDataPopupProps, "ref">) {
  const popup = useRef<SeriesDataPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_variant_quiet platform-button_shape_square"
        aria-label="Editar la serie"
        onClick={(event) => popup.current?.open(event)}
      >
        <PenIcon variant="classic-solid" className="platform-button__icon" />
      </button>
      <SeriesDataPopup ref={popup} {...props} />
    </>
  );
}

function SeriesDataForm({
  series,
  save,
  onDone,
}: Omit<SeriesDataPopupProps, "ref"> & { onDone: (notice: NonNullable<PopupFormState["notice"]>) => void }) {
  const [state, formAction] = useActionState(save, POPUP_FORM_IDLE);
  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);
  const message = (field: string) => {
    const error = state.fieldErrors?.[field];
    return error ? (EXERCISE_ERROR_MESSAGES[error.code] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined;
  };
  const formError = state.formError
    ? (EXERCISE_ERROR_MESSAGES[state.formError.code] ?? EXERCISE_ERROR_MESSAGES.invalid)
    : undefined;
  const sent = (field: string) => state.values?.[field] as string | undefined;

  return (
    <PlatformForm action={formAction} className="series-data-popup__form">
      {formError && <PlatformNotice message={formError} />}
      <PlatformFormField name="title" label="Título" serverError={message("title")}>
        <input
          type="text"
          maxLength={SERIES_LIMITS.title}
          required
          placeholder="Táctica de la semana"
          defaultValue={sent("title") ?? series?.title ?? ""}
        />
      </PlatformFormField>
      <PlatformFormField
        name="description"
        label="Descripción"
        hint="La leen tus alumnos antes de empezar."
        serverError={message("description")}
      >
        <textarea
          rows={3}
          maxLength={SERIES_LIMITS.description}
          defaultValue={sent("description") ?? series?.description ?? ""}
        />
      </PlatformFormField>
      <div className="series-data-popup__foot">
        <SubmitButton
          className="platform-button platform-button_variant_ink"
          pendingLabel={series ? "Guardando…" : "Creando…"}
        >
          {series ? "Guardar la serie" : "Crear serie"}
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
