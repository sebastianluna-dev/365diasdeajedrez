"use client";

import { useState } from "react";
import type { StudyKindOption } from "@/services/studies/studies.types";
import { STUDY_KIND_CARDS } from "@/constants/platform/study-kind-cards.const";
import { CloseIcon } from "@/components/icons/close-icon.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface NewStudyFormProps {
  kinds: StudyKindOption[];
  /** Where the form posts: the server action, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  onClose: () => void;
  /** Runs when the browser lets the submit through, i.e. with a valid form. */
  onSubmit?: () => void;
}

/**
 * The creation form itself, with no dialog and no server action of its own:
 * `NewStudy` mounts it inside its `<dialog>` with `createStudy`, and the story
 * mounts it with a stub. Head, fields and a footer band; the submit stays off
 * until the study has a name, which is the one thing it needs.
 */
export function NewStudyForm({ kinds, action, onClose, onSubmit }: NewStudyFormProps) {
  const [name, setName] = useState("");

  return (
    <PlatformForm action={action} className="new-study__form" onSubmit={onSubmit} autoComplete="off">
      <header className="new-study__head">
        <span className="new-study__tile" aria-hidden="true" />
        <div className="new-study__heading">
          <h2 className="new-study__title">Nuevo estudio</h2>
          <p className="new-study__subtitle">Agrupa partidas y análisis bajo un mismo tema.</p>
        </div>
        <button type="button" className="new-study__close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon className="new-study__close-icon" />
        </button>
      </header>

      <div className="new-study__body">
        <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al estudio." }}>
          <input
            type="text"
            maxLength={120}
            required
            autoFocus
            placeholder="Nacional Abierto 2026"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </PlatformFormField>

        <PlatformFormField name="description" label="Descripción" optionalLabel="Opcional">
          <textarea maxLength={500} rows={3} placeholder="Para qué te sirve este estudio" />
        </PlatformFormField>

        <PlatformFormGroup label="Tipo">
          <PlatformChoiceCards
            name="kindCode"
            defaultValue={kinds[0]?.code}
            required
            options={kinds.map((kind) => {
              const card = STUDY_KIND_CARDS[kind.code as keyof typeof STUDY_KIND_CARDS];
              return {
                value: kind.code,
                label: kind.label,
                description: card?.description,
                icon: card && <span className={`new-study__piece new-study__piece_name_${card.piece}`} />,
              };
            })}
          />
        </PlatformFormGroup>
      </div>

      <footer className="new-study__foot">
        <p className="new-study__note">Podrás cambiarlo todo después.</p>
        <div className="new-study__actions">
          <button type="button" className="platform-button platform-button_variant_secondary" onClick={onClose}>
            Cancelar
          </button>
          <SubmitButton pendingLabel="Creando…" disabled={name.trim() === ""}>
            Crear estudio
          </SubmitButton>
        </div>
      </footer>
    </PlatformForm>
  );
}
