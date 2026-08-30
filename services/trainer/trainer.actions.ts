"use server";

import { revalidatePath } from "next/cache";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { ATTEMPT_CONTEXT, ATTEMPT_RESULT, type AttemptResultCode } from "@/constants/platform/training-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";

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

  const exercise = await db.trainingExercise.findUnique({
    where: { id: input.exerciseId },
    select: { id: true, lesson: { select: { lessonTopics: { select: { topicId: true }, take: 1 } } } },
  });
  if (!exercise) return;

  const now = new Date();
  await db.trainingAttempt.create({
    data: {
      user: { connect: { id: user.id } },
      exercise: { connect: { id: exercise.id } },
      result: { connect: { code: input.resultCode } },
      mistakes: Math.max(0, Math.floor(input.mistakes)),
      durationMs: Math.max(0, Math.floor(input.durationMs)),
      context: { connect: { code: ATTEMPT_CONTEXT.TRAINER } },
      createdAt: now,
    },
  });

  if (input.resultCode === ATTEMPT_RESULT.PASSED) {
    const topicId = exercise.lesson.lessonTopics[0]?.topicId ?? null;
    await db.userActivity.create({
      data: {
        user: { connect: { id: user.id } },
        type: { connect: { code: ACTIVITY_TYPE.EXERCISE_PASSED } },
        subjectType: { connect: { code: SUBJECT_TYPE.EXERCISE } },
        subjectId: exercise.id,
        ...(topicId !== null ? { topic: { connect: { id: topicId } } } : {}),
        occurredAt: now,
      },
    });
  }

  revalidatePath(platformRoutes.dashboard);
}

/** Agrega o quita un capítulo del Move Trainer del usuario. */
export async function toggleTrainerChapter(chapterId: string, add: boolean): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const chapter = await db.chapter.findUnique({ where: { id: chapterId }, select: { id: true, courseId: true } });
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
  revalidatePath(platformRoutes.chapterDetail(chapter.courseId, chapterId));
}
