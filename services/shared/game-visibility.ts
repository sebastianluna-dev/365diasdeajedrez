import { cache } from "react";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getTeacherContext } from "@/lib/platform-auth/roles";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { buildVisibleDatabasesWhere, buildVisibleGamesWhere } from "./game-visibility-rules";

// Who can see which games, resolved for the request in progress. The rule is in
// game-visibility-rules (a pure module); here it is only told who is asking.
//
// It is shared by "Mis estudios" and the position search: a discrepancy between
// the two would be a leak, because the search would show in an aggregated
// listing games the student cannot open.
//
// These functions only build the `where`; whoever uses them still has to put it
// into their query. They do not authorise on their own.

/**
 * Who is looking: their id and, if they are an active teacher, the id of their
 * teacher record.
 */
const getViewer = cache(async () => {
  const user = await getCurrentUser();
  const teacherContext = await getTeacherContext();
  return { userId: user.id, teacherId: teacherContext?.teacher.id };
});

export const getVisibleDatabasesWhere = cache(async (): Promise<Prisma.GameDatabaseWhereInput> =>
  buildVisibleDatabasesWhere(await getViewer()),
);

export const getVisibleGamesWhere = cache(async (): Promise<Prisma.GameWhereInput> =>
  buildVisibleGamesWhere(await getViewer()),
);
