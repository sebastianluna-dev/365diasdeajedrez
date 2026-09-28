// Stable codes of the content catalogs (courses, chapters, lessons).

/**
 * What a course teaches. A course has several of these and never none; the
 * labels, short labels and descriptions live in the seed.
 */
export const CONTENT_TYPE = {
  OPENINGS: "OPENINGS",
  TACTICS: "TACTICS",
  CALCULATION: "CALCULATION",
  STRATEGY: "STRATEGY",
  PAWN_STRUCTURES: "PAWN_STRUCTURES",
  ENDGAMES: "ENDGAMES",
  GAME_ANALYSIS: "GAME_ANALYSIS",
  PREPARATION: "PREPARATION",
} as const;

export type ContentTypeCode = (typeof CONTENT_TYPE)[keyof typeof CONTENT_TYPE];

export const CONTENT_TYPE_CODES: readonly ContentTypeCode[] = Object.values(CONTENT_TYPE);

export const COURSE_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type CourseStatusCode = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

export const AUTHOR_ROLE = {
  CONTENT_AUTHOR: "CONTENT_AUTHOR",
  DIGITAL_ADAPTATION: "DIGITAL_ADAPTATION",
} as const;

export type AuthorRoleCode = (typeof AUTHOR_ROLE)[keyof typeof AUTHOR_ROLE];

/**
 * Slugs of the levels the platform ships with: the six rows of the `Level`
 * catalog, which the migration creates and the seed keeps. The catalog is not
 * edited from the interface. It goes by slug and not by code because the slug
 * is what the course list is filtered by (`/cursos?nivel=intermedio`); the
 * application never decides anything by comparing against these.
 */
export const DEFAULT_LEVEL = {
  INITIATION: "iniciacion",
  BEGINNER: "principiante",
  INTERMEDIATE: "intermedio",
  ADVANCED: "avanzado",
  EXPERT: "experto",
  MASTER: "maestro",
} as const;

/**
 * Role of a chapter within the course, or of a lesson within the chapter.
 *
 * No role = normal content, which is what almost all of them are. Only what
 * opens and what closes is named.
 */
export const CONTENT_ROLE = {
  INTRO: "INTRO",
  CLOSING: "CLOSING",
} as const;

export type ContentRoleCode = (typeof CONTENT_ROLE)[keyof typeof CONTENT_ROLE];

export function isContentRoleCode(value: string): value is ContentRoleCode {
  return (Object.values(CONTENT_ROLE) as string[]).includes(value);
}
