import { cache } from "react";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { lessonPgnSelect } from "@/services/shared/lesson-pgn";
import {
  courseContentInclude,
  mapChapterView,
  mapCourseDetail,
  mapCourseSummary,
  mapLessonView,
  type UserCourseState,
} from "./courses.mapper";
import type { ChapterView, CourseDetail, CourseSummary, LessonView } from "./courses.types";

// Full listing: only the "Mis cursos" page uses it, and it needs them all.
const getPublishedCourses = cache(async () => {
  const db = getPlatformDb();
  return db.course.findMany({
    where: { status: { code: COURSE_STATUS.PUBLISHED } },
    orderBy: { name: "asc" },
    include: courseContentInclude,
  });
});

// Targeted query for the single-course views (detail, chapter and lesson):
// cache() deduplicates by slug within the same request.
const getPublishedCourse = cache(async (courseId: string) => {
  const db = getPlatformDb();
  return db.course.findFirst({
    where: { id: courseId, status: { code: COURSE_STATUS.PUBLISHED } },
    include: courseContentInclude,
  });
});

/** The user's progress narrowed to one course, for the detail views. */
const getCourseProgressState = cache(async (courseId: string): Promise<UserCourseState> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const [lessonRows, courseRow, settings] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId: user.id, lesson: { chapter: { courseId } } },
      select: { lessonId: true, status: { select: { code: true } } },
    }),
    db.courseProgress.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { lastLessonId: true, status: { select: { code: true } } },
    }),
    // The course settings go into the STATE and are not queried separately: they
    // are "what this student has in this course", just like their progress, and
    // that way there is a single place that reads them.
    db.userCourseSettings.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { onlyPriorityLessons: true, boardOrientation: { select: { code: true } } },
    }),
  ]);

  return {
    lessonStatus: new Map(lessonRows.map((row) => [row.lessonId, row.status.code as ProgressStatusCode])),
    courseStatus: courseRow?.status.code as ProgressStatusCode | undefined,
    lastLessonId: courseRow?.lastLessonId ?? undefined,
    onlyPriorityLessons: settings?.onlyPriorityLessons ?? false,
    boardOrientationCode: settings?.boardOrientation.code,
  };
});

const getUserProgressState = cache(async (): Promise<Map<string, UserCourseState>> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const [lessonRows, courseRows, settingsRows] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId: user.id },
      select: {
        lessonId: true,
        status: { select: { code: true } },
        lesson: { select: { chapter: { select: { courseId: true } } } },
      },
    }),
    db.courseProgress.findMany({
      where: { userId: user.id },
      select: { courseId: true, lastLessonId: true, status: { select: { code: true } } },
    }),
    db.userCourseSettings.findMany({
      where: { userId: user.id },
      select: { courseId: true, onlyPriorityLessons: true, boardOrientation: { select: { code: true } } },
    }),
  ]);

  const byCourse = new Map<string, UserCourseState>();
  const stateFor = (courseId: string): UserCourseState => {
    let state = byCourse.get(courseId);
    if (!state) {
      state = { lessonStatus: new Map(), onlyPriorityLessons: false };
      byCourse.set(courseId, state);
    }
    return state;
  };

  for (const row of settingsRows) {
    const state = stateFor(row.courseId);
    state.onlyPriorityLessons = row.onlyPriorityLessons;
    state.boardOrientationCode = row.boardOrientation.code;
  }
  for (const row of courseRows) {
    const state = stateFor(row.courseId);
    state.courseStatus = row.status.code as ProgressStatusCode;
    state.lastLessonId = row.lastLessonId ?? undefined;
  }
  for (const row of lessonRows) {
    stateFor(row.lesson.chapter.courseId).lessonStatus.set(row.lessonId, row.status.code as ProgressStatusCode);
  }
  return byCourse;
});

const EMPTY_STATE: UserCourseState = { lessonStatus: new Map(), onlyPriorityLessons: false };

export async function getUserCourses(): Promise<CourseSummary[]> {
  const [courses, progress] = await Promise.all([getPublishedCourses(), getUserProgressState()]);
  return courses.map((course) => mapCourseSummary(course, progress.get(course.id) ?? EMPTY_STATE));
}

/**
 * The "Continuar estudiando" course of the dashboard: the first one in
 * progress, by name, which is the same order as "Mis cursos". It is located
 * with a query targeted at the progress and then ONLY that course is loaded,
 * instead of bringing the whole catalog with chapters and lessons to keep one.
 */
export async function getContinueStudyingCourse(): Promise<(CourseSummary & { lastLessonName?: string }) | null> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const row = await db.courseProgress.findFirst({
    where: {
      userId: user.id,
      status: { code: PROGRESS_STATUS.IN_PROGRESS },
      course: { status: { code: COURSE_STATUS.PUBLISHED } },
    },
    orderBy: { course: { name: "asc" } },
    select: { courseId: true, lastLesson: { select: { name: true } } },
  });
  if (!row) return null;

  const [course, progress] = await Promise.all([
    getPublishedCourse(row.courseId),
    getCourseProgressState(row.courseId),
  ]);
  if (!course) return null;
  return { ...mapCourseSummary(course, progress), lastLessonName: row.lastLesson?.name };
}

export async function getCourseById(courseId: string): Promise<CourseDetail | null> {
  const [course, progress] = await Promise.all([getPublishedCourse(courseId), getCourseProgressState(courseId)]);
  if (!course) return null;
  return mapCourseDetail(course, progress);
}

export async function getChapterView(courseId: string, chapterOrder: number): Promise<ChapterView | null> {
  const db = getPlatformDb();
  const [course, progress, user] = await Promise.all([
    getPublishedCourse(courseId),
    getCourseProgressState(courseId),
    getCurrentUser(),
  ]);
  if (!course) return null;

  // The chapter comes from the already loaded course: the include brings all of
  // its chapters, so resolving its order number does not cost one more query.
  const chapterId = course.chapters.find((chapter) => chapter.order === chapterOrder)?.id;
  if (!chapterId) return null;

  const [exerciseCount, trainerRow] = await Promise.all([
    db.trainingExercise.count({ where: { lesson: { chapterId } } }),
    db.userTrainerChapter.findUnique({ where: { userId_chapterId: { userId: user.id, chapterId } } }),
  ]);

  return mapChapterView(course, chapterId, progress, {
    hasExercises: exerciseCount > 0,
    inTrainer: trainerRow !== null,
  });
}

/**
 * The lesson addresses itself (`/lecciones/02482009`), so the course does not
 * arrive through the URL: it is deduced from the lesson itself.
 *
 * That forces two round trips instead of one — first the lesson, then its
 * course — but it is the price of a link to a lesson not having to drag course
 * and chapter along. If the course is not published, the lesson is not served
 * either.
 */
export async function getLessonView(lessonId: string): Promise<LessonView | null> {
  const db = getPlatformDb();
  // Session border: the lesson is looked up by its bare id, so who is asking has
  // to be known BEFORE querying it. The student's settings are no longer read
  // here — they travel inside the course's state — but the border stays.
  await getCurrentUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      chapterId: true,
      name: true,
      description: true,
      order: true,
      isPriority: true,
      estimatedDuration: true,
      ...lessonPgnSelect,
      orientation: { select: { code: true } },
      exercises: { select: { id: true } },
      chapter: { select: { courseId: true } },
    },
  });
  if (!lesson) return null;

  const courseId = lesson.chapter.courseId;
  // The settings already come inside the state; before they were queried separately here.
  const [course, progress] = await Promise.all([getPublishedCourse(courseId), getCourseProgressState(courseId)]);
  if (!course) return null;

  return mapLessonView(course, lesson, progress);
}
