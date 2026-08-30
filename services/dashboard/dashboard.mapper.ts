import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { ActivityItem, DashboardStats, DashboardStatsRange, StatsRangeKey } from "./dashboard.types";

export const activityInclude = {
  type: { select: { code: true, label: true, order: true } },
  subjectType: { select: { code: true } },
  topic: { select: { label: true } },
} satisfies Prisma.UserActivityInclude;

export type ActivityRow = Prisma.UserActivityGetPayload<{ include: typeof activityInclude }>;

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_DAYS: Record<Exclude<StatsRangeKey, "all">, number> = {
  week: 7,
  month: 30,
  year: 365,
};

function countBy(rows: ActivityRow[], keyOf: (row: ActivityRow) => string | undefined): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function mapRange(rows: ActivityRow[], typeLabelsInOrder: string[]): DashboardStatsRange {
  const totals = countBy(rows, (row) => row.type.label);
  const topics = countBy(rows, (row) => row.topic?.label);
  return {
    // Siempre las cinco métricas, aunque valgan cero: las cards no bailan al cambiar el rango.
    totals: typeLabelsInOrder.map((label) => ({ label, count: totals.get(label) ?? 0 })),
    topics: [...topics.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count })),
  };
}

export function mapDashboardStats(rows: ActivityRow[], typeLabelsInOrder: string[], now: Date): DashboardStats {
  const rangeFor = (key: Exclude<StatsRangeKey, "all">) => {
    const since = new Date(now.getTime() - RANGE_DAYS[key] * DAY_MS);
    return mapRange(rows.filter((row) => row.occurredAt >= since), typeLabelsInOrder);
  };
  return {
    week: rangeFor("week"),
    month: rangeFor("month"),
    year: rangeFor("year"),
    all: mapRange(rows, typeLabelsInOrder),
  };
}

export function mapActivityItems(rows: ActivityRow[], subjectNames: Map<string, string>): ActivityItem[] {
  return rows.map((row) => ({
    id: row.id,
    typeLabel: row.type.label,
    subjectName: subjectNames.get(row.subjectId),
    topicLabel: row.topic?.label,
    dateLabel: formatSpanishDate(row.occurredAt),
  }));
}
