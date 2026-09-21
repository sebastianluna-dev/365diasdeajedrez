"use client";

import { useRef } from "react";
import { updateStudy } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./edit-study.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

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
}

export function EditStudy({ id, name, description, kindCode, kindLabel, kinds, canChangeKind }: EditStudyProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const selected = kinds.some((kind) => kind.code === kindCode) ? kindCode : kinds[0]?.code;

  return (
    <div className="edit-study">
      <button type="button" className="edit-study__open" onClick={() => dialogRef.current?.showModal()}>
        Editar datos
      </button>

      <dialog ref={dialogRef} className="platform-dialog edit-study__dialog">
        <form
          action={updateStudy.bind(null, id)}
          className="edit-study__form"
          onSubmit={() => dialogRef.current?.close()}
        >
          <h2 className="edit-study__title">Editar el estudio</h2>

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
              <select className="edit-study__select" name="kindCode" defaultValue={selected}>
                {kinds.map((kind) => (
                  <option key={kind.code} value={kind.code}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="edit-study__actions">
            <span className="edit-study__note">
              {canChangeKind ? "El tipo se puede cambiar cuando quieras." : `El tipo «${kindLabel}» no se cambia.`}
            </span>
            <button
              type="button"
              className="platform-button platform-button_variant_secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </button>
            <SubmitButton>Guardar</SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
