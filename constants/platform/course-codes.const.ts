// Codes estables de los catálogos de contenido (cursos, capítulos, lecciones).

export const COURSE_TYPE = {
  OPENING: "OPENING",
  ENDGAME: "ENDGAME",
  STRATEGY: "STRATEGY",
  TACTICS: "TACTICS",
} as const;

export type CourseTypeCode = (typeof COURSE_TYPE)[keyof typeof COURSE_TYPE];

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

export const LEVEL = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
  EXPERT: "EXPERT",
} as const;

export type LevelCode = (typeof LEVEL)[keyof typeof LEVEL];

/**
 * Papel de un capítulo dentro del curso, o de una lección dentro del capítulo.
 *
 * Ausencia de papel = contenido normal, que es lo que son casi todos. Sólo se
 * nombra lo que abre y lo que cierra.
 */
export const CONTENT_ROLE = {
  INTRO: "INTRO",
  CLOSING: "CLOSING",
} as const;

export type ContentRoleCode = (typeof CONTENT_ROLE)[keyof typeof CONTENT_ROLE];

export function isContentRoleCode(value: string): value is ContentRoleCode {
  return (Object.values(CONTENT_ROLE) as string[]).includes(value);
}
