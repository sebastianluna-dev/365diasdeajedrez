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
  /** Cómo se distingue dentro del estudio. Ausente = se identifica por la pareja. */
  title?: string;
  white: string;
  black: string;
  /** Token PGN del resultado: "1-0", "0-1", "1/2-1/2", "*". */
  resultLabel: string;
  eco?: string;
  event?: string;
  playedAtLabel?: string;
  href: string;
}

/**
 * Partida vista en clase. Como no vive en una base del alumno, su enlace lleva
 * a la clase donde se vio, no al visor de estudios.
 */
export interface ClassGameItem {
  id: string;
  white: string;
  black: string;
  resultLabel: string;
  eco?: string;
  playedAtLabel?: string;
  className: string;
  classDateLabel: string;
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
  /** El que mira es el dueño de la base: puede abrir el tablero de análisis. */
  canEdit: boolean;
  /** Cómo se distingue dentro del estudio. Ausente = se identifica por la pareja. */
  title?: string;
  /** Códigos crudos, para poder rellenar el formulario de datos. */
  resultCode: string;
  /** ISO corto (aaaa-mm-dd) para el <input type="date">. */
  playedAtValue?: string;
  round?: string;
  initialFen?: string;
  /** Bloques de clase que citan esta partida: borrarla los dejaría vacíos. */
  classBlockCount: number;
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
