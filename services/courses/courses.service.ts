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

// Listado completo: sólo lo usa la página de «Mis cursos», que necesita todos.
const getPublishedCourses = cache(async () => {
  const db = getPlatformDb();
  return db.course.findMany({
    where: { status: { code: COURSE_STATUS.PUBLISHED } },
    orderBy: { name: "asc" },
    include: courseContentInclude,
  });
});

// Consulta dirigida para las vistas de un solo curso (detalle, capítulo y
// lección): cache() deduplica por slug dentro del mismo request.
const getPublishedCourse = cache(async (courseSlug: string) => {
  const db = getPlatformDb();
  return db.course.findFirst({
    where: { slug: courseSlug, status: { code: COURSE_STATUS.PUBLISHED } },
    include: courseContentInclude,
  });
});

/**
 * Progreso del usuario acotado a un curso, para las vistas de detalle.
 *
 * Filtra por SLUG y no por id para poder pedirse en paralelo con el curso: si
 * necesitara el id habría que resolver el curso antes, y sería un viaje de más
 * en cada una de las tres páginas.
 */
const getCourseProgressState = cache(async (courseSlug: string): Promise<UserCourseState> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const [lessonRows, courseRow] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId: user.id, lesson: { chapter: { course: { slug: courseSlug } } } },
      select: { lessonId: true, status: { select: { code: true } } },
    }),
    db.courseProgress.findFirst({
      where: { userId: user.id, course: { slug: courseSlug } },
      select: { lastLessonId: true, status: { select: { code: true } } },
    }),
  ]);

  return {
    lessonStatus: new Map(lessonRows.map((row) => [row.lessonId, row.status.code as ProgressStatusCode])),
    courseStatus: courseRow?.status.code as ProgressStatusCode | undefined,
    lastLessonId: courseRow?.lastLessonId ?? undefined,
  };
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

export async function getCourseBySlug(courseSlug: string): Promise<CourseDetail | null> {
  const [course, progress] = await Promise.all([
    getPublishedCourse(courseSlug),
    getCourseProgressState(courseSlug),
  ]);
  if (!course) return null;
  return mapCourseDetail(course, progress);
}

export async function getChapterView(courseSlug: string, chapterSlug: string): Promise<ChapterView | null> {
  const db = getPlatformDb();
  const [course, progress, user] = await Promise.all([
    getPublishedCourse(courseSlug),
    getCourseProgressState(courseSlug),
    getCurrentUser(),
  ]);
  if (!course) return null;

  // El capítulo sale del curso ya cargado: el include trae todos sus capítulos,
  // así que resolver el slug no cuesta una consulta más.
  const chapterId = course.chapters.find((chapter) => chapter.slug === chapterSlug)?.id;
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

export async function getLessonView(courseSlug: string, lessonId: string): Promise<LessonView | null> {
  const db = getPlatformDb();
  const [course, progress, user] = await Promise.all([
    getPublishedCourse(courseSlug),
    getCourseProgressState(courseSlug),
    getCurrentUser(),
  ]);
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
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: { boardOrientation: { select: { code: true } } },
    }),
  ]);
  if (!lesson) return null;

  return mapLessonView(course, lesson, progress, settings?.boardOrientation.code);
}
