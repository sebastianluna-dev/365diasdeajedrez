"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import { updateStudy } from "@/services/studies/studies.actions";
import { TrashCanIcon } from "@/components/icons/trash-can-icon.comp";
import type { StudyKindOption } from "@/services/studies/studies.types";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import "./edit-study.comp.css";

interface EditStudyProps {
  id: string;
  name: string;
  description?: string;
  kindCode: string;
  /** The name of its kind, to be able to state it when it cannot be changed. */
  kindLabel: string;
  /** The kinds it can change to. See services/studies/study-rules. */
  kinds: StudyKindOption[];
  /**
   * Whether the kind can be changed. "Mis partidas" and collections stay as
   * they are: the first is unique per student and the second would leave those
   * who received it looking at something that is no longer a collection.
   */
  canChangeKind: boolean;
  /**
   * `button` is the boxed button of the empty study page. `none` draws no
   * trigger: whoever mounts it opens the popup through `ref` (the three
   * bars in the head of the study's card beside the board, `StudySettings`).
   */
  trigger?: "button" | "none";
  ref?: Ref<EditStudyHandle>;
  /**
   * With it the popup offers «Eliminar estudio» at its foot: pressed, this is
   * called, which is where the host opens the confirmation (`DeleteStudy`)
   * on top of the form, which stays open beneath it until the host closes
   * it (`close()`) once the study is gone. Without it — a study that is never
   * deleted, a screen with its own delete button — the foot is not drawn.
   */
  onDelete?: () => void;
}

/**
 * What a host that draws its own trigger gets: the popup's own handle.
 * `open(event)` takes the click so the focus returns to the trigger on
 * closing; `close()` is for the host that deleted the study from the foot.
 */
export type EditStudyHandle = PlatformPopupHandle;

export function EditStudy({
  id,
  name,
  description,
  kindCode,
  kindLabel,
  kinds,
  canChangeKind,
  trigger = "button",
  ref,
  onDelete,
}: EditStudyProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  useImperativeHandle(
    ref,
    () => ({
      open: (event) => popup.current?.open(event),
      close: () => popup.current?.close(),
      isOpen: () => popup.current?.isOpen() ?? false,
    }),
    [],
  );

  const selected = kinds.some((kind) => kind.code === kindCode) ? kindCode : kinds[0]?.code;

  return (
    <div className="edit-study">
      {trigger === "button" && (
        <button
          type="button"
          className="platform-button edit-study__open"
          onClick={(event) => popup.current?.open(event)}
        >
          Editar datos
        </button>
      )}

      <PlatformPopup ref={popup} title="Editar el estudio" size="sm">
        {/* On the platform's form, like «Nuevo estudio»: the same fields, and
            the same messages when the browser rejects one on saving. The name
            is the first control, so the popup opens on it. */}
        <PlatformForm
          action={updateStudy.bind(null, id)}
          className="edit-study__form"
          onSubmit={() => popup.current?.close()}
          autoComplete="off"
        >
          <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al estudio." }}>
            <input type="text" defaultValue={name} maxLength={120} required />
          </PlatformFormField>

          {/* A few lines, as on creation: what the study is for can take more
              than one. */}
          <PlatformFormField name="description" label="Descripción">
            <textarea
              defaultValue={description ?? ""}
              maxLength={500}
              rows={3}
              placeholder="Para qué te sirve este estudio"
            />
          </PlatformFormField>

          {/* No selector when the kind is not touched: a dropdown with a single
              option impossible to change only gets in the way. The action would
              not accept it either, so the form does not send `kindCode`; a
              line says which kind it is and that it stays. */}
          {canChangeKind ? (
            // One control, so a field and not a group: the field gives the
            // select its `name` and its `id`, which the label points at.
            <PlatformFormField name="kindCode" label="Tipo">
              <PlatformSelect
                defaultValue={selected}
                options={kinds.map((kind) => ({ value: kind.code, label: kind.label }))}
              />
            </PlatformFormField>
          ) : (
            <p className="edit-study__kind">El tipo «{kindLabel}» no se cambia.</p>
          )}

          {/* The two buttons alone at the row's end: a note beside them was
              squeezed into three lines. */}
          <div className="edit-study__actions">
            <button type="button" className="platform-button" onClick={() => popup.current?.close()}>
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_ink">Guardar</SubmitButton>
          </div>
        </PlatformForm>

        {/* What destroys, apart from what saves and under a rule, as in a
            game's settings. It only leads to the confirmation, which opens
            on top of this popup; this one stays open beneath. */}
        {onDelete && (
          <div className="edit-study__danger">
            <button
              type="button"
              className="platform-button platform-button_variant_danger platform-button_size_sm platform-button_shape_pill"
              onClick={onDelete}
            >
              <TrashCanIcon variant="classic-solid" className="platform-button__icon" />
              Eliminar estudio
            </button>
          </div>
        )}
      </PlatformPopup>
    </div>
  );
}
