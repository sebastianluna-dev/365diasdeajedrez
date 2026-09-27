// Rules of the "Procedencia del recurso" form that the client needs too, so
// they are pure and import nothing from the server.

import { SOURCE_TYPE } from "@/constants/platform/source-codes.const";

export type EntityFieldLabel = "Editorial" | "Plataforma o proveedor" | "Entidad de origen";

/**
 * What the entity field is called for a given kind of resource: a book has a
 * publisher, a digital course a platform or provider, anything else an origin.
 */
export function entityFieldLabel(sourceTypeCode: string): EntityFieldLabel {
  if (sourceTypeCode === SOURCE_TYPE.BOOK) return "Editorial";
  if (sourceTypeCode === SOURCE_TYPE.DIGITAL_COURSE) return "Plataforma o proveedor";
  return "Entidad de origen";
}
