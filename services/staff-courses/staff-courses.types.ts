import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseAuthoringGame,
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";
import type { ExercisePickOption } from "@/components/platform/shared/exercise-picker/exercise-picker.types";
import type { AuthorRoleCode, CourseStatusCode } from "@/constants/platform/course-codes.const";
import type { CourseSourceAdmin } from "@/services/staff-sources/staff-sources.types";
import type { BoardOrientationCode } from "@/constants/platform/shared-codes.const";

export interface CourseAdminSummary {
  id: string;
  name: string;
  slug: string;
  /** URL of the cover; the row shows a small crop to recognise it. */
  cover?: string;
  statusCode: CourseStatusCode;
  statusLabel: string;
  /** Short names of what it teaches, in catalog order: "Aperturas", "Cálculo"… */
  contentTypeLabels: string[];
  /** Who it is for, the easiest first: "Intermedio", "Avanzado". Empty when it says nothing. */
  levelNames: string[];
  chapterCount: number;
  lessonCount: number;
  publishedAtLabel?: string;
  href: string;
}

/** What is searched and which status the course list is filtered by. */
export interface CourseAdminFilter {
  /** Free text: it matches against the name and the identifier. */
  query?: string;
  /** Code of CourseStatus; absent = all. */
  status?: string;
  /** Slug of a Level; absent = every level. The catalog's own filter goes by slug too. */
  level?: string;
}

/** The list with what is needed to render its header. */
export interface CourseAdminList {
  courses: CourseAdminSummary[];
  /** Totals of what is being seen, not of the whole catalog. */
  chapterCount: number;
  lessonCount: number;
}

export interface CourseAuthorRow {
  authorId: string;
  authorName: string;
  /** URL of the author's photo; without one the card draws the initials. */
  authorPhoto?: string;
  roleCode: AuthorRoleCode;
  roleLabel: string;
  order: number;
}

export interface ChapterAdminRow {
  /** Code of ContentRole; absent in normal chapters. */
  roleCode?: string;
  /** "Introducción" or "Cierre", to label it. */
  roleLabel?: string;
  id: string;
  name: string;
  order: number;
  /** The staff marked the whole chapter as priority. */
  isPriority: boolean;
  lessonCount: number;
  /**
   * Estimated minutes: the chapter's own figure, or the sum of its lessons'
   * when it has none. Absent when neither says anything.
   */
  /** Students with progress: if there is any, the chapter is no longer deleted. */
  progressCount: number;
  href: string;
}

export interface CourseAdminDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  /** The wide image, 21:9. */
  cover?: string;
  /** The square one, 1:1. */
  thumbnail?: string;
  statusCode: CourseStatusCode;
  /** For the pill next to the title; the date it was published is in the list. */
  statusLabel: string;
  /** Codes of ContentType, at least one. */
  contentTypeCodes: string[];
  /** Slugs of the levels it is aimed at; none is a valid set. */
  levelSlugs: string[];
  authors: CourseAuthorRow[];
  chapters: ChapterAdminRow[];
  /** «Procedencia del recurso»: where its material comes from, in order. */
  sources: CourseSourceAdmin[];
  /** It meets the minimum requirements to be published (§22.3 of the plan). */
  canPublish: boolean;
}

export interface LessonAdminRow {
  /** Code of ContentRole; absent in normal lessons. */
  roleCode?: string;
  /** "Introducción" or "Cierre", to label it. */
  roleLabel?: string;
  id: string;
  name: string;
  order: number;
  isPriority: boolean;
  hasPgn: boolean;
  /** Its own estimated minutes; absent when nobody said them. */
  durationMin?: number;
  exerciseCount: number;
  progressCount: number;
  href: string;
}

export interface ChapterAdminDetail {
  id: string;
  courseId: string;
  courseName: string;
  courseStatusCode: CourseStatusCode;
  name: string;
  description?: string;
  order: number;
  /** The whole chapter is priority: every lesson of it passes the student's filter. */
  isPriority: boolean;
  /** Sum of its lessons' minutes, cached on the chapter; absent when none declares any. */
  estimatedDuration?: number;
  lessons: LessonAdminRow[];
}

/**
 * One of the lesson's exercises in the staff panel (D04, D05): the bank's card
 * data — the panel draws it with `ExerciseCard`, its `href` the staff editor's
 * — plus its place in the lesson. `allowed` is `lessonExerciseAllowed`'s:
 * «Eliminar» only for one nobody has tried, «Archivar» for the rest,
 * «Restaurar» for an archived one; never «Duplicar».
 */
export interface LessonExerciseAdminRow extends ExerciseCardData {
  /** Null for an archived one, which the panel lists apart and nobody reorders. */
  lessonOrder: number | null;
  attemptCount: number;
}

/** What the editor of a lesson's exercise opens with: the shape of the teacher's, under the lesson. */
export interface LessonExerciseEditor {
  courseId: string;
  chapterId: string;
  lessonId: string;
  lessonName: string;
  /** The lesson's page in the panel, where the editor goes back to. */
  lessonHref: string;
  exercise: ExerciseAuthoringExercise;
  /** When it was last saved (ISO), so a save that stays on the page mounts the editor again on what was stored. */
  version: string;
  /** The status as the lesson's panel words it («Publicado», not the catalog's «En la biblioteca»); null for a new one. */
  statusLabel: string | null;
  catalogs: ExerciseAuthoringCatalogs;
  /** The chapter's collection, for «Desde una partida». */
  games: ExerciseAuthoringGame[];
  permissions: ExerciseAuthoringPermissions;
  buttons: ExerciseSaveButton[];
}

export interface LessonAdminDetail {
  id: string;
  chapterId: string;
  chapterName: string;
  courseId: string;
  courseName: string;
  name: string;
  description?: string;
  order: number;
  isPriority: boolean;
  /** The lesson can be trained from memory (its main line). */
  isTrainable: boolean;
  /** Side the student plays. Absent = whoever moves first. */
  trainingColorCode?: string;
  estimatedDuration?: number;
  orientationCode: BoardOrientationCode;
  /** The content the student sees: the linked game's, or its own. */
  pgn: string;
  /** `lessonHasContent`: that PGN has something besides blanks — the one rule of «content», the student's too. */
  hasContent: boolean;
  pgnUpdatedAtLabel?: string;
  /** The game of the course collection the content comes from. */
  game?: CourseGameRow;
  /**
   * Whether it can be deleted: a draft course and without progress from any
   * student. It is the same condition the server applies, so as not to offer a
   * button that bounces afterwards.
   */
  canDelete: boolean;
  topicCodes: string[];
  /** In their order, the archived ones last. */
  exercises: LessonExerciseAdminRow[];
  /**
   * «Agregar desde la biblioteca» (D28, phase 4): the library's exercises not
   * copied into this lesson yet, as the picker offers them. Empty with the
   * flag off.
   */
  libraryExercises: ExercisePickOption[];
}

/** A game of a chapter's collection, to link it to a lesson. */
export interface CourseGameRow {
  id: string;
  /** The game on the board, where it is read and edited. */
  href: string;
  /** Which chapter the collection belongs to. It is only filled in the course view. */
  chapterName?: string;
  /** "Kotov — Plater". */
  title: string;
  /** Event, year and opening on one line; empty when there is none of the three. */
  detail: string;
  /** Moves of the main line, to know whether the game is complete. */
  moveCount: number;
  /** How many lessons use it; deleting it would leave them without content. */
  lessonCount: number;
}

/** A game of the chapter in the list beside the board, to jump between them. */
export interface ChapterGameSibling {
  id: string;
  /** Its name, or the pairing when it has none. */
  label: string;
  /** "Fischer — Sherwin"; absent when the label already is the pairing. */
  players?: string;
  /** The PGN token: "1-0", "½-½", "*"… */
  resultLabel: string;
  href: string;
}

/**
 * A game of a chapter's collection, open on the board. The record's fields
 * carry the names of `GameFieldValues` on purpose, so the whole object fills
 * the record's form without listing them one by one.
 */
export interface ChapterGameDetail {
  id: string;
  courseId: string;
  courseName: string;
  chapterId: string;
  chapterName: string;
  chapterOrder: number;
  /** How it is told apart in the collection. Absent = it is identified by the pairing. */
  title?: string;
  white: string;
  black: string;
  whiteElo?: number;
  blackElo?: number;
  whiteTitle?: string;
  blackTitle?: string;
  whiteCountry?: string;
  blackCountry?: string;
  resultCode: string;
  resultLabel: string;
  /** Short ISO (yyyy-mm-dd) for the date picker. */
  playedAtValue?: string;
  playedAtLabel?: string;
  event?: string;
  site?: string;
  round?: string;
  eco?: string;
  sourceLabel: string;
  pgn: string;
  /**
   * The side the board is set from: the one its first lesson shows the
   * student. Absent when no lesson uses it or the lesson leaves it to the turn.
   */
  orientation?: "white" | "black";
  /** The lessons that show this game: what is written here, their students read. */
  lessons: { id: string; name: string; href: string }[];
  /** The chapter's games in their order, this one included. */
  siblings: ChapterGameSibling[];
}

export interface CatalogOption {
  code: string;
  label: string;
}

/** A content type as the forms draw it: the long name on the card, the short one on tags. */
export interface ContentTypeOption extends CatalogOption {
  shortLabel: string;
  description: string;
}

/** A level as the course editor offers it, with its orientative Elo range already worded. */
export interface LevelOption {
  slug: string;
  name: string;
  /** "Menos de 800", "800–1199", "2200 o más". */
  eloRange: string;
}

export interface TopicOption {
  id: number;
  code: string;
  label: string;
  /** The parent topic's code (a tactical motif's is TACTICS); null on the first level. */
  parentCode: string | null;
}

/**
 * What saving an author answers the «Autores» dialog with. The dialog stays
 * open over the page, so the outcome has to come back to the form and not to
 * a `?error=` the page would render underneath it. It lives here and not next
 * to the actions because a "use server" module can only export async functions.
 */
export interface AuthorFormState {
  status: "idle" | "saved" | "error";
  /** Code of `STAFF_ERROR_MESSAGES`, when it failed. */
  errorCode?: string;
  /** Distinguishes one save from the next: two in a row are two states. */
  savedAt?: number;
}

export const AUTHOR_INITIAL_STATE: AuthorFormState = { status: "idle" };

export interface AuthorAdminRow {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  photo?: string;
  courseCount: number;
}
