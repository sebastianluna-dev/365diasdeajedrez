import { cache } from "react";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import type { ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import {
  courseContentInclude,
  mapChapterView,
  mapCourseDetail,
  mapCourseSummary,
  mapLessonView,
  type UserCourseState,
} from "./courses.mapper";
import type { ChapterView, CourseDetail, CourseSummary, LessonView } from "./courses.types";

// Catálogo de cursos publicados con toda su estructura. Deduplicado por
// request via cache(): listado, detalle, capítulo y lección lo comparten.
const getPublishedCourses = cache(async () => {
  const db = getPlatformDb();
  return db.course.findMany({
    where: { status: { code: COURSE_STATUS.PUBLISHED } },
    orderBy: { name: "asc" },
    include: courseContentInclude,
  });
});

const getUserProgressState = cache(async (): Promise<Map<string, UserCourseState>> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const [lessonRows, courseRows] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId: user.id },
      select: { lessonId: true, status: { select: { code: true } }, lesson: { select: { chapter: { select: { courseId: true } } } } },
    }),
    db.courseProgress.findMany({
      where: { userId: user.id },
      select: { courseId: true, lastLessonId: true, status: { select: { code: true } } },
    }),
  ]);

  const byCourse = new Map<string, UserCourseState>();
  const stateFor = (courseId: string): UserCourseState => {
    let state = byCourse.get(courseId);
    if (!state) {
      state = { lessonStatus: new Map() };
      byCourse.set(courseId, state);
    }
    return state;
  };

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

const EMPTY_STATE: UserCourseState = { lessonStatus: new Map() };

export async function getUserCourses(): Promise<CourseSummary[]> {
  const [courses, progress] = await Promise.all([getPublishedCourses(), getUserProgressState()]);
  return courses.map((course) => mapCourseSummary(course, progress.get(course.id) ?? EMPTY_STATE));
}

export async function getCourseById(courseId: string): Promise<CourseDetail | null> {
  const [courses, progress] = await Promise.all([getPublishedCourses(), getUserProgressState()]);
  const course = courses.find((candidate) => candidate.id === courseId);
  if (!course) return null;
  return mapCourseDetail(course, progress.get(course.id) ?? EMPTY_STATE);
}

export async function getChapterView(courseId: string, chapterId: string): Promise<ChapterView | null> {
  const db = getPlatformDb();
  const [courses, progress, user] = await Promise.all([getPublishedCourses(), getUserProgressState(), getCurrentUser()]);
  const course = courses.find((candidate) => candidate.id === courseId);
  if (!course) return null;

  const [exerciseCount, trainerRow] = await Promise.all([
    db.trainingExercise.count({ where: { lesson: { chapterId } } }),
    db.userTrainerChapter.findUnique({ where: { userId_chapterId: { userId: user.id, chapterId } } }),
  ]);

  return mapChapterView(course, chapterId, progress.get(course.id) ?? EMPTY_STATE, {
    hasExercises: exerciseCount > 0,
    inTrainer: trainerRow !== null,
  });
}

export async function getLessonView(courseId: string, lessonId: string): Promise<LessonView | null> {
  const db = getPlatformDb();
  const [courses, progress, user] = await Promise.all([getPublishedCourses(), getUserProgressState(), getCurrentUser()]);
  const course = courses.find((candidate) => candidate.id === courseId);
  if (!course) return null;

  const [lesson, settings] = await Promise.all([
    db.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        chapterId: true,
        name: true,
        description: true,
        order: true,
        isPriority: true,
        estimatedDuration: true,
        initialFen: true,
        pgn: true,
        orientation: { select: { code: true } },
        exercises: { select: { id: true } },
      },
    }),
    db.userCourseSettings.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { boardOrientation: { select: { code: true } } },
    }),
  ]);
  if (!lesson) return null;

  return mapLessonView(course, lesson, progress.get(course.id) ?? EMPTY_STATE, settings?.boardOrientation.code);
}
