"use client";

import { useId, useImperativeHandle, useRef, type Ref } from "react";
import { updateStudy } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./edit-study.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

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
   * trigger: whoever mounts it opens the dialog through `ref` (the three
   * bars in the head of the study's card beside the board, `StudySettings`).
   */
  trigger?: "button" | "none";
  ref?: Ref<EditStudyHandle>;
  /**
   * With it the dialog offers «Eliminar estudio» at its foot: pressed, the
   * dialog closes and this is called, which is where the host opens the
   * confirmation (`DeleteStudy`). Without it — a study that is never deleted,
   * a screen with its own delete button — the foot is not drawn.
   */
  onDelete?: () => void;
}

/** What a host that draws its own trigger gets: the way to open the dialog. */
export interface EditStudyHandle {
  open: () => void;
}

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useImperativeHandle(ref, () => ({ open: () => dialogRef.current?.showModal() }), []);

  const selected = kinds.some((kind) => kind.code === kindCode) ? kindCode : kinds[0]?.code;

  return (
    <div className="edit-study">
      {trigger === "button" && (
        <button type="button" className="edit-study__open" onClick={() => dialogRef.current?.showModal()}>
          Editar datos
        </button>
      )}

      <dialog ref={dialogRef} className="platform-dialog edit-study__dialog" aria-labelledby={titleId}>
        <form
          action={updateStudy.bind(null, id)}
          className="edit-study__form"
          onSubmit={() => dialogRef.current?.close()}
        >
          <h2 id={titleId} className="edit-study__title">
            Editar el estudio
          </h2>

          <label className="edit-study__field">
            <span className="edit-study__label">Nombre</span>
            <input
              className="edit-study__input"
              type="text"
              name="name"
              defaultValue={name}
              maxLength={120}
              required
              autoFocus
            />
          </label>

          <label className="edit-study__field">
            <span className="edit-study__label">Descripción (opcional)</span>
            <input
              className="edit-study__input"
              type="text"
              name="description"
              defaultValue={description ?? ""}
              maxLength={500}
              placeholder="Para qué te sirve este estudio"
            />
          </label>

          {/* No selector when the kind is not touched: a dropdown with a single
              option impossible to change only gets in the way. The action would
              not accept it either, so the form does not send `kindCode`. */}
          {canChangeKind && (
            <label className="edit-study__field">
              <span className="edit-study__label">Tipo</span>
              <PlatformSelect
                name="kindCode"
                defaultValue={selected}
                options={kinds.map((kind) => ({ value: kind.code, label: kind.label }))}
              />
            </label>
          )}

          <div className="edit-study__actions">
            <span className="edit-study__note">
              {canChangeKind ? "El tipo se puede cambiar cuando quieras." : `El tipo «${kindLabel}» no se cambia.`}
            </span>
            <button type="button" className="platform-button" onClick={() => dialogRef.current?.close()}>
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_ink">Guardar</SubmitButton>
          </div>
        </form>

        {/* What destroys, apart from what saves and under a rule, as in a
            game's settings. It only leads to the confirmation. */}
        {onDelete && (
          <div className="edit-study__danger">
            <button
              type="button"
              className="edit-study__destroy"
              onClick={() => {
                dialogRef.current?.close();
                onDelete();
              }}
            >
              Eliminar estudio
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
