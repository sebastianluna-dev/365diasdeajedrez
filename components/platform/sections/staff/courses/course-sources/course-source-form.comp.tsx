"use client";

import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import type { CourseSourceAdmin } from "@/services/staff-sources/staff-sources.types";

interface CourseSourceFormProps {
  /** The source being edited; absent when adding one. */
  source?: CourseSourceAdmin;
  sourceTypes: CatalogOption[];
  /** Where the form posts: the server action bound to the course, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  /**
   * Pressed «Eliminar fuente», the red word at the foot when a source is
   * being edited: where the host opens the confirmation on top of the popup.
   * Without it the word is not drawn.
   */
  onDelete?: () => void;
  onClose: () => void;
  /** Runs when the browser lets the submit through, i.e. with a valid form. */
  onSubmit?: () => void;
}

/**
 * The fields of one source, with no popup and no action of its own:
 * `CourseSourceDialog` mounts it with `saveCourseSource`, the story with a
 * stub. The strip with the name and the cross is the popup's; under it, the
 * subtitle, the fields and a footer band. Only the type is required.
 */
export function CourseSourceForm({ source, sourceTypes, action, onDelete, onClose, onSubmit }: CourseSourceFormProps) {
  const isEdit = source !== undefined;

  return (
    <PlatformForm action={action} className="course-source-dialog__form" onSubmit={onSubmit} autoComplete="off">
      {/* Which source is rewritten; absent, the action creates one. */}
      {isEdit && <input type="hidden" name="sourceId" value={source.id} />}

      <div className="course-source-dialog__body">
        <p className="course-source-dialog__subtitle">De dónde procede el material del curso.</p>

        <PlatformFormField name="sourceTypeCode" label="Tipo de fuente">
          <PlatformSelect
            // The first kind is chosen when adding: the field is required.
            defaultValue={source?.sourceTypeCode ?? sourceTypes[0]?.code ?? ""}
            options={sourceTypes.map((type) => ({ value: type.code, label: type.label }))}
            required
          />
        </PlatformFormField>

        <PlatformFormField name="originalTitle" label="Título original">
          <input type="text" maxLength={300} defaultValue={source?.originalTitle ?? ""} placeholder="Mi sistema" />
        </PlatformFormField>

        <PlatformFormField
          name="authors"
          label="Autores"
          hint="Quien firma el recurso, no el curso. Varios, separados por comas."
        >
          <input type="text" maxLength={300} defaultValue={source?.authors ?? ""} placeholder="Aron Nimzowitsch" />
        </PlatformFormField>

        <PlatformFormField
          name="url"
          label="Enlace"
          messages={{ typeMismatch: "Tiene que ser una dirección http(s)." }}
        >
          <input type="url" maxLength={2000} defaultValue={source?.url ?? ""} placeholder="https://" />
        </PlatformFormField>

        <div className="course-source-dialog__pair">
          <PlatformFormField name="publicationYear" label="Año de publicación">
            <input
              type="number"
              min={1400}
              max={2100}
              step={1}
              defaultValue={source?.publicationYear ?? ""}
              placeholder="1925"
            />
          </PlatformFormField>

          <PlatformFormField name="edition" label="Edición o versión">
            <input type="text" maxLength={80} defaultValue={source?.edition ?? ""} placeholder="2.ª ed." />
          </PlatformFormField>
        </div>

        <PlatformFormField
          name="specificReference"
          label="Referencia específica"
          hint="Capítulos, páginas, lecciones o secciones que usa el curso."
        >
          <textarea maxLength={500} rows={2} defaultValue={source?.specificReference ?? ""} />
        </PlatformFormField>

        <PlatformFormField name="notes" label="Notas" hint="Sólo para el equipo.">
          <textarea maxLength={1000} rows={2} defaultValue={source?.notes ?? ""} />
        </PlatformFormField>
      </div>

      <footer className="course-source-dialog__foot">
        {isEdit && onDelete && (
          // What destroys, apart from what saves: it only leads to the
          // confirmation, which the host opens on top of this popup.
          <button type="button" className="platform-row-action platform-row-action_variant_danger" onClick={onDelete}>
            Eliminar fuente
          </button>
        )}
        <div className="course-source-dialog__actions">
          <button type="button" className="platform-button" onClick={onClose}>
            Cancelar
          </button>
          <SubmitButton className="platform-button" pendingLabel="Guardando…">
            {isEdit ? "Guardar fuente" : "Agregar fuente"}
          </SubmitButton>
        </div>
      </footer>
    </PlatformForm>
  );
}
