import type { StudyPermissions } from "./study-rules";

export interface StudySummary {
  id: string;
  name: string;
  description?: string;
  kindLabel: string;
  /** Code del catálogo: la interfaz decide con él, no con la etiqueta. */
  kindCode: string;
  gameCount: number;
  updatedAtLabel: string;
  /** Nombre del curso cuando la base pertenece a un curso (sólo lectura). */
  courseName?: string;
  isCourseStudy: boolean;
  /** Nombre del maestro cuando la colección se la repartieron (sólo lectura). */
  sharedByName?: string;
  /**
   * Qué puede hacer con este estudio quien está mirando. Sale de
   * services/studies/study-rules, que es la misma tabla que aplican las server
   * actions: la interfaz no ofrece nada que la acción vaya a rechazar.
   */
  permissions: StudyPermissions;
  /** Partidas de este estudio citadas en alguna clase; se avisa antes de borrar. */
  citedGameCount: number;
  href: string;
}

/** Un alumno al que se le repartió una colección. */
export interface StudyShareItem {
  userId: string;
  displayName: string;
  email: string;
  sharedAtLabel: string;
}

/** Alumno del profesor, para el desplegable de repartir una colección. */
export interface StudentOption {
  id: string;
  displayName: string;
  email: string;
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
  round?: string;
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
  /** Nombre del maestro cuando la colección se la repartieron. */
  sharedByName?: string;
  permissions: StudyPermissions;
  /**
   * A quién se le repartió. Sólo se llena para el DUEÑO de una colección: a
   * quien la recibe no le incumbe con quién más la comparten.
   */
  shares: StudyShareItem[];
  /** Partidas del estudio citadas en el contenido de alguna clase. */
  citedGameCount: number;
  games: StudyGameItem[];
}

export interface GameView {
  id: string;
  /** El que mira es el dueño de la base: puede editar y anotar la partida. */
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
