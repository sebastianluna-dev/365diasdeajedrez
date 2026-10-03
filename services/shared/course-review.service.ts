import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { isDueForReview } from "@/lib/training/review-schedule";
import { publishedChapterWhere, publishedCourseWhere } from "./published-content";

// What a course's «Repasar» trains: the exercises of the lessons the student
// learned whose review is due. The figure on the button (`getCourseReview`,
// `getCourseReviews`) and the session the button opens (`getTrainerSession`
// with a `courseId`) both take their `where` from `dueReviewExerciseWhere`, so
// the two cannot disagree.
//
// "Due" is `isDueForReview`, the one definition of it, applied to the
// student's schedule (`UserLessonTraining.nextReviewAt`) read beforehand: the
// lessons not due yet are left out by id. A relation filter on `nextReviewAt`
// would have saved that read, but it would have written the rule a second
// time, in SQL, where its test cannot reach. A lesson never trained has no
// row, so nothing leaves it out: it is due.

/** A row of the student's review schedule. */
export interface LessonReviewSchedule {
  lessonId: string;
  nextReviewAt: Date | null;
}

export interface ReviewScope {
  userId: string;
  /** One course; absent, every course at once, which is what «Mis cursos» counts. */
  courseId?: string;
}

/**
 * The minimum of Prisma the read needs, so a test can hand it a fake. The
 * argument is `unknown` because Prisma's generated methods are generic over
 * it and would not fit a narrower signature.
 */
export interface ReviewScheduleReader {
  userLessonTraining: { findMany(args: unknown): Promise<LessonReviewSchedule[]> };
}

/**
 * The exercises of the lessons the student LEARNED in the scope, in published
 * courses, less those of the lessons in `notDue`. With nothing left out it is
 * everything that can be reviewed there, which is what tells a course that is
 * up to date («Al día») from one with nothing learned to review.
 */
export function reviewExerciseWhere(
  scope: ReviewScope,
  notDue: readonly string[] = [],
): Prisma.TrainingExerciseWhereInput {
  const learned: Prisma.TrainingExerciseWhereInput = {
    lesson: {
      chapter: scope.courseId ? { courseId: scope.courseId, course: publishedCourseWhere } : publishedChapterWhere,
      progresses: { some: { userId: scope.userId, status: { code: PROGRESS_STATUS.COMPLETED } } },
    },
  };
  // No clause at all when nothing is left out: an empty `notIn` says nothing.
  return notDue.length > 0 ? { ...learned, lessonId: { notIn: [...notDue] } } : learned;
}

/**
 * What «Repasar» trains in the scope at `now`: the student's schedule there is
 * read, and the lessons it says are not due yet are left out of what was
 * learned.
 */
export async function dueReviewExerciseWhere(
  db: ReviewScheduleReader,
  scope: ReviewScope,
  now: Date,
): Promise<Prisma.TrainingExerciseWhereInput> {
  const schedule = await db.userLessonTraining.findMany({
    where: scope.courseId
      ? { userId: scope.userId, lesson: { chapter: { courseId: scope.courseId } } }
      : { userId: scope.userId },
    select: { lessonId: true, nextReviewAt: true },
  });
  const notDue = schedule.filter((row) => !isDueForReview(row.nextReviewAt, now)).map((row) => row.lessonId);
  return reviewExerciseWhere(scope, notDue);
}
