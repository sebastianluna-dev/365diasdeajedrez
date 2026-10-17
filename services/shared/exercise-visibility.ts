import { cache } from "react";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import {
  buildSolvableExercisesWhere,
  solvableInContextWhere,
  type AttemptContextInput,
  type ExerciseViewer,
} from "./exercise-visibility-rules";

// Which exercises the student asking may solve, resolved for the request in
// progress. The rule is in exercise-visibility-rules.ts (a pure module); here
// it is only told who is asking: the user, the teacher they are assigned to
// now — the value the series branch compares an exercise's owner with — and
// the teachers of the classes they sit in, the class branch's.
//
// These functions only build the `where`; whoever uses them still has to put
// it into their query. They do not authorise on their own.

/**
 * Who is solving: their id, their active teacher (at most one,
 * `teacher_student_one_active`) and the teachers of the classes they hold a
 * seat in — not moved, not cancelled — whose EXERCISE blocks they may solve from.
 */
export const getExerciseViewer = cache(async (): Promise<ExerciseViewer> => {
  const user = await getCurrentUser();
  const db = getPlatformDb();
  const [assignment, classes] = await Promise.all([
    db.teacherStudent.findFirst({ where: { studentId: user.id, endedAt: null }, select: { teacherId: true } }),
    db.class.findMany({
      where: {
        participants: { some: { userId: user.id, seatMovedAt: null } },
        status: { code: { not: CLASS_STATUS.CANCELLED } },
      },
      select: { teacherId: true },
      distinct: ["teacherId"],
    }),
  ]);
  return {
    userId: user.id,
    activeTeacherId: assignment?.teacherId ?? null,
    classTeacherIds: classes.map((row) => row.teacherId),
  };
});

/** Every exercise the current student may solve, by any path, at `now`. */
export async function getSolvableExercisesWhere(now: Date): Promise<Prisma.ExerciseWhereInput> {
  return buildSolvableExercisesWhere(await getExerciseViewer(), now);
}

/** The exercises the current student may solve through the path an attempt claims, at `now`. */
export async function getSolvableInContextWhere(
  context: AttemptContextInput,
  now: Date,
): Promise<Prisma.ExerciseWhereInput> {
  return solvableInContextWhere(context, await getExerciseViewer(), now);
}
