"use client";

import { useRef } from "react";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { generateSlug } from "@/lib/generate-slug";
import type { AuthorAdminRow } from "@/services/staff-courses/staff-courses.types";

/** What the actions accept as a slug: lowercase words joined by single hyphens. */
const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

interface AuthorFormProps {
  /** The author being edited; absent, the form creates a new one. */
  author?: AuthorAdminRow;
  /** The page the dialog was opened on, where a failure is reported. */
  returnTo: string;
  /** Where the form posts: the server action, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  /** Back to the list of authors, without saving. */
  onBack: () => void;
  /** Runs when the browser lets the submit through, i.e. with a valid form. */
  onSubmit?: () => void;
}

/**
 * The form of one author inside the «Autores» dialog, for creating or for
 * editing: name, slug, photo and biography. It has no dialog and no server
 * action of its own: `AuthorsManager` mounts it with `createAuthor` or
 * `updateAuthor`, and the story with a stub.
 *
 * On a new author the slug writes itself from the name when the name loses
 * focus, while the slug is the form's and not the user's. An existing
 * author's slug is only changed by hand.
 */
export function AuthorForm({ author, returnTo, action, onBack, onSubmit }: AuthorFormProps) {
  const isNew = author === undefined;
  const slugRef = useRef<HTMLInputElement>(null);
  const isSlugOwn = useRef(false);

  const suggestSlug = (name: string) => {
    if (!isNew || isSlugOwn.current || !slugRef.current) return;
    slugRef.current.value = generateSlug(name);
  };

  return (
    <PlatformForm action={action} className="authors-manager__form" onSubmit={onSubmit} autoComplete="off">
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className="authors-manager__body">
        <button type="button" className="authors-manager__back" onClick={onBack}>
          <ArrowLeftIcon className="authors-manager__back-icon" />
          Todos los autores
        </button>

        <h3 className="authors-manager__form-title">{isNew ? "Nuevo autor" : author.name}</h3>

        <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al autor." }}>
          <input
            type="text"
            maxLength={160}
            required
            autoFocus
            defaultValue={author?.name}
            placeholder={isNew ? "Alexander Kotov" : undefined}
            onBlur={(event) => suggestSlug(event.target.value)}
          />
        </PlatformFormField>

        <PlatformFormField
          name="slug"
          label="Slug"
          hint={
            isNew
              ? "Se escribe solo a partir del nombre; puedes cambiarlo. Minúsculas, números y guiones."
              : "Minúsculas, números y guiones."
          }
          messages={{
            valueMissing: "El autor necesita un slug.",
            patternMismatch: "Sólo minúsculas, números y guiones, sin espacios.",
          }}
        >
          <input
            ref={slugRef}
            type="text"
            maxLength={160}
            pattern={SLUG_PATTERN}
            required
            defaultValue={author?.slug}
            placeholder={isNew ? "alexander-kotov" : undefined}
            onChange={(event) => {
              // Typed by hand it is theirs; emptied, it goes back to following the name.
              isSlugOwn.current = event.target.value !== "";
            }}
          />
        </PlatformFormField>

        <PlatformFormField
          name="photo"
          label="Foto"
          optionalLabel="Opcional"
          hint="La dirección (URL) de la imagen."
          messages={{ typeMismatch: "Tiene que ser una dirección web: https://…" }}
        >
          <input type="url" maxLength={500} defaultValue={author?.photo} placeholder="https://" />
        </PlatformFormField>

        <PlatformFormField name="bio" label="Biografía" optionalLabel="Opcional">
          <textarea maxLength={1000} defaultValue={author?.bio} />
        </PlatformFormField>
      </div>

      <footer className="authors-manager__foot">
        <div className="authors-manager__actions">
          <button type="button" className="platform-button platform-button_variant_secondary" onClick={onBack}>
            Cancelar
          </button>
          <SubmitButton pendingLabel={isNew ? "Creando…" : "Guardando…"}>
            {isNew ? "Crear autor" : "Guardar"}
          </SubmitButton>
        </div>
      </footer>
    </PlatformForm>
  );
}
