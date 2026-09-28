// Stable codes of the "Procedencia del recurso" catalogs: where a course's
// material comes from. The labels live in the seed.

/** Kind of resource a course draws on. */
export const SOURCE_TYPE = {
  BOOK: "BOOK",
  DIGITAL_COURSE: "DIGITAL_COURSE",
  IN_PERSON_COURSE: "IN_PERSON_COURSE",
  VIDEO: "VIDEO",
  ARTICLE: "ARTICLE",
  MAGAZINE: "MAGAZINE",
  GAME_DATABASE: "GAME_DATABASE",
  INTERACTIVE_STUDY: "INTERACTIVE_STUDY",
  COACH_MATERIAL: "COACH_MATERIAL",
  OWN_MATERIAL: "OWN_MATERIAL",
  COMPILATION: "COMPILATION",
  OTHER: "OTHER",
} as const;

export type SourceTypeCode = (typeof SOURCE_TYPE)[keyof typeof SOURCE_TYPE];

export const SOURCE_TYPE_CODES: readonly SourceTypeCode[] = Object.values(SOURCE_TYPE);
