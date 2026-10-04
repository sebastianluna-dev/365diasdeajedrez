import type { Prisma } from "@/lib/platform-db/generated/client";
import { lessonHasContent, lessonPgnNotEmptyWhere, lessonPgnSelect } from "@/services/shared/lesson-pgn";

// The minimum a course needs to be published: a lesson with content in one of
// its chapters. Publishing an empty course would show the student blank
// lessons. The course editor asks it to offer «Publicado» (`canPublish`) and
// `publishCourse` asks it again before writing, so both read it from here.
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
 * The lessons of the client, which is all this reads; a transaction fits too.
 * Prisma's own type and not a hand-written one: its methods are generic over
 * the query, and it is from the `select` that they know the lessons come back
 * with their game's PGN.
 */
export type CourseContentReader = Pick<Prisma.TransactionClient, "lesson">;

/**
 * Whether a lesson of the course has content, which is what it needs to be
 * published.
 *
 * One lesson is read: the first the database finds among the candidates. Only
 * when that one is blank text are the rest read, because the database cannot
 * tell blank from content and a blank one first is no answer.
 */
export async function courseHasContent(db: CourseContentReader, courseId: string): Promise<boolean> {
  const where = courseContentCandidatesWhere(courseId);
  const first = await db.lesson.findFirst({ where, select: lessonPgnSelect });
  if (!first) return false;
  if (lessonHasContent(first)) return true;
  const candidates = await db.lesson.findMany({ where, select: lessonPgnSelect });
  return candidates.some(lessonHasContent);
}
