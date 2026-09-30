// Keeps a chapter's duration in line with its lessons.
//
// `Chapter.estimatedDuration` is not typed by anyone: it is the sum of its
// lessons' minutes, kept on the chapter so that showing a chapter's duration
// never reads its lesson rows. THIS IS THE ONLY FUNCTION THAT WRITES IT.
//
// It receives the client as a parameter so it runs inside the transaction of
// the write that moved the sum, like `syncLessonTrainingExercise` and
// `syncCatalogJoin`. Outside it, two things would break: the sum would be taken
// against a snapshot that does not yet hold the lesson's new figure, so the
// cached value would be one save behind for ever; and a save that is refused
// afterwards — `updateLesson` throws when a trainable lesson is left with no
// line to train — would leave on the chapter the minutes of an edit that never
// happened.

/**
 * The minimum of Prisma this service needs, so it also accepts a transaction.
 * The arguments are `unknown` because Prisma's generated methods are generic
 * over them and would not fit a narrower signature.
 */
export interface ChapterDurationWriter {
  lesson: { findMany(args: unknown): Promise<{ estimatedDuration: number | null }[]> };
  chapter: { updateMany(args: unknown): Promise<unknown> };
}

/**
 * Recomputes the chapter's duration from its lessons and stores it. Returns
 * what was stored: the minutes, or null when no lesson declares any.
 *
 * A lesson without a figure counts as zero, and a total of zero is stored as
 * NULL: «nobody said how long this takes» is not the same as «this takes no
 * time», and every reader already draws the first as a dash or as no duration
 * at all.
 *
 * `updateMany` and not `update`: it is called after deleting a lesson, and a
 * chapter that is no longer there — a cascade, another tab — has to be a no-op
 * and not an exception that rolls back a legitimate write.
 *
 * A lesson MOVING between chapters would have to sync both, the one it left and
 * the one it arrived at. No action moves one today; the one that does has to
 * call this twice.
 *
 * Two lessons of the same chapter saved within milliseconds can leave the
 * slower one's total (READ COMMITTED). It is accepted: the figure is only read,
 * it feeds no progress and no goal, and the next save of any lesson of the
 * chapter heals it, because every write path calls this unconditionally.
 */
export async function syncChapterDuration(db: ChapterDurationWriter, chapterId: string): Promise<number | null> {
  const lessons = await db.lesson.findMany({
    where: { chapterId },
    select: { estimatedDuration: true },
  });

  const total = lessons.reduce((sum, lesson) => sum + (lesson.estimatedDuration ?? 0), 0);
  const minutes = total > 0 ? total : null;

  await db.chapter.updateMany({ where: { id: chapterId }, data: { estimatedDuration: minutes } });
  return minutes;
}
