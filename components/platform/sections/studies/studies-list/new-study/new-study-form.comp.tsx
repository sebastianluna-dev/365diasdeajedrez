"use client";

import { useState } from "react";
import type { StudyKindOption } from "@/services/studies/studies.types";
import { STUDY_KIND_CARDS } from "@/constants/platform/study-kind-cards.const";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { popupButton, usePlatformLook } from "@/components/platform/shared/platform-look";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";

interface NewStudyFormProps {
  kinds: StudyKindOption[];
  /** Where the form posts: the server action, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  onClose: () => void;
  /** Runs when the browser lets the submit through, i.e. with a valid form. */
  onSubmit?: () => void;
}

/**
 * The creation form itself, with no popup and no server action of its own:
 * `NewStudy` mounts it inside its `PlatformPopup` with `createStudy`, and the
 * story mounts it with a stub. The strip with the name and the cross is the
 * popup's; under it, the subtitle, the fields and a footer band. The submit
 * stays off until the study has a name, which is the one thing it needs; the
 * name is the first control, so the popup opens on it.
 */
export function NewStudyForm({ kinds, action, onClose, onSubmit }: NewStudyFormProps) {
  const [name, setName] = useState("");
  // The popup's look: Material's buttons on a page moved to the new design system.
  const look = usePlatformLook();

  return (
    <PlatformForm action={action} className="new-study__form" onSubmit={onSubmit} autoComplete="off">
      <div className="new-study__body">
        <p className="new-study__subtitle">Agrupa partidas y análisis bajo un mismo tema.</p>

        <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al estudio." }}>
          <input
            type="text"
            maxLength={120}
            required
            placeholder="Nacional Abierto 2026"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </PlatformFormField>

        <PlatformFormField name="description" label="Descripción">
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
          <button type="button" className={popupButton(look, "exit")} onClick={onClose}>
            Cancelar
          </button>
          <SubmitButton className={popupButton(look, "submit")} pendingLabel="Creando…" disabled={name.trim() === ""}>
            Crear estudio
          </SubmitButton>
        </div>
      </footer>
    </PlatformForm>
  );
}
