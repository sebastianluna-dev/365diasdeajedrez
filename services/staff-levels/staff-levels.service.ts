import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import {
  levelAdminSelect,
  levelOptionSelect,
  levelOrderBy,
  mapLevelAdmin,
  mapLevelOption,
} from "./staff-levels.mapper";
import type { LevelAdminRow, LevelOption } from "./staff-levels.types";

// The levels a course is aimed at. Unlike the other catalogs of the course
// editor, this one IS edited from the interface (/administracion/niveles):
// that is why it has a service of its own and is identified by slug.

/** Every level, retired ones included, with how many courses have it. */
export async function listLevels(): Promise<LevelAdminRow[]> {
  await requireStaff();
  const rows = await getPlatformDb().level.findMany({ select: levelAdminSelect, orderBy: levelOrderBy });
  return rows.map(mapLevelAdmin);
}

/**
 * The levels the course editor offers, by difficulty. The retired ones come
 * too, marked: the editor saves the whole set, so leaving one out would take
 * it from every course saved afterwards.
 */
export async function listLevelOptions(): Promise<LevelOption[]> {
  await requireStaff();
  const rows = await getPlatformDb().level.findMany({ select: levelOptionSelect, orderBy: levelOrderBy });
  return rows.map(mapLevelOption);
}
