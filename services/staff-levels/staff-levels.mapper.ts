import type { Prisma } from "@/lib/platform-db/generated/client";
import { formatEloRange } from "@/services/courses/level-rules";
import type { LevelAdminRow, LevelOption } from "./staff-levels.types";

// Selects shared between service and mapper: the mapper owns the shape it
// needs and the service only queries it.

/** By difficulty; by range and by name when two levels share a position. */
export const levelOrderBy = [
  { order: "asc" },
  { eloMin: "asc" },
  { name: "asc" },
] satisfies Prisma.LevelOrderByWithRelationInput[];

export const levelAdminSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  order: true,
  eloMin: true,
  eloMax: true,
  isActive: true,
  _count: { select: { courseLevels: true } },
} satisfies Prisma.LevelSelect;

export type LevelAdminRowData = Prisma.LevelGetPayload<{ select: typeof levelAdminSelect }>;

export function mapLevelAdmin(row: LevelAdminRowData): LevelAdminRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    order: row.order,
    eloMin: row.eloMin,
    eloMax: row.eloMax ?? undefined,
    eloRange: formatEloRange(row),
    isActive: row.isActive,
    courseCount: row._count.courseLevels,
  };
}

export const levelOptionSelect = {
  slug: true,
  name: true,
  eloMin: true,
  eloMax: true,
  isActive: true,
} satisfies Prisma.LevelSelect;

export type LevelOptionData = Prisma.LevelGetPayload<{ select: typeof levelOptionSelect }>;

export function mapLevelOption(row: LevelOptionData): LevelOption {
  return {
    slug: row.slug,
    name: row.name,
    eloRange: formatEloRange(row),
    isActive: row.isActive,
  };
}
