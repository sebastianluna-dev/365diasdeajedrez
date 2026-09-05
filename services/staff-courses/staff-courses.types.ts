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
  /** URL de la portada; la fila enseña un recorte pequeño para reconocerlo. */
  cover?: string;
  statusCode: CourseStatusCode;
  statusLabel: string;
  typeLabel: string;
  chapterCount: number;
  lessonCount: number;
  publishedAtLabel?: string;
  href: string;
}

/** Lo que se busca y por qué estado se filtra en la lista de cursos. */
export interface CourseAdminFilter {
  /** Texto libre: casa contra el nombre y el identificador. */
  query?: string;
  /** Code de CourseStatus; ausente = todos. */
  status?: string;
}

/** La lista con lo que hace falta para pintar su cabecera. */
export interface CourseAdminList {
  courses: CourseAdminSummary[];
  /** Totales de lo que se está viendo, no del catálogo entero. */
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
  /** La lección puede entrenarse de memoria (su línea principal). */
  isTrainable: boolean;
  /** Bando que juega el alumno. Ausente = el que mueva primero. */
  trainingColorCode?: string;
  estimatedDuration?: number;
  presentationModeCode: PresentationModeCode;
  initialPositionTypeCode: InitialPositionTypeCode;
  initialFen?: string;
  orientationCode: BoardOrientationCode;
  /** El contenido que ve el alumno: el de la partida vinculada, o el propio. */
  pgn: string;
  pgnUpdatedAtLabel?: string;
  /** La partida de la colección del curso de la que sale el contenido. */
  game?: CourseGameRow;
  /**
   * Si se puede borrar: curso en borrador y sin progreso de ningún alumno. Es
   * la misma condición que aplica el servidor, para no ofrecer un botón que
   * después rebota.
   */
  canDelete: boolean;
  topicIds: number[];
  exercises: ExerciseAdminRow[];
}

/** Una partida de la colección de un curso, para vincularla a una lección. */
export interface CourseGameRow {
  id: string;
  /** «Kotov — Plater». */
  title: string;
  /** Evento, año y apertura en una línea; vacío si no hay ninguno de los tres. */
  detail: string;
  /** Jugadas de la línea principal, para saber si la partida está entera. */
  moveCount: number;
  /** Cuántas lecciones la usan; borrarla las dejaría sin contenido. */
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
