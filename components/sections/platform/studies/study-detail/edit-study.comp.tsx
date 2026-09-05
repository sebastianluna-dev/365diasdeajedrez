"use client";

import { useRef } from "react";
import { updateStudy } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./edit-study.comp.css";

interface EditStudyProps {
  id: string;
  name: string;
  description?: string;
  kindCode: string;
  /** Cómo se llama su tipo, para poder decirlo cuando no se puede cambiar. */
  kindLabel: string;
  /** Los tipos a los que puede pasar. Ver services/studies/study-rules. */
  kinds: StudyKindOption[];
  /**
   * Si el tipo se puede cambiar. «Mis partidas» y las colecciones se quedan
   * como están: la primera es única por alumno y la segunda dejaría a quienes
   * la recibieron mirando algo que ya no es una colección.
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

          {/* Sin selector cuando el tipo no se toca: un desplegable con una
              sola opción imposible de cambiar sólo estorba. La acción tampoco
              lo aceptaría, así que el formulario no manda `kindCode`. */}
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
            <button type="submit" className="platform-button">
              Guardar
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
