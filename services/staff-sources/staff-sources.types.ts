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
  entityId?: string;
  entityName?: string;
  url?: string;
  publicationYear?: number;
  edition?: string;
  specificReference?: string;
  /** Staff only. */
  notes?: string;
}

/** An entity as the source form offers it. */
export interface SourceEntityOption {
  id: string;
  name: string;
}

/** An entity as /administracion/entidades lists and edits it. */
export interface SourceEntityAdminRow {
  id: string;
  name: string;
  website?: string;
  description?: string;
  /** Codes of SourceEntityKind, in catalog order. */
  kindCodes: string[];
  kindLabels: string[];
  /** Course sources citing it. */
  sourceCount: number;
}
