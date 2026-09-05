"use server";

import { revalidatePath } from "next/cache";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { BOARD_ORIENTATION, PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { recordUserActivity } from "@/services/shared/user-activity.service";

// Las server actions son alcanzables por POST directo: el usuario SIEMPRE se
// resuelve aquí dentro (DAL) y jamás llega del cliente.

async function getLessonContext(lessonId: string) {
  const db = getPlatformDb();
  return db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      chapterId: true,
      // El orden y el curso son para revalidar las rutas del alumno.
      chapter: { select: { courseId: true, order: true } },
      lessonTopics: { select: { topicId: true }, take: 1 },
    },
  });
}

function revalidateLessonPaths(courseId: string, chapterOrder: number, lessonId: string) {
  revalidatePath(platformRoutes.dashboard);
  revalidatePath(platformRoutes.courses);
  revalidatePath(platformRoutes.courseDetail(courseId));
  revalidatePath(platformRoutes.chapterDetail(courseId, chapterOrder));
  revalidatePath(platformRoutes.lessonDetail(lessonId));
}

/**
 * Marca la lección como abierta: LessonProgress pasa a IN_PROGRESS y el curso
 * actualiza su punto de retorno (lastLessonId). Idempotente; nunca degrada un
 * estado COMPLETED.
 */
export async function touchLesson(lessonId: string): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:touch-lesson`, 120, 60_000))) return;

  const lesson = await getLessonContext(lessonId);
  if (!lesson) return;

  const now = new Date();
  const courseId = lesson.chapter.courseId;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {},
    create: {
      user: { connect: { id: user.id } },
      lesson: { connect: { id: lessonId } },
      status: { connect: { code: PROGRESS_STATUS.IN_PROGRESS } },
      startedAt: now,
    },
  });

  const chapterProgress = await db.chapterProgress.findUnique({
    where: { userId_chapterId: { userId: user.id, chapterId: lesson.chapterId } },
    select: { status: { select: { code: true } } },
  });
  if (!chapterProgress) {
    await db.chapterProgress.create({
      data: {
        user: { connect: { id: user.id } },
        chapter: { connect: { id: lesson.chapterId } },
        status: { connect: { code: PROGRESS_STATUS.IN_PROGRESS } },
        startedAt: now,
      },
    });
  }

  const courseProgress = await db.courseProgress.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { status: { select: { code: true } }, startedAt: true },
  });
  if (!courseProgress) {
    await db.courseProgress.create({
      data: {
        user: { connect: { id: user.id } },
        course: { connect: { id: courseId } },
        status: { connect: { code: PROGRESS_STATUS.IN_PROGRESS } },
        startedAt: now,
        lastLesson: { connect: { id: lessonId } },
      },
    });
  } else {
    await db.courseProgress.update({
      where: { userId_courseId: { userId: user.id, courseId } },
      data: {
        lastLesson: { connect: { id: lessonId } },
        ...(courseProgress.status.code === PROGRESS_STATUS.NOT_STARTED
          ? { status: { connect: { code: PROGRESS_STATUS.IN_PROGRESS } }, startedAt: courseProgress.startedAt ?? now }
          : {}),
      },
    });
  }
}

/**
 * Completa la lección: sella LessonProgress, registra la actividad y, si con
 * ello se termina el capítulo o el curso, sella también esos progresos.
 */
export async function completeLesson(lessonId: string): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:complete-lesson`, 60, 60_000))) return;

  const lesson = await getLessonContext(lessonId);
  if (!lesson) return;

  const now = new Date();
  const courseId = lesson.chapter.courseId;
  const topicId = lesson.lessonTopics[0]?.topicId ?? null;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { status: { connect: { code: PROGRESS_STATUS.COMPLETED } }, completedAt: now },
    create: {
      user: { connect: { id: user.id } },
      lesson: { connect: { id: lessonId } },
      status: { connect: { code: PROGRESS_STATUS.COMPLETED } },
      startedAt: now,
      completedAt: now,
    },
  });

  await recordUserActivity({
    userId: user.id,
    typeCode: ACTIVITY_TYPE.LESSON_COMPLETED,
    subjectTypeCode: SUBJECT_TYPE.LESSON,
    subjectId: lessonId,
    topicId,
    occurredAt: now,
  });

  // ¿Se completó el capítulo?
  const [chapterLessonCount, chapterCompletedCount] = await Promise.all([
    db.lesson.count({ where: { chapterId: lesson.chapterId } }),
    db.lessonProgress.count({
      where: { userId: user.id, lesson: { chapterId: lesson.chapterId }, status: { code: PROGRESS_STATUS.COMPLETED } },
    }),
  ]);
  if (chapterCompletedCount >= chapterLessonCount) {
    await db.chapterProgress.upsert({
      where: { userId_chapterId: { userId: user.id, chapterId: lesson.chapterId } },
      update: { status: { connect: { code: PROGRESS_STATUS.COMPLETED } }, completedAt: now },
      create: {
        user: { connect: { id: user.id } },
        chapter: { connect: { id: lesson.chapterId } },
        status: { connect: { code: PROGRESS_STATUS.COMPLETED } },
        startedAt: now,
        completedAt: now,
      },
    });
  }

  // ¿Se completó el curso?
  const [courseLessonCount, courseCompletedCount] = await Promise.all([
    db.lesson.count({ where: { chapter: { courseId } } }),
    db.lessonProgress.count({
      where: { userId: user.id, lesson: { chapter: { courseId } }, status: { code: PROGRESS_STATUS.COMPLETED } },
    }),
  ]);
  const courseDone = courseCompletedCount >= courseLessonCount;

  await db.courseProgress.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: {
      lastLesson: { connect: { id: lessonId } },
      ...(courseDone ? { status: { connect: { code: PROGRESS_STATUS.COMPLETED } }, completedAt: now } : {}),
    },
    create: {
      user: { connect: { id: user.id } },
      course: { connect: { id: courseId } },
      status: { connect: { code: courseDone ? PROGRESS_STATUS.COMPLETED : PROGRESS_STATUS.IN_PROGRESS } },
      startedAt: now,
      completedAt: courseDone ? now : null,
      lastLesson: { connect: { id: lessonId } },
    },
  });

  if (courseDone) {
    await recordUserActivity({
      userId: user.id,
      typeCode: ACTIVITY_TYPE.COURSE_COMPLETED,
      subjectTypeCode: SUBJECT_TYPE.COURSE,
      subjectId: courseId,
      occurredAt: now,
    });
  }

  revalidateLessonPaths(lesson.chapter.courseId, lesson.chapter.order, lessonId);
}

/**
 * Enciende o apaga el filtro de lecciones imprescindibles de un curso.
 *
 * Es una LENTE, no un cambio en lo que el curso es: escribe exactamente una
 * fila —la de los ajustes— y no toca ni una de progreso. Por eso encenderlo y
 * apagarlo es gratis y reversible; el avance que había sigue donde estaba.
 *
 * El valor llega como argumento ligado y no por el formulario a propósito:
 * `readBoolean` es por presencia, así que una casilla no puede transmitir
 * «false» y apagar el filtro sería imposible.
 */
export async function setOnlyPriorityLessons(courseId: string, enabled: boolean): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:course-settings`, 30, 60_000))) return;

  // Sólo cursos publicados: un POST directo no debe poder sembrar ajustes de
  // cursos en borrador ni de ids inventados.
  const course = await db.course.findFirst({
    where: { id: courseId, status: { code: COURSE_STATUS.PUBLISHED } },
    select: { id: true, chapters: { select: { order: true } } },
  });
  if (!course) return;

  await db.userCourseSettings.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { onlyPriorityLessons: enabled },
    // `boardOrientationId` es NOT NULL y sin valor por defecto. Si la fila la
    // crea este interruptor, se conecta AUTO: un filtro de lecciones no puede
    // fijar de tapadillo la orientación del tablero.
    create: {
      user: { connect: { id: user.id } },
      course: { connect: { id: courseId } },
      onlyPriorityLessons: enabled,
      boardOrientation: { connect: { code: BOARD_ORIENTATION.AUTO } },
    },
  });

  revalidatePath(platformRoutes.courses);
  revalidatePath(platformRoutes.dashboard);
  revalidatePath(platformRoutes.courseDetail(courseId));
  for (const chapter of course.chapters) {
    revalidatePath(platformRoutes.chapterDetail(courseId, chapter.order));
  }
  // El anterior/siguiente de TODAS las lecciones cambia; enumerarlas serían
  // ciento y pico rutas, así que se revalida el patrón.
  revalidatePath("/lecciones/[lessonId]", "page");
}
