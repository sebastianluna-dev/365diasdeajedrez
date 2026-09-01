import type { ProgressStatusCode } from "@/constants/platform/shared-codes.const";

export interface CourseProgressSummary {
  statusCode: ProgressStatusCode;
  completedLessons: number;
  totalLessons: number;
  /** Porcentaje entero 0–100 sobre el total real de lecciones. */
  percent: number;
}

export interface CourseSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  typeLabel: string;
  levelLabels: string[];
  authorNames: string[];
  progress: CourseProgressSummary;
  /** Lección que abre el CTA según el estado del alumno. */
  continueHref: string;
  ctaLabel: "Comenzar" | "Continuar" | "Revisar";
  href: string;
}

export interface CourseChapterItem {
  id: string;
  order: number;
  name: string;
  description?: string;
  estimatedDuration?: number;
  totalLessons: number;
  completedLessons: number;
  href: string;
}

export interface CourseAuthorItem {
  name: string;
  roleLabel: string;
}

export interface CourseDetail {
  id: string;
  name: string;
  description?: string;
  typeLabel: string;
  levelLabels: string[];
  authors: CourseAuthorItem[];
  progress: CourseProgressSummary;
  continueHref: string;
  ctaLabel: "Comenzar" | "Continuar" | "Revisar";
  chapters: CourseChapterItem[];
}

export interface ChapterLessonItem {
  id: string;
  order: number;
  name: string;
  description?: string;
  isPriority: boolean;
  estimatedDuration?: number;
  statusCode: ProgressStatusCode;
  href: string;
}

export interface ChapterView {
  courseId: string;
  courseName: string;
  courseHref: string;
  id: string;
  order: number;
  name: string;
  description?: string;
  estimatedDuration?: number;
  completedLessons: number;
  totalLessons: number;
  lessons: ChapterLessonItem[];
  /** true si alguna lección del capítulo tiene ejercicios entrenables. */
  hasExercises: boolean;
  /** true si el usuario ya lo agregó al Move Trainer. */
  inTrainer: boolean;
}

export interface LessonView {
  courseId: string;
  courseName: string;
  chapterId: string;
  /** Número de orden: es lo que direcciona al capítulo en la URL. */
  chapterOrder: number;
  chapterName: string;
  id: string;
  order: number;
  name: string;
  description?: string;
  isPriority: boolean;
  estimatedDuration?: number;
  /** FEN inicial de la lección; null cuando parte de la posición inicial. */
  initialFen: string | null;
  pgn: string;
  /** Orientación efectiva: la de la lección, salvo que el usuario la fuerce en sus ajustes. */
  orientation: "white" | "black";
  statusCode: ProgressStatusCode;
  exerciseCount: number;
  prevLessonHref?: string;
  nextLessonHref?: string;
  chapterHref: string;
  trainerHref?: string;
}
