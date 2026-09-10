import type {
  AuthorRoleCode,
  CourseStatusCode,
  CourseTypeCode,
} from "@/constants/platform/course-codes.const";
import type { BoardOrientationCode } from "@/constants/platform/shared-codes.const";
import type { ExerciseModeCode } from "@/constants/platform/training-codes.const";

export interface CourseAdminSummary {
  id: string;
  name: string;
  slug: string;
  /** URL of the cover; the row shows a small crop to recognise it. */
  cover?: string;
  statusCode: CourseStatusCode;
  statusLabel: string;
  typeLabel: string;
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
  lessonCount: number;
  /** Students with progress: if there is any, the chapter is no longer deleted. */
  progressCount: number;
  href: string;
}

export interface CourseAdminDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cover?: string;
  typeCode: CourseTypeCode;
  statusCode: CourseStatusCode;
  statusLabel: string;
  publishedAtLabel?: string;
  levelCodes: string[];
  authors: CourseAuthorRow[];
  chapters: ChapterAdminRow[];
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
  estimatedDuration?: number;
  lessons: LessonAdminRow[];
}

export interface ExerciseAdminRow {
  id: string;
  order: number;
  modeCode: ExerciseModeCode;
  modeLabel: string;
  promptText?: string;
  line: string;
  startPly: number;
  endPly: number;
  /** The lesson's PGN changed after this exercise was frozen. */
  isStale: boolean;
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
  pgnUpdatedAtLabel?: string;
  /** The game of the course collection the content comes from. */
  game?: CourseGameRow;
  /**
   * Whether it can be deleted: a draft course and without progress from any
   * student. It is the same condition the server applies, so as not to offer a
   * button that bounces afterwards.
   */
  canDelete: boolean;
  topicIds: number[];
  exercises: ExerciseAdminRow[];
}

/** A game of a chapter's collection, to link it to a lesson. */
export interface CourseGameRow {
  id: string;
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

export interface CatalogOption {
  code: string;
  label: string;
}

export interface TopicOption {
  id: number;
  code: string;
  label: string;
}

export interface AuthorAdminRow {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  photo?: string;
  courseCount: number;
}
