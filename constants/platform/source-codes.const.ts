// Stable codes of the "Procedencia del recurso" catalogs: where a course's
// material comes from. The labels live in the seed.

/** Kind of resource a course draws on. Chessable or ChessBase are ENTITIES of a DIGITAL_COURSE, not types. */
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

/** What a source entity is; one entity may be several at once. */
export const SOURCE_ENTITY_KIND = {
  DIGITAL_PLATFORM: "DIGITAL_PLATFORM",
  PUBLISHER: "PUBLISHER",
  CONTENT_PROVIDER: "CONTENT_PROVIDER",
  OTHER: "OTHER",
} as const;

export type SourceEntityKindCode = (typeof SOURCE_ENTITY_KIND)[keyof typeof SOURCE_ENTITY_KIND];

export const SOURCE_ENTITY_KIND_CODES: readonly SourceEntityKindCode[] = Object.values(SOURCE_ENTITY_KIND);
