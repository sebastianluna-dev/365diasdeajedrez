import type { SourceTypeCode } from "@/constants/platform/source-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { CourseSourceAdmin } from "./staff-sources.types";

// Selects shared between service and mapper: the mapper owns the shape it
// needs and the service only queries it.

export const courseSourceAdminSelect = {
  id: true,
  order: true,
  originalTitle: true,
  authors: true,
  url: true,
  publicationYear: true,
  edition: true,
  specificReference: true,
  notes: true,
  sourceType: { select: { code: true, label: true } },
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
    url: row.url ?? undefined,
    publicationYear: row.publicationYear ?? undefined,
    edition: row.edition ?? undefined,
    specificReference: row.specificReference ?? undefined,
    notes: row.notes ?? undefined,
  };
}
