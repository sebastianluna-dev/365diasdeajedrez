"use client";

import { useRef } from "react";
import { createStudy } from "@/services/studies/studies.actions";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./new-study.comp.css";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
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
        <PlatformForm
          action={createStudy}
          className="new-study__form"
          // The browser validates `required` before the submit event fires (the
          // form primitive only replaces its bubble with the field's message),
          // so the dialog does not close with the form half filled.
          onSubmit={() => dialogRef.current?.close()}
        >
          <h2 className="new-study__title">Nuevo estudio</h2>

          <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al estudio." }}>
            <input type="text" maxLength={120} required autoFocus placeholder="Nacional Abierto 2026" />
          </PlatformFormField>

          <PlatformFormField name="description" label="Descripción (opcional)">
            <input type="text" maxLength={500} placeholder="Para qué te sirve este estudio" />
          </PlatformFormField>

          <PlatformFormField name="kindCode" label="Tipo">
            <PlatformSelect
              options={kinds.map((kind) => ({ value: kind.code, label: kind.label }))}
              defaultValue={kinds[0]?.code}
              required
            />
          </PlatformFormField>

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
        </PlatformForm>
      </dialog>
    </div>
  );
}
