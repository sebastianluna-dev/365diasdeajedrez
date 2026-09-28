import type { SourceTypeCode } from "@/constants/platform/source-codes.const";

/** One source of a course, as the staff panel lists and edits it. */
export interface CourseSourceAdmin {
  id: string;
  order: number;
  sourceTypeCode: SourceTypeCode;
  sourceTypeLabel: string;
  originalTitle?: string;
  /** Free text, several authors separated by commas. */
  authors?: string;
  url?: string;
  publicationYear?: number;
  edition?: string;
  specificReference?: string;
  /** Staff only. */
  notes?: string;
}
