import { planDenseRenumber } from "./reorder";

// The places of a lesson's exercises (`Exercise.lessonOrder`, phase 2): where
// a new one goes and how the list closes a gap. Both run inside the caller's
// transaction, like every shared writer, so an archive and its renumbering
// commit together; no "server-only", so the tests drive them with the fake
// client (lib/testing/fake-exercise-db.ts).
//
// Why not `count + 1`: an archived exercise keeps the lesson and loses its
// place (exercise-status.service.ts), and until 2026-10-16 nobody closed the
// gap, so after archiving the second of three the list read 1, 3 and the next
// insert — `count + 1` = 3 — hit `Exercise_lessonId_lessonOrder_key` for ever
// (`orderTaken`). Now the archive closes the gap AND the next place is one
// past the highest, which is free whatever the list looks like.

/** The minimum of Prisma the places need, so a transaction fits too. */
export interface LessonExerciseOrderWriter {
  exercise: {
    findMany(args: unknown): Promise<{ id: string; lessonOrder: number | null }[]>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
}

/** The exercises of the lesson that hold a place, highest first. */
function placed(db: LessonExerciseOrderWriter, lessonId: string, take?: number) {
  return db.exercise.findMany({
    where: { lessonId, lessonOrder: { not: null } },
    select: { id: true, lessonOrder: true },
    orderBy: { lessonOrder: "desc" },
    ...(take === undefined ? {} : { take }),
  });
}

/**
 * The place of the next exercise of the lesson: one past the highest held,
 * never `count + 1`, so a gap left behind can never make it collide.
 */
export async function nextLessonExerciseOrder(db: LessonExerciseOrderWriter, lessonId: string): Promise<number> {
  const [last] = await placed(db, lessonId, 1);
  return (last?.lessonOrder ?? 0) + 1;
}

/**
 * Leaves the lesson's places dense (1..n) after one was taken away — an
 * archive or a delete — through `planDenseRenumber`, whose updates only lower
 * orders and so never find their destination taken. Called AFTER the row lost
 * its place, in the same transaction.
 */
export async function closeLessonExerciseOrderGaps(db: LessonExerciseOrderWriter, lessonId: string): Promise<void> {
  const rows = await placed(db, lessonId);
  const remaining = rows.map((row) => ({ id: row.id, order: row.lessonOrder ?? 0 }));
  for (const update of planDenseRenumber(remaining)) {
    await db.exercise.updateMany({ where: { id: update.id }, data: { lessonOrder: update.order } });
  }
}
