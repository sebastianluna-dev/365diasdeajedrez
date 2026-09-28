"use client";

import { useActionState, useEffect, useState } from "react";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { authorSlugFor } from "@/services/staff-courses/author-rules";
import { createAuthor, updateAuthor } from "@/services/staff-courses/staff-courses.actions";
import { AUTHOR_INITIAL_STATE, type AuthorAdminRow } from "@/services/staff-courses/staff-courses.types";
import { AuthorPhotoField } from "./author-photo-field.comp";

interface AuthorFormProps {
  /** The author being edited; absent, the form creates a new one. */
  author?: AuthorAdminRow;
  /** Every author: the slug shown must not be one of theirs. */
  authors: AuthorAdminRow[];
  /** The author was saved: back to the list, which comes refreshed. */
  onSaved: () => void;
  /** Back to the list without saving. */
  onCancel: () => void;
}

/**
 * The form of one author inside the «Autores» dialog, for creating or for
 * editing: the name, the biography and the photo, in that order of weight.
 *
 * The slug is not a field: it is the name's, and the line under the name says
 * which one it will be as the name is typed (`authorSlugFor`, the same rule
 * the action applies, which is the one that decides). An author who keeps
 * their name keeps their slug.
 *
 * It is one of the few forms on `useActionState`: the dialog stays open over
 * the page, so the outcome comes back here — the error above the fields, the
 * success as the way back to the list — instead of to a `?error=` that the
 * page would render underneath.
 */
export function AuthorForm({ author, authors, onSaved, onCancel }: AuthorFormProps) {
  const isNew = author === undefined;
  const [state, formAction] = useActionState(
    isNew ? createAuthor : updateAuthor.bind(null, author.id),
    AUTHOR_INITIAL_STATE,
  );
  const [name, setName] = useState(author?.name ?? "");

  useEffect(() => {
    if (state.status === "saved") onSaved();
  }, [state, onSaved]);

  const takenByOthers = authors.filter((other) => other.id !== author?.id).map((other) => other.slug);
  const slug = !isNew && name.trim() === author.name ? author.slug : authorSlugFor(name, takenByOthers);
  const errorMessage =
    state.status === "error"
      ? (STAFF_ERROR_MESSAGES[state.errorCode ?? ""] ?? STAFF_ERROR_MESSAGES.invalid)
      : undefined;

  return (
    <PlatformForm action={formAction} className="authors-manager__form" autoComplete="off">
      <div className="authors-manager__body">
        {errorMessage && <PlatformNotice message={errorMessage} />}

        <PlatformFormField
          name="name"
          label="Nombre"
          hint={slug ? `Slug: ${slug} (se genera solo)` : "El slug se genera solo a partir del nombre."}
          messages={{ valueMissing: "Ponle un nombre al autor." }}
        >
          <input
            type="text"
            maxLength={160}
            required
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={isNew ? "Alexander Kotov" : undefined}
          />
        </PlatformFormField>

        <PlatformFormField name="bio" label="Biografía" optionalLabel="Opcional">
          <textarea maxLength={1000} defaultValue={author?.bio} />
        </PlatformFormField>

        <AuthorPhotoField authorName={name} defaultValue={author?.photo} />
      </div>

      <footer className="authors-manager__foot">
        <div className="authors-manager__actions">
          <button type="button" className="platform-button platform-button_variant_secondary" onClick={onCancel}>
            Cancelar
          </button>
          <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Guardando…">
            {isNew ? "Crear autor" : "Guardar"}
          </SubmitButton>
        </div>
      </footer>
    </PlatformForm>
  );
}
