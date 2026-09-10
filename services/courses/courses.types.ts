import type { ProgressStatusCode } from "@/constants/platform/shared-codes.const";

export interface CourseProgressSummary {
  statusCode: ProgressStatusCode;
  completedLessons: number;
  totalLessons: number;
  /** Whole percentage 0–100 over the real total of lessons. */
  percent: number;
  /**
   * Minutes of the finished lessons and of the whole course. It is ANOTHER
   * measure of progress, not the same one in another unit: two five-minute
   * lessons are not worth what two forty-minute ones are, and the student who
   * studies in snatches measures their day in minutes, not in lessons.
   *
   * `estimatedDuration` is nullable, so lessons without a duration count as zero
   * on both sides and the percentage is still true.
   */
  completedMinutes: number;
  totalMinutes: number;
  /** Whole percentage 0–100 over the minutes. */
  minutesPercent: number;
}

export interface CourseSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  /** URL of the cover (Cloudinary). The staff fills it in; today none has one. */
  cover?: string;
  typeLabel: string;
  levelLabels: string[];
  authorNames: string[];
  progress: CourseProgressSummary;
  /** Lesson the CTA opens according to the student's state. */
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
  cover?: string;
  typeLabel: string;
  levelLabels: string[];
  authors: CourseAuthorItem[];
  progress: CourseProgressSummary;
  continueHref: string;
  ctaLabel: "Comenzar" | "Continuar" | "Revisar";
  /** The student asked to see only the essential ones of this course. */
  onlyPriorityLessons: boolean;
  /** How many that filter hides, so it can be said instead of kept quiet. */
  hiddenLessons: number;
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
  /** Of the VISIBLE ones; with the filter on it is not the chapter's total. */
  totalLessons: number;
  /** How many the filter hides. It is stated, so the absence does not unsettle. */
  hiddenLessons: number;
  onlyPriorityLessons: boolean;
  lessons: ChapterLessonItem[];
  /** First uncompleted lesson of the chapter; the first one if they are all done. */
  continueHref: string;
  ctaLabel: CourseSummary["ctaLabel"];
  /** true if some lesson of the chapter has trainable exercises. */
  hasExercises: boolean;
  /** true if the user has already added it to the Move Trainer. */
  inTrainer: boolean;
}

export interface LessonView {
  courseId: string;
  courseName: string;
  chapterId: string;
  /** Order number: it is what addresses the chapter in the URL. */
  chapterOrder: number;
  chapterName: string;
  /** Lessons of the chapter, to place this one within it ("Lección 1 de 3"). */
  chapterLessonCount: number;
  id: string;
  order: number;
  name: string;
  description?: string;
  isPriority: boolean;
  estimatedDuration?: number;
  pgn: string;
  /** Effective orientation: the lesson's, unless the user forces one in their settings. */
  orientation: "white" | "black";
  statusCode: ProgressStatusCode;
  exerciseCount: number;
  prevLessonHref?: string;
  nextLessonHref?: string;
  chapterHref: string;
  trainerHref?: string;
}
