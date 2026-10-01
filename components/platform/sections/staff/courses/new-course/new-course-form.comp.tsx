"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons/close-icon.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { generateSlug } from "@/lib/generate-slug";
import type { ContentTypeOption } from "@/services/staff-courses/staff-courses.types";

/** What `createCourse` accepts as a slug: lowercase words joined by single hyphens. */
const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

interface NewCourseFormProps {
  contentTypes: ContentTypeOption[];
  /** Where the form posts: the server action, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  onClose: () => void;
  /** Runs when the browser lets the submit through, i.e. with a valid form. */
  onSubmit?: () => void;
}

/**
 * The creation form itself, with no dialog and no server action of its own:
 * `NewCourse` mounts it inside its `<dialog>` with `createCourse`, and the
 * story mounts it with a stub. Head, the three fields the course is born with
 * and a footer band; the submit stays off until it has a name, a slug and at
 * least one content type, which the browser cannot demand of a checkbox group.
 *
 * The slug writes itself from the name when the name loses focus, as long as
 * the slug is still the form's and not the user's: once they type one of their
 * own it is left alone, and clearing it hands it back to the name.
 */
export function NewCourseForm({ contentTypes, action, onClose, onSubmit }: NewCourseFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugOwn, setIsSlugOwn] = useState(false);
  const [contentTypeCodes, setContentTypeCodes] = useState<string[]>([]);
  const isReady = name.trim() !== "" && slug.trim() !== "" && contentTypeCodes.length > 0;

  const suggestSlug = () => {
    if (!isSlugOwn) setSlug(generateSlug(name));
  };

  return (
    <PlatformForm action={action} className="new-course__form" onSubmit={onSubmit} autoComplete="off">
      <header className="new-course__head">
        <span className="new-course__tile" aria-hidden="true" />
        <div className="new-course__heading">
          <h2 className="new-course__title">Nuevo curso</h2>
          <p className="new-course__subtitle">Sólo lo imprescindible: el resto se edita en la ficha del curso.</p>
        </div>
        <button type="button" className="new-course__close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon className="new-course__close-icon" />
        </button>
      </header>

      <div className="new-course__body">
        <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al curso." }}>
          <input
            type="text"
            maxLength={160}
            required
            autoFocus
            placeholder="Finales de torre esenciales"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={suggestSlug}
          />
        </PlatformFormField>

        <PlatformFormField
          name="slug"
          label="Identificador (slug)"
          hint="Se escribe solo a partir del nombre; puedes cambiarlo. Minúsculas, números y guiones: aparece en la URL."
          messages={{
            valueMissing: "El curso necesita un identificador.",
            patternMismatch: "Sólo minúsculas, números y guiones, sin espacios.",
          }}
        >
          <input
            type="text"
            maxLength={160}
            pattern={SLUG_PATTERN}
            required
            placeholder="finales-de-torre-esenciales"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              // Typed by hand it is theirs; emptied, it goes back to following the name.
              setIsSlugOwn(event.target.value !== "");
            }}
          />
        </PlatformFormField>

        <PlatformFormGroup label="Contenido (selecciona al menos uno)">
          <PlatformCheckCards
            name="contentTypeCodes"
            value={contentTypeCodes}
            onValueChange={setContentTypeCodes}
            options={contentTypes.map((type) => ({
              value: type.code,
              label: type.label,
              description: type.description,
            }))}
          />
        </PlatformFormGroup>
      </div>

      <footer className="new-course__foot">
        <p className="new-course__note">Nace en borrador: no se ve hasta que lo publiques.</p>
        <div className="new-course__actions">
          <button type="button" className="platform-button" onClick={onClose}>
            Cancelar
          </button>
          <SubmitButton className="platform-button" pendingLabel="Creando…" disabled={!isReady}>
            Crear curso
          </SubmitButton>
        </div>
      </footer>
    </PlatformForm>
  );
}
