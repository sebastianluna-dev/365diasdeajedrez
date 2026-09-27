import type { SourceTypeCode } from "@/constants/platform/source-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { CourseSourceAdmin, SourceEntityAdminRow } from "./staff-sources.types";

// Selects shared between service and mapper: the mapper owns the shape it
// needs and the service only queries it.

export const courseSourceAdminSelect = {
  id: true,
  order: true,
  originalTitle: true,
  authors: true,
  entityId: true,
  url: true,
  publicationYear: true,
  edition: true,
  specificReference: true,
  notes: true,
  sourceType: { select: { code: true, label: true } },
  entity: { select: { name: true } },
} satisfies Prisma.CourseSourceSelect;

export type CourseSourceAdminRow = Prisma.CourseSourceGetPayload<{ select: typeof courseSourceAdminSelect }>;

export function mapCourseSourceAdmin(row: CourseSourceAdminRow): CourseSourceAdmin {
  return {
    id: row.id,
    order: row.order,
    sourceTypeCode: row.sourceType.code as SourceTypeCode,
    sourceTypeLabel: row.sourceType.label,
    originalTitle: row.originalTitle ?? undefined,
    authors: row.authors ?? undefined,
    entityId: row.entityId ?? undefined,
    entityName: row.entity?.name,
    url: row.url ?? undefined,
    publicationYear: row.publicationYear ?? undefined,
    edition: row.edition ?? undefined,
    specificReference: row.specificReference ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export const sourceEntityAdminSelect = {
  id: true,
  name: true,
  website: true,
  description: true,
  kinds: { select: { kind: { select: { code: true, label: true } } }, orderBy: { kind: { order: "asc" } } },
  _count: { select: { sources: true } },
} satisfies Prisma.SourceEntitySelect;

export type SourceEntityAdminRowData = Prisma.SourceEntityGetPayload<{ select: typeof sourceEntityAdminSelect }>;

export function mapSourceEntityAdmin(row: SourceEntityAdminRowData): SourceEntityAdminRow {
  return {
    id: row.id,
    name: row.name,
    website: row.website ?? undefined,
    description: row.description ?? undefined,
    kindCodes: row.kinds.map((link) => link.kind.code),
    kindLabels: row.kinds.map((link) => link.kind.label),
    sourceCount: row._count.sources,
  };
}
