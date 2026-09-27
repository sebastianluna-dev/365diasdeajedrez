"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons/close-icon.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { staffRoutes } from "@/lib/platform-routes";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import { entityFieldLabel } from "@/services/staff-sources/source-rules";
import type { CourseSourceAdmin, SourceEntityOption } from "@/services/staff-sources/staff-sources.types";

interface CourseSourceFormProps {
  /** The source being edited; absent when adding one. */
  source?: CourseSourceAdmin;
  sourceTypes: CatalogOption[];
  entities: SourceEntityOption[];
  /** Where the form posts: the server action bound to the course, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  onClose: () => void;
  /** Runs when the browser lets the submit through, i.e. with a valid form. */
  onSubmit?: () => void;
}

/**
 * The fields of one source, with no dialog and no action of its own:
 * `CourseSourceDialog` mounts it with `saveCourseSource`, the story with a
 * stub. Only the type is required. The entity field is named by the type —
 * «Editorial» for a book, «Plataforma o proveedor» for a digital course — and
 * offers the entities the staff registered, with a link to register another.
 */
export function CourseSourceForm({ source, sourceTypes, entities, action, onClose, onSubmit }: CourseSourceFormProps) {
  const [sourceTypeCode, setSourceTypeCode] = useState(source?.sourceTypeCode ?? sourceTypes[0]?.code ?? "");
  const isEdit = source !== undefined;

  return (
    <PlatformForm action={action} className="course-source-dialog__form" onSubmit={onSubmit} autoComplete="off">
      {/* Which source is rewritten; absent, the action creates one. */}
      {isEdit && <input type="hidden" name="sourceId" value={source.id} />}

      <header className="course-source-dialog__head">
        <div className="course-source-dialog__heading">
          <h2 className="course-source-dialog__title">{isEdit ? "Editar fuente" : "Nueva fuente"}</h2>
          <p className="course-source-dialog__subtitle">De dónde procede el material del curso.</p>
        </div>
        <button type="button" className="course-source-dialog__close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon className="course-source-dialog__close-icon" />
        </button>
      </header>

      <div className="course-source-dialog__body">
        <PlatformFormField name="sourceTypeCode" label="Tipo de fuente">
          <PlatformSelect
            value={sourceTypeCode}
            onValueChange={setSourceTypeCode}
            options={sourceTypes.map((type) => ({ value: type.code, label: type.label }))}
            required
          />
        </PlatformFormField>

        <PlatformFormField name="originalTitle" label="Título original" optionalLabel="Opcional">
          <input type="text" maxLength={300} defaultValue={source?.originalTitle ?? ""} placeholder="Mi sistema" />
        </PlatformFormField>

        <PlatformFormField
          name="authors"
          label="Autores"
          optionalLabel="Opcional"
          hint="Quien firma el recurso, no el curso. Varios, separados por comas."
        >
          <input type="text" maxLength={300} defaultValue={source?.authors ?? ""} placeholder="Aron Nimzowitsch" />
        </PlatformFormField>

        <PlatformFormField name="entityId" label={entityFieldLabel(sourceTypeCode)} optionalLabel="Opcional">
          <PlatformSelect
            defaultValue={source?.entityId ?? ""}
            emptyOption="Ninguna"
            options={entities.map((entity) => ({ value: entity.id, label: entity.name }))}
          />
        </PlatformFormField>
        <p className="course-source-dialog__entity-note">
          ¿Falta una?{" "}
          <a href={staffRoutes.entities} target="_blank" rel="noreferrer">
            Crea la entidad
          </a>{" "}
          y recarga la ficha para verla aquí.
        </p>

        <PlatformFormField
          name="url"
          label="Enlace"
          optionalLabel="Opcional"
          messages={{ typeMismatch: "Tiene que ser una dirección http(s)." }}
        >
          <input type="url" maxLength={2000} defaultValue={source?.url ?? ""} placeholder="https://" />
        </PlatformFormField>

        <div className="course-source-dialog__pair">
          <PlatformFormField name="publicationYear" label="Año de publicación" optionalLabel="Opcional">
            <input
              type="number"
              min={1400}
              max={2100}
              step={1}
              defaultValue={source?.publicationYear ?? ""}
              placeholder="1925"
            />
          </PlatformFormField>

          <PlatformFormField name="edition" label="Edición o versión" optionalLabel="Opcional">
            <input type="text" maxLength={80} defaultValue={source?.edition ?? ""} placeholder="2.ª ed." />
          </PlatformFormField>
        </div>

        <PlatformFormField
          name="specificReference"
          label="Referencia específica"
          optionalLabel="Opcional"
          hint="Capítulos, páginas, lecciones o secciones que usa el curso."
        >
          <textarea maxLength={500} rows={2} defaultValue={source?.specificReference ?? ""} />
        </PlatformFormField>

        <PlatformFormField name="notes" label="Notas" optionalLabel="Sólo para el equipo">
          <textarea maxLength={1000} rows={2} defaultValue={source?.notes ?? ""} />
        </PlatformFormField>
      </div>

      <footer className="course-source-dialog__foot">
        <p className="course-source-dialog__note">Sólo el tipo es obligatorio.</p>
        <div className="course-source-dialog__actions">
          <button type="button" className="platform-button platform-button_variant_secondary" onClick={onClose}>
            Cancelar
          </button>
          <SubmitButton pendingLabel="Guardando…">{isEdit ? "Guardar fuente" : "Añadir fuente"}</SubmitButton>
        </div>
      </footer>
    </PlatformForm>
  );
}
