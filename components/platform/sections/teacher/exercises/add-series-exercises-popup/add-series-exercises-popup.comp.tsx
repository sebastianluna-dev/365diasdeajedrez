"use client";

import { useActionState, useEffect, useImperativeHandle, useRef, useState, useTransition, type Ref } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformForm, PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { SERIES_LIMITS } from "@/constants/platform/exercise.const";
import { EXERCISE_ERROR_MESSAGES } from "@/constants/platform/exercise-messages.const";
import { foldForSearch } from "@/lib/fold-for-search";
import { POPUP_FORM_IDLE, type PopupFormState } from "@/services/shared/form-state";
import { withNoticeParam } from "@/services/shared/safe-return-to";
import type { SeriesPickOption } from "@/services/teacher-exercises/teacher-exercises.types";
import "./add-series-exercises-popup.comp.css";

export interface AddSeriesExercisesPopupHandle {
  open: (event?: { currentTarget: HTMLElement }) => void;
  close: () => void;
}

export interface AddSeriesExercisesPopupProps {
  seriesId: string;
  /** What may be added: the teacher's usable exercises and the library's (D08) that are not in the series yet. */
  exercises: SeriesPickOption[];
  /** How many the series holds now: with the limit, how many more fit. */
  itemCount: number;
  addExercisesToSeries: (seriesId: string, prev: PopupFormState, formData: FormData) => Promise<PopupFormState>;
  ref?: Ref<AddSeriesExercisesPopupHandle>;
}

/** From how many exercises the search box is drawn: a handful are read at a glance. */
const SEARCH_FROM = 6;

/**
 * «Agregar ejercicios» (PLAN.md §6.2): the exercises the teacher may give
 * that are not in the series yet, as cards to tick, with a search over their
 * titles and topics once there are a few. A draft or an archived exercise is
 * never offered. What is chosen goes to the end of the series, in the order
 * of the list.
 */
export function AddSeriesExercisesPopup({ ref, ...props }: AddSeriesExercisesPopupProps) {
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
    <PlatformPopup ref={popup} title="Agregar ejercicios" size="md" phone="sheet" onClose={() => setUse((n) => n + 1)}>
      <AddSeriesExercisesForm
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

/** «Agregar ejercicios», the series page's accent, with the popup behind it. */
export function AddSeriesExercisesButton(props: Omit<AddSeriesExercisesPopupProps, "ref">) {
  const popup = useRef<AddSeriesExercisesPopupHandle>(null);
  return (
    <>
      <button
        type="button"
        className="platform-button platform-button_variant_accent"
        onClick={(event) => popup.current?.open(event)}
      >
        <PlusIcon variant="classic-solid" className="platform-button__icon" />
        Agregar ejercicios
      </button>
      <AddSeriesExercisesPopup ref={popup} {...props} />
    </>
  );
}

interface AddSeriesExercisesFormProps extends Omit<AddSeriesExercisesPopupProps, "ref"> {
  onDone: (notice: NonNullable<PopupFormState["notice"]>) => void;
}

function AddSeriesExercisesForm({
  seriesId,
  exercises,
  itemCount,
  addExercisesToSeries,
  onDone,
}: AddSeriesExercisesFormProps) {
  const [state, formAction] = useActionState(addExercisesToSeries.bind(null, seriesId), POPUP_FORM_IDLE);
  const [pending, startSubmit] = useTransition();
  const sent = state.values?.exercises;
  const [chosen, setChosen] = useState<string[]>(Array.isArray(sent) ? sent : sent ? [sent] : []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (state.status === "done" && state.notice) onDone(state.notice);
  }, [state, onDone]);

  const room = Math.max(0, SERIES_LIMITS.items - itemCount);
  const query = foldForSearch(search.trim());
  const hidden = query
    ? exercises
        .filter((exercise) => !foldForSearch(`${exercise.title} ${exercise.topics}`).includes(query))
        .map((exercise) => exercise.id)
    : [];
  const fieldError = state.fieldErrors?.exercises;
  const formError = state.formError
    ? (EXERCISE_ERROR_MESSAGES[state.formError.code] ?? EXERCISE_ERROR_MESSAGES.invalid)
    : undefined;

  if (exercises.length === 0) {
    return (
      <div className="add-series-exercises__form">
        <p className="add-series-exercises__empty">
          {itemCount > 0
            ? "Todos tus ejercicios listos ya están en esta serie."
            : "Todavía no tienes ejercicios listos: márcalos como listos en el editor para agregarlos aquí."}
        </p>
      </div>
    );
  }

  return (
    // Submitted by hand, so React's reset of the form does not reach the
    // controlled cards (AGENTS.md, «NewClassForm»).
    <PlatformForm
      className="add-series-exercises__form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startSubmit(() => formAction(data));
      }}
    >
      <p className="add-series-exercises__summary">
        {chosen.length === 0
          ? "Van al final de la serie, en el orden de la lista."
          : `${chosen.length} ${chosen.length === 1 ? "elegido" : "elegidos"} · van al final de la serie.`}
        {chosen.length > room && ` Caben ${room} más.`}
      </p>
      {formError && <PlatformNotice message={formError} />}
      {exercises.length >= SEARCH_FROM && (
        <PlatformSearchField
          label="Buscar ejercicio"
          placeholder="Buscar por título o tema"
          onValueChange={setSearch}
        />
      )}
      <PlatformFormGroup
        label="Ejercicios"
        serverError={
          fieldError ? (EXERCISE_ERROR_MESSAGES[fieldError.code] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined
        }
      >
        <PlatformCheckCards
          name="exercises"
          value={chosen}
          onValueChange={setChosen}
          hiddenValues={hidden}
          options={exercises.map((exercise) => ({
            value: exercise.id,
            label: exercise.title,
            meta: exercise.facts,
            description: exercise.topics || undefined,
          }))}
        />
      </PlatformFormGroup>
      {query && hidden.length === exercises.length && (
        <p className="add-series-exercises__empty">Ningún ejercicio coincide con la búsqueda.</p>
      )}
      <div className="add-series-exercises__foot">
        <SubmitButton
          className="platform-button platform-button_variant_ink"
          pendingLabel="Agregando…"
          pending={pending}
          disabled={chosen.length > room}
        >
          Agregar a la serie
        </SubmitButton>
      </div>
    </PlatformForm>
  );
}
