import { cache } from "react";
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
// it is only told who is asking: the user and the teacher they are assigned to
// now, the value the series branch compares an exercise's owner with.
//
// These functions only build the `where`; whoever uses them still has to put
// it into their query. They do not authorise on their own.

/** Who is solving: their id and their active teacher (at most one, `teacher_student_one_active`). */
export const getExerciseViewer = cache(async (): Promise<ExerciseViewer> => {
  const user = await getCurrentUser();
  const assignment = await getPlatformDb().teacherStudent.findFirst({
    where: { studentId: user.id, endedAt: null },
    select: { teacherId: true },
  });
  return { userId: user.id, activeTeacherId: assignment?.teacherId ?? null };
});

/** Every exercise the current student may solve, by any path. */
export const getSolvableExercisesWhere = cache(async (): Promise<Prisma.ExerciseWhereInput> =>
  buildSolvableExercisesWhere(await getExerciseViewer()),
);

/** The exercises the current student may solve through the path an attempt claims. */
export async function getSolvableInContextWhere(context: AttemptContextInput): Promise<Prisma.ExerciseWhereInput> {
  return solvableInContextWhere(context, await getExerciseViewer());
}
