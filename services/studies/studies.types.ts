import type { StudyPermissions } from "./study-rules";

export interface StudySummary {
  id: string;
  name: string;
  description?: string;
  kindLabel: string;
  /** Catalog code: the interface decides with it, not with the label. */
  kindCode: string;
  gameCount: number;
  updatedAtLabel: string;
  /** Name of the course when the database belongs to a course (read-only). */
  courseName?: string;
  isCourseStudy: boolean;
  /** Name of the teacher when the collection was shared with them (read-only). */
  sharedByName?: string;
  /**
   * What whoever is looking can do with this study. It comes from
   * services/studies/study-rules, which is the same table the server actions
   * apply: the interface offers nothing the action is going to reject.
   */
  permissions: StudyPermissions;
  /** Games of this study cited in some class; a warning is given before deleting. */
  citedGameCount: number;
  href: string;
}

/** A student a collection was shared with. */
export interface StudyShareItem {
  userId: string;
  displayName: string;
  email: string;
  sharedAtLabel: string;
}

/** Student of the teacher, for the dropdown to share a collection. */
export interface StudentOption {
  id: string;
  displayName: string;
  email: string;
}

/** Option of the DatabaseKind catalog for the create-study form. */
export interface StudyKindOption {
  code: string;
  label: string;
}

export interface StudyGameItem {
  id: string;
  /** How it is told apart within the study. Absent = it is identified by the pairing. */
  title?: string;
  /**
   * What is read in the "Nombre" column. Never empty: it falls back to the round
   * number and, failing that, to the position within the study.
   */
  label: string;
  /** Cited in the content of some class: it is marked in the list. */
  citedInClass: boolean;
  white: string;
  black: string;
  /** PGN token of the result: "1-0", "0-1", "1/2-1/2", "*". */
  resultLabel: string;
  round?: string;
  eco?: string;
  event?: string;
  playedAtLabel?: string;
  href: string;
}

/**
 * Game seen in class. Since it does not live in a database of the student's,
 * its link leads to the class where it was seen, not to the studies viewer.
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
  /** Catalog code, to preselect the kind when editing. */
  kindCode: string;
  createdAtLabel: string;
  isCourseStudy: boolean;
  courseName?: string;
  /** Name of the teacher when the collection was shared with them. */
  sharedByName?: string;
  permissions: StudyPermissions;
  /**
   * Who it was shared with. It is only filled for the OWNER of a collection:
   * whoever receives it has no business knowing who else it is shared with.
   */
  shares: StudyShareItem[];
  /** Games of the study cited in the content of some class. */
  citedGameCount: number;
  /** All the games of the study, not only the page below. */
  gameCount: number;
  /** The page of games this detail carries (1-based) and how many there are. */
  page: number;
  pageCount: number;
  /** One page of games (`STUDY_GAMES_PAGE_SIZE`), in the study's order. */
  games: StudyGameItem[];
}

export interface GameView {
  id: string;
  /** Whoever is looking owns the database: they can edit and annotate the game. */
  canEdit: boolean;
  /** How it is told apart within the study. Absent = it is identified by the pairing. */
  title?: string;
  /** Raw codes, so the data form can be filled in. */
  resultCode: string;
  /** Short ISO (yyyy-mm-dd) for the <input type="date">. */
  playedAtValue?: string;
  round?: string;
  initialFen?: string;
  /** Class blocks that cite this game: deleting it would leave them empty. */
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
  /** The PGN's federation code ("MEX"); the flag is composed when rendering. */
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
