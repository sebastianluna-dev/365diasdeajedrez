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
  /**
   * Si esta tarjeta ofrece borrar. Fuera quedan las bases de curso (no son
   * suyas), la tarjeta de partidas de clase (no es una base real) y «Mis
   * partidas», que se crea con la cuenta y es única.
   */
  canDelete: boolean;
  /** Partidas de este estudio citadas en alguna clase; se avisa antes de borrar. */
  citedGameCount: number;
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
  /**
   * Lo que se lee en la columna «Nombre». Nunca vacío: cae al número de ronda
   * y, a falta de él, a la posición dentro del estudio.
   */
  label: string;
  /** Citada en el contenido de alguna clase: se marca en la lista. */
  citedInClass: boolean;
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
  /** Code del catálogo, para preseleccionar el tipo al editar. */
  kindCode: string;
  createdAtLabel: string;
  isCourseStudy: boolean;
  courseName?: string;
  /** Partidas del estudio citadas en el contenido de alguna clase. */
  citedGameCount: number;
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
  whiteTitle?: string;
  blackTitle?: string;
  /** Código de federación del PGN («MEX»); la bandera se compone al pintar. */
  whiteCountry?: string;
  blackCountry?: string;
  resultLabel: string;
  event?: string;
  site?: string;
  eco?: string;
  playedAtLabel?: string;
  sourceLabel: string;
  pgn: string;
}
