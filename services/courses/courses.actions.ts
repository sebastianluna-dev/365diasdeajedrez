"use server";

import { revalidatePath } from "next/cache";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
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
      // Los slugs son para revalidar las rutas del alumno, que van por slug.
      chapter: { select: { courseId: true, slug: true, course: { select: { slug: true } } } },
      lessonTopics: { select: { topicId: true }, take: 1 },
    },
  });
}

function revalidateLessonPaths(courseSlug: string, chapterSlug: string, lessonId: string) {
  revalidatePath(platformRoutes.dashboard);
  revalidatePath(platformRoutes.courses);
  revalidatePath(platformRoutes.courseDetail(courseSlug));
  revalidatePath(platformRoutes.chapterDetail(courseSlug, chapterSlug));
  revalidatePath(platformRoutes.lessonDetail(courseSlug, chapterSlug, lessonId));
}

/**
 * Marca la lección como abierta: LessonProgress pasa a IN_PROGRESS y el curso
 * actualiza su punto de retorno (lastLessonId). Idempotente; nunca degrada un
 * estado COMPLETED.
 */
export async function touchLesson(lessonId: string): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!allowAction(`${user.id}:touch-lesson`, 120, 60_000)) return;

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
  if (!allowAction(`${user.id}:complete-lesson`, 60, 60_000)) return;

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

  revalidateLessonPaths(lesson.chapter.course.slug, lesson.chapter.slug, lessonId);
}
