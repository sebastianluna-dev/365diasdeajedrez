export interface StudySummary {
  id: string;
  name: string;
  description?: string;
  kindLabel: string;
  gameCount: number;
  updatedAtLabel: string;
  /** Nombre del curso cuando la base pertenece a un curso (sólo lectura). */
  courseName?: string;
  isCourseStudy: boolean;
  href: string;
}

/** Opción del catálogo DatabaseKind para el formulario de crear estudio. */
export interface StudyKindOption {
  code: string;
  label: string;
}

export interface StudyGameItem {
  id: string;
  white: string;
  black: string;
  /** Token PGN del resultado: "1-0", "0-1", "1/2-1/2", "*". */
  resultLabel: string;
  eco?: string;
  event?: string;
  playedAtLabel?: string;
  href: string;
}

export interface StudyDetail {
  id: string;
  name: string;
  description?: string;
  kindLabel: string;
  isCourseStudy: boolean;
  courseName?: string;
  games: StudyGameItem[];
}

export interface GameView {
  id: string;
  studyId: string;
  studyName: string;
  studyHref: string;
  white: string;
  black: string;
  whiteElo?: number;
  blackElo?: number;
  resultLabel: string;
  event?: string;
  site?: string;
  eco?: string;
  playedAtLabel?: string;
  sourceLabel: string;
  pgn: string;
}
