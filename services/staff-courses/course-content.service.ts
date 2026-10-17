import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { lessonHasContent, lessonPgnNotEmptyWhere, lessonPgnSelect } from "@/services/shared/lesson-pgn";

// The minimum a course needs to be published: a lesson with content in one of
// its chapters — a game or PGN to read, or, since phase 2 of «Ejercicios»
// (D25), a published exercise to solve: a practice-only lesson is content too.
// Publishing an empty course would show the student blank lessons. The course
// editor asks it to offer «Publicado» (`canPublish`) and `publishCourse` asks
// it again before writing, so both read it from here.
//
// What "content" is stays `lessonHasContent`'s: the ruling PGN (the linked
// game's when there is one) with something besides blanks. The database can
// tell an empty PGN from one that is not, so it narrows the search to the
// course's lessons whose ruling PGN is not "" (`lessonPgnNotEmptyWhere`) and
// hands over ONE; `lessonHasContent` decides on it. Until 2026-10-03 the editor
// read the PGN of every lesson of the course, on each of its tabs, to answer
// this.
//
// Only a PGN of blanks makes it look further, and no writer leaves one: a
// lesson is born with "" and gets its content from a game. Writing "blank" in
// SQL too would have saved even that one PGN, at the price of a second
// definition of content (a regular expression that has to agree with
// JavaScript's `trim()`) where no test of this repository can reach it.

/** The course's lessons that may have content: those whose ruling PGN is not "". */
export function courseContentCandidatesWhere(courseId: string) {
  return { chapter: { courseId }, ...lessonPgnNotEmptyWhere };
}

/**
 * The course's practice-only candidates (D25): a lesson with a PUBLISHED
 * exercise in play. The student's lesson page lists them where the board
 * would be (`isPracticeOnlyLesson`), so the course has something to show.
 */
export function coursePracticeLessonsWhere(courseId: string) {
  return {
    chapter: { courseId },
    lessonExercises: { some: { status: { code: EXERCISE_STATUS.PUBLISHED }, lessonOrder: { not: null } } },
  };
}

/**
 * The lessons of the client, which is all this reads; a transaction fits too.
 * Prisma's own type and not a hand-written one: its methods are generic over
 * the query, and it is from the `select` that they know the lessons come back
 * with their game's PGN.
 */
export type CourseContentReader = Pick<Prisma.TransactionClient, "lesson">;

/**
 * Whether a lesson of the course has content, which is what it needs to be
 * published: a PGN to read, or a published exercise to solve.
 *
 * One lesson is read: the first the database finds among the candidates. Only
 * when that one is blank text are the rest read, because the database cannot
 * tell blank from content and a blank one first is no answer. With no PGN
 * anywhere, a practice-only lesson is looked for by id alone.
 */
export async function courseHasContent(db: CourseContentReader, courseId: string): Promise<boolean> {
  const where = courseContentCandidatesWhere(courseId);
  const first = await db.lesson.findFirst({ where, select: lessonPgnSelect });
  if (first) {
    if (lessonHasContent(first)) return true;
    const candidates = await db.lesson.findMany({ where, select: lessonPgnSelect });
    if (candidates.some(lessonHasContent)) return true;
  }
  const practice = await db.lesson.findFirst({ where: coursePracticeLessonsWhere(courseId), select: { id: true } });
  return practice !== null;
}
