import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { CatalogOption } from "@/services/staff-courses/staff-courses.types";

// "Procedencia del recurso": the catalog its form offers. The sources
// themselves hang from the course and are read with it (`getCourseAdminDetail`).

// Catalog: READ to populate the selector, never edited from the interface.

export async function listSourceTypes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().sourceType.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}
