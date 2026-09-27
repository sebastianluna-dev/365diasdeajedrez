import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";
import { mapSourceEntityAdmin, sourceEntityAdminSelect } from "./staff-sources.mapper";
import type { SourceEntityAdminRow, SourceEntityOption } from "./staff-sources.types";

// "Procedencia del recurso": the catalogs its forms offer and the entities the
// staff manages at /administracion/entidades. The sources themselves hang from
// the course and are read with it (`getCourseAdminDetail`).

// Catalogs: READ to populate selectors, never edited from the interface.

export async function listSourceTypes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().sourceType.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listSourceEntityKinds(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().sourceEntityKind.findMany({
    select: { code: true, label: true },
    orderBy: { order: "asc" },
  });
}

/** Every entity with its kinds and how many sources cite it, for the admin page. */
export async function listSourceEntities(): Promise<SourceEntityAdminRow[]> {
  await requireStaff();
  const rows = await getPlatformDb().sourceEntity.findMany({
    select: sourceEntityAdminSelect,
    orderBy: { name: "asc" },
  });
  return rows.map(mapSourceEntityAdmin);
}

/** Just id and name, for the source form's select. */
export async function listSourceEntityOptions(): Promise<SourceEntityOption[]> {
  await requireStaff();
  return getPlatformDb().sourceEntity.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}
