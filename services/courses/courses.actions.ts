"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { BOARD_ORIENTATION, PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { publishedLessonWhere } from "@/services/shared/published-content";
import { readText } from "@/services/shared/form-data";
import { safeReturnTo, withErrorParam } from "@/services/shared/safe-return-to";
import { recordUserActivity } from "@/services/shared/user-activity.service";

// Server actions are reachable by direct POST: the user is ALWAYS resolved in
// here (DAL) and never arrives from the client.

// Only lessons of published courses: the id comes from the client and without
// this filter a direct POST would seed progress over a draft course.
async function getLessonContext(lessonId: string) {
  const db = getPlatformDb();
  return db.lesson.findFirst({
    where: { id: lessonId, ...publishedLessonWhere },
    select: {
      id: true,
      chapterId: true,
      // The order and the course are for revalidating the student's routes.
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
 * Marks the lesson as opened: LessonProgress moves to IN_PROGRESS and the
 * course updates its return point (lastLessonId). Idempotent; it never
 * downgrades a COMPLETED state.
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
 * Completes the lesson: it seals LessonProgress, records the activity and, if
 * that finishes the chapter or the course, seals those progresses too.
 */
export async function completeLesson(lessonId: string): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:complete-lesson`, 60, 60_000))) {
    redirect(withErrorParam(platformRoutes.lessonDetail(lessonId), "throttled"));
  }

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

  // Was the chapter completed?
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

  // Was the course completed?
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
 * Switches a course's essential-lessons filter on or off.
 *
 * It is a LENS, not a change in what the course is: it writes exactly one row
 * — the settings one — and does not touch a single progress row. That is why
 * switching it on and off is free and reversible; the progress that was there
 * stays where it was.
 *
 * The value arrives as a bound argument and not through the form on purpose:
 * `readBoolean` works by presence, so a checkbox cannot transmit "false" and
 * switching the filter off would be impossible. The form only carries
 * `returnTo`: the switch lives on the course page and on the chapter page, and
 * a failure has to be reported on the one that was pressed.
 */
export async function setOnlyPriorityLessons(courseId: string, enabled: boolean, formData: FormData): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const returnTo = safeReturnTo(readText(formData, "returnTo"), platformRoutes.courseDetail(courseId));
  if (!(await allowAction(`${user.id}:course-settings`, 30, 60_000))) redirect(withErrorParam(returnTo, "throttled"));

  // Only published courses: a direct POST must not be able to seed settings of
  // draft courses nor of made-up ids.
  const course = await db.course.findFirst({
    where: { id: courseId, status: { code: COURSE_STATUS.PUBLISHED } },
    select: { id: true, chapters: { select: { order: true } } },
  });
  if (!course) return;

  await db.userCourseSettings.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { onlyPriorityLessons: enabled },
    // `boardOrientationId` is NOT NULL and has no default value. If the row is
    // created by this switch, AUTO is wired in: a lesson filter cannot quietly fix
    // the board's orientation.
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
  // The previous/next of EVERY lesson changes; enumerating them would be a
  // hundred-odd routes, so the pattern is revalidated.
  revalidatePath("/lecciones/[lessonId]", "page");
}
