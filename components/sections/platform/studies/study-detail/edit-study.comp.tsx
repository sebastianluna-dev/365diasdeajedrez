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
  /** Los que el alumno puede poner; «Colección» no está entre ellos. */
  kinds: StudyKindOption[];
}

export function EditStudy({ id, name, description, kindCode, kinds }: EditStudyProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Un estudio de tipo «Colección» no se puede editar a sí mismo de vuelta a
  // «Colección» porque ese tipo no se ofrece; se cae al primero disponible.
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

          <div className="edit-study__actions">
            <span className="edit-study__note">El tipo se puede cambiar cuando quieras.</span>
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
