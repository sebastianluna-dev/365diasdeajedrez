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
  /** How long ago it was last touched: "hace 3 meses". */
  updatedAgoLabel: string;
  /**
   * What «Recientes» orders by, as an ISO string: when the viewer last opened
   * a game of the study (`StudyVisit`), or, for one they never opened, when it
   * was created — so a study just made is not sent to the bottom.
   */
  recentAt: string;
  /**
   * The position the card's board shows: where the last game the viewer
   * opened ends (`finalFenOf`), or the first game when they never opened one,
   * the starting position for a study with no games.
   */
  boardFen: string;
  /** Which side the card's board is seen from: that game's orientation. */
  boardOrientation: "white" | "black";
  /**
   * The game the viewer last left the study on, for «Sigue donde ibas»: what
   * it is called and who played it, and how long ago it was opened. Absent
   * when they never opened one, or that game was deleted.
   */
  resume?: StudyResume;
  /**
   * Everything the list's search matches against, folded (`foldForSearch`):
   * the name, the description, where it comes from and every game's title,
   * players and event.
   */
  searchText: string;
  /**
   * Where a study that is not theirs comes from, for the card to say it: a
   * course, the teacher who shared it, or the classes they attended. Absent on
   * their own.
   */
  origin?: StudyOrigin;
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

/** The game a study was last left on (`StudyVisit`), as «Sigue donde ibas» names it. */
export interface StudyResume {
  /** The game's title, or its round («Ronda 3»); absent when it only has its players. */
  gameName?: string;
  /** «Pérez — Gómez». */
  players: string;
  /** «hace 2 horas». */
  openedAgoLabel: string;
}

/** Where a study that reached the viewer comes from. */
export interface StudyOrigin {
  code: "COURSE" | "TEACHER" | "CLASSES";
  /** What the card writes: the course's name, the teacher's, or «Tus clases». */
  label: string;
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

/** The two sides a game's board can open from; the catalog's `AUTO` is not a game's. */
export type GameOrientationCode = "WHITE" | "BLACK";

/** The three settings of a game its owner sets from the gear of its row. */
export interface GameSettingsValues {
  /** Which side the board opens from. */
  orientationCode: GameOrientationCode;
  /** How a reader goes through it (`GAME_ANALYSIS_MODE`). Absent = plain analysis. */
  analysisModeCode?: string;
  /** The owner's text heading the notation, before the moves. */
  pinnedComment?: string;
}

export interface StudyGameItem extends GameSettingsValues {
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
  /** The class's date as an ISO string: the class-games card's recency. */
  classDate: string;
  classDateLabel: string;
  /** The same date as a distance: "hace 3 meses". */
  classDateAgoLabel: string;
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
  /** All the games of the study, even when `games` is only its first ones. */
  gameCount: number;
  /**
   * The games, in the study's order: every one of them on the game pages
   * (`getStudyWithGames`), the first `STUDY_GAMES_PAGE_SIZE` on the study's
   * own URL (`getStudyById`), which only needs the first.
   */
  games: StudyGameItem[];
}

export interface GameView extends GameSettingsValues {
  id: string;
  /** Whoever is looking owns the database: they can edit and annotate the game. */
  canEdit: boolean;
  /**
   * «Crear ejercicio desde aquí» is offered on its moves (D11): the game is
   * the viewer's own and they are an active teacher, with the exercises on.
   */
  canCreateExercise: boolean;
  /**
   * Where «Crear ejercicio desde aquí» starts, without the move (the viewer
   * appends it): the teacher's bank, or the academy's for the staff (phase 4).
   * Set exactly when `canCreateExercise`.
   */
  createExerciseHref?: string;
  /** How it is told apart within the study. Absent = it is identified by the pairing. */
  title?: string;
  /** Raw codes, so the data form can be filled in. */
  resultCode: string;
  /** Short ISO (yyyy-mm-dd) for the <input type="date">. */
  playedAtValue?: string;
  round?: string;
  initialFen?: string;
  /**
   * Moves of the main line as a player counts them — White's and Black's are
   * one —, from the position index: 0 for a game with nothing played yet.
   */
  moveCount: number;
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
