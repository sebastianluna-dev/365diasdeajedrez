"use client";

import Link from "next/link";
import type { Ref } from "react";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { platformRoutes } from "@/lib/platform-routes";

interface SaveToStudyPopupProps {
  ref: Ref<PlatformPopupHandle>;
  /** The person's own studies. */
  studies: { id: string; name: string }[];
  /** The name it is proposed with: «Ana Torres – Don Chuy». */
  defaultTitle: string;
  /** `copyPlayedGameToStudy`, bound to the game. */
  action: (formData: FormData) => void | Promise<void>;
  onCancel: () => void;
}

/**
 * «Guardar en un estudio»: a COPY of the played game into one of the
 * person's studies, where it becomes a study's game like any other. The
 * played game stays where it was.
 */
export function SaveToStudyPopup({ ref, studies, defaultTitle, action, onCancel }: SaveToStudyPopupProps) {
  return (
    <PlatformPopup ref={ref} title="Guardar en un estudio" size="sm">
      {studies.length === 0 ? (
        <div className="live-game__popup">
          <p className="live-game__popup-text">
            Todavía no tienes estudios propios. Crea uno en <Link href={platformRoutes.studies}>Mis estudios</Link> y
            vuelve a esta partida.
          </p>
        </div>
      ) : (
        <PlatformForm action={action} className="live-game__popup">
          <PlatformFormField name="study" label="Estudio" messages={{ valueMissing: "Elige un estudio." }}>
            <PlatformSelect
              options={studies.map((study) => ({ value: study.id, label: study.name }))}
              defaultValue={studies[0]?.id}
              required
            />
          </PlatformFormField>
          <PlatformFormField name="title" label="Nombre">
            <input type="text" maxLength={120} placeholder={defaultTitle} />
          </PlatformFormField>
          <footer className="live-game__popup-foot">
            <button type="button" className="platform-button" onClick={onCancel}>
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Guardando…">
              Guardar
            </SubmitButton>
          </footer>
        </PlatformForm>
      )}
    </PlatformPopup>
  );
}
