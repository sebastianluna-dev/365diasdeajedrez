import { FormField } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { createAuthor, updateAuthor } from "@/services/staff-courses/staff-courses.actions";
import type { AuthorAdminRow } from "@/services/staff-courses/staff-courses.types";
import "./authors-admin.section.css";

interface AuthorsAdminSectionProps {
  authors: AuthorAdminRow[];
  errorCode?: string;
}

/**
 * Authors: the ONLY catalog with creation and editing from the interface,
 * because it is editorial content and not a restricted domain whose code the
 * logic compares (those remain seed).
 */
export function AuthorsAdminSection({ authors, errorCode }: AuthorsAdminSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="authors-admin">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <form className="authors-admin__create platform-card" action={createAuthor}>
        <h2 className="platform-card__title">Nuevo autor</h2>

        <div className="authors-admin__fields">
          <FormField label="Nombre">
            <input type="text" name="name" maxLength={160} required />
          </FormField>

          <FormField label="Identificador (slug)">
            <input type="text" name="slug" maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
          </FormField>

          <FormField label="Foto (URL, opcional)">
            <input type="url" name="photo" maxLength={500} />
          </FormField>
        </div>

        <FormField label="Biografía (opcional)">
          <textarea name="bio" maxLength={1000} />
        </FormField>

        <button type="submit" className="platform-button">
          Crear autor
        </button>
      </form>

      {authors.map((author) => (
        <form key={author.id} className="authors-admin__row platform-card" action={updateAuthor.bind(null, author.id)}>
          <h3 className="authors-admin__row-title">
            {author.name}
            <span className="authors-admin__row-meta">
              {author.courseCount} curso{author.courseCount === 1 ? "" : "s"}
            </span>
          </h3>

          <div className="authors-admin__fields">
            <FormField label="Nombre">
              <input type="text" name="name" defaultValue={author.name} maxLength={160} required />
            </FormField>

            <FormField label="Identificador (slug)">
              <input
                type="text"
                name="slug"
                defaultValue={author.slug}
                maxLength={160}
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                required
              />
            </FormField>

            <FormField label="Foto (URL, opcional)">
              <input type="url" name="photo" defaultValue={author.photo ?? ""} maxLength={500} />
            </FormField>
          </div>

          <FormField label="Biografía (opcional)">
            <textarea name="bio" defaultValue={author.bio ?? ""} maxLength={1000} />
          </FormField>

          <button type="submit" className="platform-button platform-button_variant_secondary">
            Guardar
          </button>
        </form>
      ))}
    </div>
  );
}
