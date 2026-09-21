"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { ATTEMPT_CONTEXT, ATTEMPT_RESULT, type AttemptResultCode } from "@/constants/platform/training-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { publishedChapterWhere, publishedLessonWhere } from "@/services/shared/published-content";
import { recordUserActivity } from "@/services/shared/user-activity.service";
import { readText } from "@/services/shared/form-data";
import { safeReturnTo, withErrorParam } from "@/services/shared/safe-return-to";

const MAX_MISTAKES = 999;
/** Two hours: above that the figure is not credible. */
const MAX_DURATION_MS = 2 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

// Server actions are reachable by direct POST: the user is resolved in here and
// the client's inputs are validated against the database.

export interface RecordAttemptInput {
  exerciseId: string;
  resultCode: AttemptResultCode;
  mistakes: number;
  durationMs: number;
}

/**
 * Stores an attempt. Returns whether it was stored: the session counts the ones
 * that were not (a throttle, an exercise that is no longer published) and says
 * so in its summary, instead of the student believing they were kept.
 */
export async function recordTrainingAttempt(input: RecordAttemptInput): Promise<boolean> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  if (input.resultCode !== ATTEMPT_RESULT.PASSED && input.resultCode !== ATTEMPT_RESULT.FAILED) return false;
  if (!(await allowAction(`${user.id}:training-attempt`, 120, 60_000))) return false;

  // Only exercises of published courses: an id from a draft course must not be
  // able to seed attempts or activity.
  const exercise = await db.trainingExercise.findFirst({
    where: { id: input.exerciseId, lesson: publishedLessonWhere },
    select: { id: true, lesson: { select: { lessonTopics: { select: { topicId: true }, take: 1 } } } },
  });
  if (!exercise) return false;

  const now = new Date();
  await db.trainingAttempt.create({
    data: {
      user: { connect: { id: user.id } },
      exercise: { connect: { id: exercise.id } },
      result: { connect: { code: input.resultCode } },
      // The numbers come from the client: they are clamped above and below.
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
  return true;
}

/**
 * Adds or removes a chapter from the user's Move Trainer. The form carries
 * `returnTo` because the button lives on the trainer's home and on the chapter
 * page, and a failure is reported on the one that was pressed.
 */
export async function toggleTrainerChapter(chapterId: string, add: boolean, formData: FormData): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const returnTo = safeReturnTo(readText(formData, "returnTo"), platformRoutes.trainer);

  if (!(await allowAction(`${user.id}:toggle-trainer-chapter`, 60, 60_000)))
    redirect(withErrorParam(returnTo, "throttled"));

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
