import { formatSpanishDate } from "@/lib/format-spanish-date";
import { rangeStart, type StatsRangeKey } from "@/lib/date-ranges";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { ActivityItem, DashboardStats, DashboardStatsRange } from "./dashboard.types";

export const activityInclude = {
  type: { select: { code: true, label: true, order: true } },
  subjectType: { select: { code: true } },
  topic: { select: { label: true } },
} satisfies Prisma.UserActivityInclude;

export type ActivityRow = Prisma.UserActivityGetPayload<{ include: typeof activityInclude }>;

export const dailyStatSelect = {
  day: true,
  value: true,
  topicId: true,
  metric: { select: { label: true, order: true } },
  topic: { select: { label: true } },
} satisfies Prisma.UserStatDailySelect;

export type DailyStatRow = Prisma.UserStatDailyGetPayload<{ select: typeof dailyStatSelect }>;

function sumBy(rows: DailyStatRow[], keyOf: (row: DailyStatRow) => string | undefined): Map<string, number> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    totals.set(key, (totals.get(key) ?? 0) + row.value);
  }
  return totals;
}

function mapRange(rows: DailyStatRow[], metricLabelsInOrder: string[]): DashboardStatsRange {
  // topicId nulo = total de la métrica; el resto son el desglose por tema.
  const totals = sumBy(
    rows.filter((row) => row.topicId === null),
    (row) => row.metric.label,
  );
  const topics = sumBy(
    rows.filter((row) => row.topicId !== null),
    (row) => row.topic?.label,
  );

  return {
    // Siempre las mismas métricas, aunque valgan cero: las cards no bailan al cambiar el rango.
    totals: metricLabelsInOrder.map((label) => ({ label, count: totals.get(label) ?? 0 })),
    topics: [...topics.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count })),
  };
}

/**
 * Suma el agregado diario por rangos de calendario (semana en curso desde el
 * lunes, mes en curso, año en curso y total), que es el mismo SUM con otro
 * filtro de `day`.
 */
export function mapDashboardStats(rows: DailyStatRow[], metricLabelsInOrder: string[], now: Date): DashboardStats {
  const rangeFor = (key: StatsRangeKey) => {
    const start = rangeStart(key, now);
    return mapRange(start === null ? rows : rows.filter((row) => row.day >= start), metricLabelsInOrder);
  };

  return {
    week: rangeFor("week"),
    month: rangeFor("month"),
    year: rangeFor("year"),
    all: rangeFor("all"),
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
