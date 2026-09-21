"use client";

import { useRef } from "react";
import { createStudy } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./new-study.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface NewStudyProps {
  /**
   * Kinds the viewer can create. "Mis partidas" is never there — it is born
   * with the account — and "Colección" only for a teacher. See services/studies/study-rules.
   */
  kinds: StudyKindOption[];
}

export function NewStudy({ kinds }: NewStudyProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="new-study">
      <button type="button" className="platform-button new-study__open" onClick={() => dialogRef.current?.showModal()}>
        Nuevo estudio
      </button>

      {/* Native `<dialog>`: it brings focus trapping, closing with Escape and the
          modal backdrop without writing any of that by hand. */}
      <dialog ref={dialogRef} className="platform-dialog new-study__dialog">
        <form
          action={createStudy}
          className="new-study__form"
          // The browser validates `required` before getting here, so the
          // dialog does not close with the form half filled.
          onSubmit={() => dialogRef.current?.close()}
        >
          <h2 className="new-study__title">Nuevo estudio</h2>

          <label className="new-study__field">
            <span className="new-study__label">Nombre</span>
            <input
              className="new-study__input"
              type="text"
              name="name"
              maxLength={120}
              required
              autoFocus
              placeholder="Nacional Abierto 2026"
            />
          </label>

          <label className="new-study__field">
            <span className="new-study__label">Descripción (opcional)</span>
            <input
              className="new-study__input"
              type="text"
              name="description"
              maxLength={500}
              placeholder="Para qué te sirve este estudio"
            />
          </label>

          <label className="new-study__field">
            <span className="new-study__label">Tipo</span>
            <select className="new-study__select" name="kindCode" defaultValue={kinds[0]?.code}>
              {kinds.map((kind) => (
                <option key={kind.code} value={kind.code}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>

          <div className="new-study__actions">
            <button
              type="button"
              className="platform-button platform-button_variant_secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </button>
            <SubmitButton pendingLabel="Creando…">Crear estudio</SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
