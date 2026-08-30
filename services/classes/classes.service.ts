import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { classDetailInclude, classSummaryInclude, mapClassDetail, mapClassSummary } from "./classes.mapper";
import type { ClassDetail, ClassesView } from "./classes.types";

export async function getUserClasses(): Promise<ClassesView> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const now = new Date();

  const rows = await db.class.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: classSummaryInclude,
    orderBy: { scheduledAt: "asc" },
  });

  const upcoming = rows.filter((row) => row.scheduledAt >= now).map(mapClassSummary);
  const past = rows
    .filter((row) => row.scheduledAt < now)
    .reverse()
    .map(mapClassSummary);

  return { upcoming, past };
}

export async function getClassById(classId: string): Promise<ClassDetail | null> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const row = await db.class.findFirst({
    where: { id: classId, participants: { some: { userId: user.id } } },
    include: classDetailInclude,
  });
  return row ? mapClassDetail(row, new Date()) : null;
}
