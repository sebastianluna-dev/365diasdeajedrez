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

export const PRESENTATION_MODE = {
  MOVE_SEQUENCE: "MOVE_SEQUENCE",
  GAME_ANALYSIS: "GAME_ANALYSIS",
  STATIC_DIAGRAMS: "STATIC_DIAGRAMS",
} as const;

export type PresentationModeCode = (typeof PRESENTATION_MODE)[keyof typeof PRESENTATION_MODE];

export const INITIAL_POSITION_TYPE = {
  STARTING_POSITION: "STARTING_POSITION",
  FEN: "FEN",
} as const;

export type InitialPositionTypeCode = (typeof INITIAL_POSITION_TYPE)[keyof typeof INITIAL_POSITION_TYPE];
