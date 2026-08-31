import type {
  AuthorRoleCode,
  CourseStatusCode,
  CourseTypeCode,
  InitialPositionTypeCode,
  PresentationModeCode,
} from "@/constants/platform/course-codes.const";
import type { BoardOrientationCode } from "@/constants/platform/shared-codes.const";
import type { ExerciseModeCode } from "@/constants/platform/training-codes.const";

export interface CourseAdminSummary {
  id: string;
  name: string;
  slug: string;
  statusCode: CourseStatusCode;
  statusLabel: string;
  typeLabel: string;
  chapterCount: number;
  lessonCount: number;
  publishedAtLabel?: string;
  href: string;
}

export interface CourseAuthorRow {
  authorId: string;
  authorName: string;
  roleCode: AuthorRoleCode;
  roleLabel: string;
  order: number;
}

export interface ChapterAdminRow {
  id: string;
  name: string;
  order: number;
  lessonCount: number;
  /** Alumnos con progreso: si hay alguno, el capítulo ya no se borra. */
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
  /** Cumple los requisitos mínimos para publicarse (§22.3 del plan). */
  canPublish: boolean;
}

export interface LessonAdminRow {
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
  /** El PGN de la lección cambió después de congelar este ejercicio. */
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
  estimatedDuration?: number;
  presentationModeCode: PresentationModeCode;
  initialPositionTypeCode: InitialPositionTypeCode;
  initialFen?: string;
  orientationCode: BoardOrientationCode;
  pgn: string;
  pgnUpdatedAtLabel?: string;
  topicIds: number[];
  exercises: ExerciseAdminRow[];
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
