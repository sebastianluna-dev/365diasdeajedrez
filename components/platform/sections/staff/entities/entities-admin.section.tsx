import { FormField, FormFieldset } from "@/components/platform/shared/form-field.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import { createSourceEntity, updateSourceEntity } from "@/services/staff-sources/staff-sources.actions";
import type { SourceEntityAdminRow } from "@/services/staff-sources/staff-sources.types";
import "./entities-admin.section.css";

interface EntitiesAdminSectionProps {
  entities: SourceEntityAdminRow[];
  /** The kinds an entity can be, from the catalog. */
  kinds: CatalogOption[];
  errorCode?: string;
}

/**
 * The platforms, publishers and providers the courses cite as the origin of
 * their material: like authors, editorial content edited from the interface
 * and never deleted. A create form on top and one inline form per entity, so
 * saving one never touches another. Its kinds are a checkbox group drawn as
 * cards, several at once.
 */
export function EntitiesAdminSection({ entities, kinds, errorCode }: EntitiesAdminSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const kindOptions = kinds.map((kind) => ({ value: kind.code, label: kind.label }));

  return (
    <div className="entities-admin">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <form className="entities-admin__create platform-card" action={createSourceEntity}>
        <h2 className="platform-card__title">Nueva entidad</h2>

        <div className="entities-admin__fields">
          <FormField label="Nombre" hint="Chessable, ChessBase, Quality Chess… No puede repetirse.">
            <input type="text" name="name" maxLength={160} required />
          </FormField>

          <FormField label="Sitio web (opcional)">
            <input type="url" name="website" maxLength={2000} placeholder="https://" />
          </FormField>
        </div>

        <FormFieldset legend="Tipo de entidad" hint="Al menos uno; puede ser varios a la vez." frame="none">
          <PlatformCheckCards name="kindCodes" aria-label="Tipo de entidad" options={kindOptions} />
        </FormFieldset>

        <FormField label="Descripción (opcional)">
          <textarea name="description" maxLength={1000} />
        </FormField>

        <SubmitButton pendingLabel="Creando…">Crear entidad</SubmitButton>
      </form>

      {entities.map((entity) => (
        <form
          key={entity.id}
          className="entities-admin__row platform-card"
          action={updateSourceEntity.bind(null, entity.id)}
        >
          <h3 className="entities-admin__row-title">
            {entity.name}
            <span className="entities-admin__row-meta">
              {entity.sourceCount} fuente{entity.sourceCount === 1 ? "" : "s"}
            </span>
          </h3>

          <div className="entities-admin__fields">
            <FormField label="Nombre">
              <input type="text" name="name" defaultValue={entity.name} maxLength={160} required />
            </FormField>

            <FormField label="Sitio web (opcional)">
              <input type="url" name="website" defaultValue={entity.website ?? ""} maxLength={2000} />
            </FormField>
          </div>

          <FormFieldset legend="Tipo de entidad" frame="none">
            <PlatformCheckCards
              name="kindCodes"
              aria-label="Tipo de entidad"
              defaultValue={entity.kindCodes}
              options={kindOptions}
            />
          </FormFieldset>

          <FormField label="Descripción (opcional)">
            <textarea name="description" defaultValue={entity.description ?? ""} maxLength={1000} />
          </FormField>

          <SubmitButton className="platform-button platform-button_variant_secondary">Guardar</SubmitButton>
        </form>
      ))}
    </div>
  );
}
