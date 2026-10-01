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

/** One of the things a course teaches: "Estrategia y juego posicional", "Estrategia" on a tag, and what it covers. */
export interface CourseContentTypeItem {
  code: string;
  label: string;
  shortLabel: string;
  description: string;
}

/**
 * Who a course is aimed at: a level of the fixed catalog, with its
 * orientative Elo range already worded ("800–1199", "2200 o más"). It guides;
 * nothing is ever restricted by it.
 */
export interface CourseLevelItem {
  slug: string;
  name: string;
  description: string;
  eloRange: string;
  /** The range's two ends, for what is computed over them: a scale, a span. */
  eloMin: number;
  /** Null when the level has no ceiling. */
  eloMax: number | null;
}

/** What the button of a course says, by where the student is in it. */
export type CourseCta = "Empezar" | "Continuar" | "Repasar";

export interface CourseSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  /** URL of the cover (Cloudinary), 21:9. The staff fills it in. */
  cover?: string;
  /**
   * The square image, 1:1, which is what a course's row shows. A course
   * without one falls back to its cover, cropped square (`mapCourseSummary`),
   * so a row is never left without a picture.
   */
  thumbnail?: string;
  /** What it teaches, in catalog order; the card shows the short names. */
  contentTypes: CourseContentTypeItem[];
  /** Who it is aimed at, the easiest level first; the list is filtered by their slug. */
  levels: CourseLevelItem[];
  authorNames: string[];
  /**
   * The student added it to their courses. It is the same as having a
   * `CourseProgress` row: a course is added by pressing the button of its
   * information page or by opening one of its lessons.
   */
  isAdded: boolean;
  progress: CourseProgressSummary;
  /** Every lesson the student sees is learned: the course gets its check. */
  isCompleted: boolean;
  /** Lesson the dashboard's button opens according to the student's state. */
  continueHref: string;
  ctaLabel: CourseCta;
  /** The course to study: its chapters, with the student's progress. */
  href: string;
  /** What the course is, for whoever has not added it. */
  infoHref: string;
}

/**
 * A course of the student's, as "Mis cursos" lists it: the summary, and the
 * two things that can be done with it from the list.
 */
export interface MyCourseItem extends CourseSummary {
  /** Where «Aprender» leads; absent only without lessons in view. See `CourseDetail.learnHref`. */
  learnHref?: string;
  /** Exercises of the lessons already learned: what «Repasar» trains. */
  reviewCount: number;
  reviewHref: string;
}

export interface CourseChapterItem {
  id: string;
  order: number;
  /** As the staff wrote it, whole: "Los años de aprendizaje (1957–1959)". */
  name: string;
  description?: string;
  /** Minutes: what its lessons add up to, already summed on the chapter. */
  durationMin?: number;
  /** The staff marked the chapter as priority: the card's «Prioridad». */
  isPriority: boolean;
  /** EVERY lesson of the chapter, whatever the filter says: what the information page counts. */
  lessonCount: number;
  /** The ones the student sees, which with the filter on are not all. */
  totalLessons: number;
  completedLessons: number;
  /** Every lesson the student sees is learned: the chapter gets its check. */
  isCompleted: boolean;
  href: string;
}

export interface CourseAuthorItem {
  name: string;
  roleLabel: string;
}

/** One source of the course's material, as the course page cites it. The staff's notes never come here. */
export interface CourseSourceItem {
  id: string;
  typeLabel: string;
  originalTitle?: string;
  authors?: string;
  url?: string;
  publicationYear?: number;
  edition?: string;
  specificReference?: string;
}

/**
 * A course whole: what its information page says of it and what its study
 * pages need around the chapters. One shape for both, because they are the
 * same course seen before and after adding it.
 */
export interface CourseDetail {
  id: string;
  slug: string;
  name: string;
  description?: string;
  cover?: string;
  /** The square image, 1:1: what the head of the course's pages shows. See `CourseSummary`. */
  thumbnail?: string;
  /** What it teaches, in catalog order; the page shows the long names with their descriptions. */
  contentTypes: CourseContentTypeItem[];
  /** Who it is aimed at, the easiest level first, each with its orientative Elo range. */
  levels: CourseLevelItem[];
  authors: CourseAuthorItem[];
  /** The student added it to their courses; see `CourseSummary.isAdded`. */
  isAdded: boolean;
  progress: CourseProgressSummary;
  /** Every lesson the student sees is learned: the course gets its check. */
  isCompleted: boolean;
  ctaLabel: CourseCta;
  /**
   * Where «Aprender» leads: the lesson they left off at if it is unfinished,
   * the first unfinished one otherwise and, in a finished course, its first
   * lesson — the button starts the course over, it is not switched off.
   * Absent only when no lesson is in view.
   */
  learnHref?: string;
  /** Exercises of the lessons already learned: what «Repasar» trains. */
  reviewCount: number;
  reviewHref: string;
  /** The student asked to see only what the staff marked as priority in this course. */
  onlyPriorityLessons: boolean;
  /** How many that filter hides, so it can be said instead of kept quiet. */
  hiddenLessons: number;
  /** EVERY lesson of the course and their minutes, whatever the filter says. */
  lessonCount: number;
  totalMinutes: number;
  infoHref: string;
  studyHref: string;
  chapters: CourseChapterItem[];
  /** «Procedencia»: where the material comes from, in the staff's order; empty when none was recorded. */
  sources: CourseSourceItem[];
}

export interface ChapterLessonItem {
  id: string;
  order: number;
  name: string;
  description?: string;
  isPriority: boolean;
  estimatedDuration?: number;
  statusCode: ProgressStatusCode;
  /** It is the course's next lesson to learn: the one «Aprender» opens. */
  isNext: boolean;
  /**
   * The moves of the lesson's game, all of them: "1.e4 c5 2.Cf3 …" to the
   * last. Absent for a lesson without moves, which is a diagram and is told
   * by its description.
   */
  moves?: string;
  /** How that game ended: "1-0", "0-1" or "½-½". Absent when it did not, or the PGN does not say. */
  result?: string;
  href: string;
}

/** A neighbour chapter, to go to it from the foot of the list. */
export interface ChapterLink {
  name: string;
  href: string;
}

export interface ChapterView {
  /** The course around the chapter: its name, its progress, its buttons. */
  course: CourseDetail;
  id: string;
  order: number;
  name: string;
  /** Lessons of it the student has finished, the filter notwithstanding: what «Borrar mi progreso del capítulo» would erase. */
  completedLessons: number;
  /**
   * How many the filter hides. It is stated, so the absence does not unsettle.
   * The chapter counts nothing else: the progress of its page is the course's.
   */
  hiddenLessons: number;
  lessons: ChapterLessonItem[];
  previous?: ChapterLink;
  next?: ChapterLink;
}

/**
 * What the column beside a lesson shows: the course, the chapter and its
 * lessons. It is read by the CHAPTER's layout and not by the lesson's page, so
 * moving from one lesson to the next does not fetch it again — and it carries
 * no PGN, which is the weight the lesson's own page goes for.
 */
export interface ChapterOutline {
  courseId: string;
  courseName: string;
  courseHref: string;
  /** The course's square image, for the head of the column. */
  courseThumbnail?: string;
  /** The student asked to see only the priority lines of this course. */
  onlyPriorityLessons: boolean;
  chapterId: string;
  chapterName: string;
  chapterHref: string;
  /**
   * The lessons of the chapter, in reading order and already filtered by the
   * student's preferences — the same list «anterior»/«siguiente» walk, so the
   * column and the buttons never disagree.
   */
  lessons: LessonSibling[];
}

export interface LessonView {
  courseId: string;
  courseName: string;
  chapterId: string;
  /** Order number: it is what addresses the chapter in the URL. */
  chapterOrder: number;
  chapterName: string;
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
  /** Its own page, for a form that has to come back to it. */
  href: string;
  chapterHref: string;
  trainerHref?: string;
}

/** A lesson as the column beside a lesson lists it. */
export type LessonSibling = Pick<ChapterLessonItem, "id" | "name" | "href" | "statusCode">;
