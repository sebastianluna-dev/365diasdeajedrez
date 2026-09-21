import { BOARD_ORIENTATION, PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { sortByRole } from "@/services/shared/content-order";
import { lessonPgnOf } from "@/services/shared/lesson-pgn";
import type {
  ChapterLessonItem,
  ChapterView,
  CourseChapterItem,
  CourseDetail,
  CourseProgressSummary,
  CourseSummary,
  LessonView,
} from "./courses.types";

// Includes shared between service and mapper: the mapper owns the shape it
// needs and the service only queries it.
export const courseContentInclude = {
  type: true,
  courseLevels: { include: { level: true }, orderBy: { level: { order: "asc" } } },
  courseAuthors: { include: { author: true, role: true }, orderBy: { order: "asc" } },
  chapters: {
    orderBy: { order: "asc" },
    include: {
      role: { select: { code: true, label: true } },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          chapterId: true,
          name: true,
          description: true,
          order: true,
          isPriority: true,
          estimatedDuration: true,
          role: { select: { code: true, label: true } },
        },
      },
    },
  },
} satisfies Prisma.CourseInclude;

export type CourseWithContent = Prisma.CourseGetPayload<{ include: typeof courseContentInclude }>;

export interface UserCourseState {
  /** statusCode of LessonProgress by lessonId. */
  lessonStatus: Map<string, ProgressStatusCode>;
  courseStatus?: ProgressStatusCode;
  lastLessonId?: string;
  /** The student asked to see only this course's essential lessons. */
  onlyPriorityLessons: boolean;
  /** Orientation the student fixed; `AUTO` or absent = the lesson's rules. */
  boardOrientationCode?: string;
}

function asStatus(code: string | undefined): ProgressStatusCode {
  return (code as ProgressStatusCode | undefined) ?? PROGRESS_STATUS.NOT_STARTED;
}

/**
 * Whether the lesson is part of the path the student asked to see.
 *
 * With the filter on, the priority ones **and the ones already touched** pass.
 * That second half is what avoids the filter's worst effect: without it,
 * enabling it would hide already completed lessons and the done counter would
 * GO DOWN. With it, the percentage never goes backwards and "I already did it"
 * never becomes "where is it?".
 */
function isVisible(lesson: { id: string; isPriority: boolean }, state: UserCourseState): boolean {
  return !state.onlyPriorityLessons || lesson.isPriority || state.lessonStatus.has(lesson.id);
}

/**
 * Every lesson of the course in the order they are read, unfiltered.
 *
 * Within each chapter, and between chapters, the introduction and the closing
 * — which are fixed — rule over the order number. It is the SAME function the
 * staff panel uses, so author and student see the same sequence.
 */
function allLessons(course: CourseWithContent) {
  return sortByRole(course.chapters.map((chapter) => ({ ...chapter, roleCode: chapter.role?.code }))).flatMap(
    (chapter, chapterIndex) =>
      sortByRole(chapter.lessons.map((lesson) => ({ ...lesson, roleCode: lesson.role?.code }))).map((lesson) => ({
        ...lesson,
        chapterId: chapter.id,
        chapterOrder: chapterIndex + 1,
      })),
  );
}

/** The ones the student sees, which are what is counted and navigated over. */
function flattenLessons(course: CourseWithContent, state: UserCourseState) {
  return allLessons(course).filter((lesson) => isVisible(lesson, state));
}

export function mapCourseProgress(course: CourseWithContent, state: UserCourseState): CourseProgressSummary {
  const lessons = flattenLessons(course, state);
  const completedLessons = lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  const totalLessons = lessons.length;

  const minutesOf = (list: typeof lessons) =>
    list.reduce((total, lesson) => total + (lesson.estimatedDuration ?? 0), 0);
  const completedMinutes = minutesOf(
    lessons.filter((lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED),
  );
  const totalMinutes = minutesOf(lessons);

  return {
    statusCode: asStatus(state.courseStatus),
    completedLessons,
    totalLessons,
    percent: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    completedMinutes,
    totalMinutes,
    minutesPercent: totalMinutes === 0 ? 0 : Math.round((completedMinutes / totalMinutes) * 100),
  };
}

/**
 * Where the course carries on.
 *
 * Where they left off, IF it is still in view; if the filter hid it, the first
 * visible unfinished one; and if they are all done, the first, which is what
 * comes next for review. With none visible, the course page.
 */
function continueTarget(course: CourseWithContent, state: UserCourseState) {
  const lessons = flattenLessons(course, state);
  const last = lessons.find((lesson) => lesson.id === state.lastLessonId);
  const pending = lessons.find((lesson) => state.lessonStatus.get(lesson.id) !== PROGRESS_STATUS.COMPLETED);
  const target = last ?? pending ?? lessons[0];
  return target ? platformRoutes.lessonDetail(target.id) : platformRoutes.courseDetail(course.id);
}

/**
 * What the course's button says.
 *
 * It is decided with the VISIBLE count, not with the stored state: if the
 * student filtered and has already done every priority lesson, the bar is at
 * 100 % and a "Continuar" there would make no sense, even though
 * `CourseProgress` is still in progress — and it is still in progress on
 * purpose: the filter is a lens, not a change in what the course is.
 */
function ctaLabelFor(progress: CourseProgressSummary): CourseSummary["ctaLabel"] {
  if (progress.totalLessons > 0 && progress.completedLessons === progress.totalLessons) return "Revisar";
  if (progress.completedLessons > 0 || progress.statusCode === PROGRESS_STATUS.IN_PROGRESS) return "Continuar";
  return "Comenzar";
}

export function mapCourseSummary(course: CourseWithContent, state: UserCourseState): CourseSummary {
  const progress = mapCourseProgress(course, state);
  return {
    id: course.id,
    name: course.name,
    slug: course.slug,
    description: course.description ?? undefined,
    cover: course.cover ?? undefined,
    typeLabel: course.type.label,
    levelLabels: course.courseLevels.map((courseLevel) => courseLevel.level.label),
    authorNames: course.courseAuthors.map((courseAuthor) => courseAuthor.author.name),
    progress,
    continueHref: continueTarget(course, state),
    ctaLabel: ctaLabelFor(progress),
    href: platformRoutes.courseDetail(course.id),
  };
}

function mapChapterItem(
  course: CourseWithContent,
  chapter: CourseWithContent["chapters"][number],
  state: UserCourseState,
): CourseChapterItem {
  // Over the visible ones: the chapter's bar has to match the list that opens
  // when it is pressed.
  const lessons = chapter.lessons.filter((lesson) => isVisible(lesson, state));
  const completedLessons = lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  return {
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    description: chapter.description ?? undefined,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    totalLessons: lessons.length,
    completedLessons,
    href: platformRoutes.chapterDetail(course.id, chapter.order),
  };
}

export function mapCourseDetail(course: CourseWithContent, state: UserCourseState): CourseDetail {
  const progress = mapCourseProgress(course, state);
  return {
    id: course.id,
    name: course.name,
    description: course.description ?? undefined,
    cover: course.cover ?? undefined,
    typeLabel: course.type.label,
    levelLabels: course.courseLevels.map((courseLevel) => courseLevel.level.label),
    authors: course.courseAuthors.map((courseAuthor) => ({
      name: courseAuthor.author.name,
      roleLabel: courseAuthor.role.label,
    })),
    progress,
    continueHref: continueTarget(course, state),
    ctaLabel: ctaLabelFor(progress),
    onlyPriorityLessons: state.onlyPriorityLessons,
    hiddenLessons: allLessons(course).length - progress.totalLessons,
    chapters: sortByRole(course.chapters.map((chapter) => ({ ...chapter, roleCode: chapter.role?.code }))).map(
      (chapter) => mapChapterItem(course, chapter, state),
    ),
  };
}

export function mapChapterView(
  course: CourseWithContent,
  chapterId: string,
  state: UserCourseState,
  options: { hasExercises: boolean; inTrainer: boolean },
): ChapterView | null {
  const chapter = course.chapters.find((candidate) => candidate.id === chapterId);
  if (!chapter) return null;

  // The number rendered is still the REAL one (1, 4, 7 with the filter on):
  // renumbering would hide that lessons are missing and would break each one's
  // identity within the course.
  const lessons: ChapterLessonItem[] = sortByRole(
    chapter.lessons.map((lesson) => ({ ...lesson, roleCode: lesson.role?.code })),
  )
    .filter((lesson) => isVisible(lesson, state))
    .map((lesson) => ({
      id: lesson.id,
      order: lesson.order,
      name: lesson.name,
      description: lesson.description ?? undefined,
      isPriority: lesson.isPriority,
      estimatedDuration: lesson.estimatedDuration ?? undefined,
      statusCode: asStatus(state.lessonStatus.get(lesson.id)),
      href: platformRoutes.lessonDetail(lesson.id),
    }));

  const hiddenLessons = chapter.lessons.length - lessons.length;
  const completedLessons = lessons.filter((lesson) => lesson.statusCode === PROGRESS_STATUS.COMPLETED).length;

  // The chapter's button opens where they left off: the first uncompleted one.
  // If they are all done, the first, which is what comes next for review.
  const target = lessons.find((lesson) => lesson.statusCode !== PROGRESS_STATUS.COMPLETED) ?? lessons[0];
  const allDone = lessons.length > 0 && completedLessons === lessons.length;
  const untouched = lessons.every((lesson) => lesson.statusCode === PROGRESS_STATUS.NOT_STARTED);

  return {
    courseId: course.id,
    courseName: course.name,
    courseHref: platformRoutes.courseDetail(course.id),
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    description: chapter.description ?? undefined,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    completedLessons,
    totalLessons: lessons.length,
    hiddenLessons,
    onlyPriorityLessons: state.onlyPriorityLessons,
    lessons,
    continueHref: target ? target.href : platformRoutes.courseDetail(course.id),
    ctaLabel: allDone ? "Revisar" : untouched ? "Comenzar" : "Continuar",
    hasExercises: options.hasExercises,
    inTrainer: options.inTrainer,
  };
}

export interface LessonRowForView {
  id: string;
  chapterId: string;
  name: string;
  description: string | null;
  order: number;
  isPriority: boolean;
  estimatedDuration: number | null;
  pgn: string;
  /** The game of the course collection, if the lesson references it. */
  game: { pgn: string } | null;
  orientation: { code: string };
  exercises: { id: string }[];
}

export function mapLessonView(
  course: CourseWithContent,
  lesson: LessonRowForView,
  state: UserCourseState,
): LessonView | null {
  const chapter = course.chapters.find((candidate) => candidate.id === lesson.chapterId);
  if (!chapter) return null;

  // Previous and next are looked up BY POSITION, not by membership: a lesson
  // hidden by the filter is still served by URL — a link from a class cannot
  // break over a display preference — and there, looking for it in the visible
  // list would give -1, leaving it without a previous AND without a next.
  const position = (candidate: { chapterOrder: number; order: number }) =>
    candidate.chapterOrder * 100000 + candidate.order;
  const here = position({ chapterOrder: chapter.order, order: lesson.order });

  const visible = flattenLessons(course, state);
  const prev = [...visible].reverse().find((candidate) => position(candidate) < here);
  const next = visible.find((candidate) => position(candidate) > here);

  // The content's orientation rules unless the user forces one in their course
  // settings (AUTO or the absence of a row = the lesson's).
  const settingsOrientationCode = state.boardOrientationCode;
  const forced =
    settingsOrientationCode && settingsOrientationCode !== BOARD_ORIENTATION.AUTO ? settingsOrientationCode : undefined;
  const effective = forced ?? lesson.orientation.code;

  return {
    courseId: course.id,
    courseName: course.name,
    chapterId: chapter.id,
    chapterOrder: chapter.order,
    chapterName: chapter.name,
    chapterLessonCount: chapter.lessons.length,
    id: lesson.id,
    order: lesson.order,
    name: lesson.name,
    description: lesson.description ?? undefined,
    isPriority: lesson.isPriority,
    estimatedDuration: lesson.estimatedDuration ?? undefined,
    pgn: lessonPgnOf(lesson),
    orientation: effective === BOARD_ORIENTATION.BLACK ? "black" : "white",
    statusCode: asStatus(state.lessonStatus.get(lesson.id)),
    exerciseCount: lesson.exercises.length,
    prevLessonHref: prev ? platformRoutes.lessonDetail(prev.id) : undefined,
    nextLessonHref: next ? platformRoutes.lessonDetail(next.id) : undefined,
    chapterHref: platformRoutes.chapterDetail(course.id, chapter.order),
    trainerHref: lesson.exercises.length > 0 ? `${platformRoutes.trainer}?lesson=${lesson.id}` : undefined,
  };
}
