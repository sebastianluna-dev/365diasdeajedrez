import { cache } from "react";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import type { ProgressStatusCode } from "@/constants/platform/shared-codes.const";
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
const getPublishedCourse = cache(async (courseId: string) => {
  const db = getPlatformDb();
  return db.course.findFirst({
    where: { id: courseId, status: { code: COURSE_STATUS.PUBLISHED } },
    include: courseContentInclude,
  });
});

/** Progreso del usuario acotado a un curso, para las vistas de detalle. */
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
    // Los ajustes del curso entran en el ESTADO y no se consultan aparte: son
    // «lo que este alumno tiene en este curso», igual que su progreso, y así
    // hay un solo sitio que los lee.
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
      select: { lessonId: true, status: { select: { code: true } }, lesson: { select: { chapter: { select: { courseId: true } } } } },
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

export async function getCourseById(courseId: string): Promise<CourseDetail | null> {
  const [course, progress] = await Promise.all([
    getPublishedCourse(courseId),
    getCourseProgressState(courseId),
  ]);
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

  // El capítulo sale del curso ya cargado: el include trae todos sus capítulos,
  // así que resolver su número de orden no cuesta una consulta más.
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
 * La lección se direcciona sola (`/lecciones/02482009`), así que el curso no
 * llega por la URL: se deduce de la propia lección.
 *
 * Eso obliga a dos viajes en vez de uno —primero la lección, después su curso—
 * pero es el precio de que el enlace a una lección no tenga que arrastrar curso
 * y capítulo. Si el curso no está publicado, la lección tampoco se sirve.
 */
export async function getLessonView(lessonId: string): Promise<LessonView | null> {
  const db = getPlatformDb();
  // Frontera de sesión: la lección se busca por su id suelto, así que hay que
  // saber quién pregunta ANTES de consultarla. Los ajustes del alumno ya no se
  // leen aquí —viajan dentro del estado del curso—, pero la frontera se queda.
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
  // Los ajustes ya vienen dentro del estado; antes se consultaban aparte aquí.
  const [course, progress] = await Promise.all([
    getPublishedCourse(courseId),
    getCourseProgressState(courseId),
  ]);
  if (!course) return null;

  return mapLessonView(course, lesson, progress);
}
