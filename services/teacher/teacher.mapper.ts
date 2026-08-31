import type { ClassStatusCode } from "@/constants/platform/class-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { teacherRoutes } from "@/lib/platform-routes";
import type { TeacherClassBrief } from "./teacher.types";

export const teacherClassBriefInclude = {
  status: true,
  _count: { select: { participants: true } },
} satisfies Prisma.ClassInclude;

export type TeacherClassBriefRow = Prisma.ClassGetPayload<{ include: typeof teacherClassBriefInclude }>;

export function mapTeacherClassBrief(row: TeacherClassBriefRow): TeacherClassBrief {
  return {
    id: row.id,
    title: row.title,
    scheduledAtIso: row.scheduledAt.toISOString(),
    dateLabel: formatSpanishDate(row.scheduledAt),
    timeLabel: formatSpanishTime(row.scheduledAt),
    durationMin: row.durationMin,
    statusCode: row.status.code as ClassStatusCode,
    statusLabel: row.status.label,
    participantCount: row._count.participants,
    href: teacherRoutes.classDetail(row.id),
  };
}
