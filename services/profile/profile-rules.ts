import type { Prisma } from "@/lib/platform-db/generated/client";
import type { Viewer } from "@/services/play/play-rules";

// Who may open a person's profile (planning decision §I): the person, their
// teachers under an active assignment, and the staff — always INSIDE the
// query's `where`, so a profile nobody may see is never even read. Opening it
// to every user arrives with the challenges, by changing only this function.

export function profileVisibleWhere(viewer: Viewer): Prisma.UserWhereInput {
  if (viewer.isStaff) return {};
  const who: Prisma.UserWhereInput[] = [{ id: viewer.userId }];
  if (viewer.teacherId) who.push({ studentAssignments: { some: { teacherId: viewer.teacherId, endedAt: null } } });
  return { OR: who };
}
