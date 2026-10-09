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
import "./save-to-study-popup.comp.css";

interface SaveToStudyPopupProps {
  ref: Ref<PlatformPopupHandle>;
  /** The person's own studies. */
  studies: { id: string; name: string }[];
  /** The name it is proposed with: «Ana Torres – Don Chuy». */
  defaultTitle: string;
  /** `copyPlayedGameToStudy` bound to the game, or `saveAnalysisToStudy`. */
  action: (formData: FormData) => void | Promise<void>;
  /** What is saved, when the action does not already know it: the analysis board's PGN. */
  pgn?: string;
  onCancel: () => void;
}

/**
 * «Guardar en un estudio»: a COPY of a played game, or of what is on the
 * analysis board, into one of the person's studies, where it becomes a
 * study's game like any other. Whatever it came from stays where it was.
 */
export function SaveToStudyPopup({ ref, studies, defaultTitle, action, pgn, onCancel }: SaveToStudyPopupProps) {
  return (
    <PlatformPopup ref={ref} title="Guardar en un estudio" size="sm">
      {studies.length === 0 ? (
        <div className="save-to-study-popup">
          <p className="save-to-study-popup__text">
            Todavía no tienes estudios propios. Crea uno en <Link href={platformRoutes.studies}>Mis estudios</Link> y
            vuelve a esta partida.
          </p>
        </div>
      ) : (
        <PlatformForm action={action} className="save-to-study-popup">
          {pgn !== undefined && <input type="hidden" name="pgn" value={pgn} />}
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
          <footer className="save-to-study-popup__foot">
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
