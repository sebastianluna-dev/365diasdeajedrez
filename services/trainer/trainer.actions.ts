"use server";

import { revalidatePath } from "next/cache";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { ATTEMPT_CONTEXT, ATTEMPT_RESULT, type AttemptResultCode } from "@/constants/platform/training-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { publishedChapterWhere, publishedLessonWhere } from "@/services/shared/published-content";
import { recordUserActivity } from "@/services/shared/user-activity.service";

const MAX_MISTAKES = 999;
/** Dos horas: por encima de eso el dato no es creíble. */
const MAX_DURATION_MS = 2 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

// Las server actions son alcanzables por POST directo: el usuario se resuelve
// aquí dentro y las entradas del cliente se validan contra la base.

export interface RecordAttemptInput {
  exerciseId: string;
  resultCode: AttemptResultCode;
  mistakes: number;
  durationMs: number;
}

export async function recordTrainingAttempt(input: RecordAttemptInput): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  if (input.resultCode !== ATTEMPT_RESULT.PASSED && input.resultCode !== ATTEMPT_RESULT.FAILED) return;
  if (!(await allowAction(`${user.id}:training-attempt`, 120, 60_000))) return;

  // Sólo ejercicios de cursos publicados: un id de un curso en borrador no
  // debe poder sembrar intentos ni actividad.
  const exercise = await db.trainingExercise.findFirst({
    where: { id: input.exerciseId, lesson: publishedLessonWhere },
    select: { id: true, lesson: { select: { lessonTopics: { select: { topicId: true }, take: 1 } } } },
  });
  if (!exercise) return;

  const now = new Date();
  await db.trainingAttempt.create({
    data: {
      user: { connect: { id: user.id } },
      exercise: { connect: { id: exercise.id } },
      result: { connect: { code: input.resultCode } },
      // Los números llegan del cliente: se acotan por arriba y por abajo.
      mistakes: clamp(input.mistakes, 0, MAX_MISTAKES),
      durationMs: clamp(input.durationMs, 0, MAX_DURATION_MS),
      context: { connect: { code: ATTEMPT_CONTEXT.TRAINER } },
      createdAt: now,
    },
  });

  if (input.resultCode === ATTEMPT_RESULT.PASSED) {
    await recordUserActivity({
      userId: user.id,
      typeCode: ACTIVITY_TYPE.EXERCISE_PASSED,
      subjectTypeCode: SUBJECT_TYPE.EXERCISE,
      subjectId: exercise.id,
      topicId: exercise.lesson.lessonTopics[0]?.topicId ?? null,
      occurredAt: now,
    });
  }

  revalidatePath(platformRoutes.dashboard);
}

/** Agrega o quita un capítulo del Move Trainer del usuario. */
export async function toggleTrainerChapter(chapterId: string, add: boolean): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  if (!(await allowAction(`${user.id}:toggle-trainer-chapter`, 60, 60_000))) return;

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, ...publishedChapterWhere },
    select: { id: true, order: true, courseId: true },
  });
  if (!chapter) return;

  if (add) {
    await db.userTrainerChapter.upsert({
      where: { userId_chapterId: { userId: user.id, chapterId } },
      update: {},
      create: { user: { connect: { id: user.id } }, chapter: { connect: { id: chapterId } } },
    });
  } else {
    await db.userTrainerChapter.deleteMany({ where: { userId: user.id, chapterId } });
  }

  revalidatePath(platformRoutes.trainer);
  revalidatePath(platformRoutes.chapterDetail(chapter.courseId, chapter.order));
}
