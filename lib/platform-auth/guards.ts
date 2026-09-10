import "server-only";
import { notFound } from "next/navigation";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

// Ownership checks for the write server actions, where narrowing a read `where`
// is not enough (or where repeating it in every action invites forgetting it).
// Every /teacher action that receives an id from the client goes through here
// before writing: a direct POST with another teacher's id has to die here, not
// in the interface.
//
// They fail with `notFound()` and not with a permissions error on purpose: it is
// the same effect as "the service returned null" and does not confirm that the
// resource exists.

export async function assertTeacherOwnsClass(teacherId: string, classId: string): Promise<void> {
  const row = await getPlatformDb().class.findFirst({
    where: { id: classId, teacherId },
    select: { id: true },
  });
  if (!row) notFound();
}

/** ACTIVE assignment: a reassigned student stops being accessible at once. */
export async function assertTeacherHasStudent(teacherId: string, studentId: string): Promise<void> {
  const row = await getPlatformDb().teacherStudent.findFirst({
    where: { teacherId, studentId, endedAt: null },
    select: { id: true },
  });
  if (!row) notFound();
}

/**
 * The teacher may reference in a class a game from a study of their own or from
 * a student with an active assignment.
 *
 * Validity is checked WHEN INSERTING the block: if the assignment ends later,
 * the historical block stays valid. That is deliberate — reassigning a student
 * cannot break the classes that were already given. (If the student deletes
 * their game, `ClassBlock.gameId` is `onDelete: SetNull` and the renderer
 * already tolerates a block without a reference.)
 */
export async function assertTeacherCanReferenceGame(
  teacher: { id: string; userId: string },
  gameId: string,
): Promise<void> {
  const row = await getPlatformDb().game.findFirst({
    where: {
      id: gameId,
      database: {
        OR: [
          { userId: teacher.userId },
          { user: { studentAssignments: { some: { teacherId: teacher.id, endedAt: null } } } },
        ],
      },
    },
    select: { id: true },
  });
  if (!row) notFound();
}
