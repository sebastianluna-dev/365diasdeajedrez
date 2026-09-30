import { staffRoutes } from "@/lib/platform-routes";

export interface StaffTab {
  label: string;
  href: string;
  /** A short fact next to the label: how many games there are, for instance. */
  count?: number;
}

interface CourseTabsOptions {
  courseId: string;
  /** How many chapters the course has, and how many games. */
  chapterCount: number;
  gameCount: number;
}

/**
 * The three pages of a course record. They live here and not in each section
 * because all three draw them: a tab added on one page and forgotten on the
 * other two is a tab that half the record does not have.
 */
export function courseTabs({ courseId, chapterCount, gameCount }: CourseTabsOptions): StaffTab[] {
  return [
    { label: "Curso", href: staffRoutes.courseDetail(courseId) },
    { label: "Temario", href: staffRoutes.courseSyllabus(courseId), count: chapterCount },
    { label: "Partidas", href: staffRoutes.courseGames(courseId), count: gameCount },
  ];
}

interface ChapterTabsOptions {
  courseId: string;
  chapterId: string;
  /** How many lessons the chapter has, and how many games its collection holds. */
  lessonCount: number;
  gameCount: number;
}

/** The three pages of a chapter record, for the same reason as `courseTabs`. */
export function chapterTabs({ courseId, chapterId, lessonCount, gameCount }: ChapterTabsOptions): StaffTab[] {
  return [
    { label: "Capítulo", href: staffRoutes.chapterDetail(courseId, chapterId) },
    { label: "Lecciones", href: staffRoutes.chapterLessons(courseId, chapterId), count: lessonCount },
    { label: "Partidas", href: staffRoutes.chapterGames(courseId, chapterId), count: gameCount },
  ];
}
