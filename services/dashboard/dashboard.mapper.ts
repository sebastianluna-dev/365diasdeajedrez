import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { StatsRangeKey } from "@/lib/date-ranges";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { ActivityItem, DashboardStats, DashboardStatsRange } from "./dashboard.types";

export const activityInclude = {
  type: { select: { code: true, label: true, order: true } },
  subjectType: { select: { code: true } },
  topic: { select: { label: true } },
} satisfies Prisma.UserActivityInclude;

export type ActivityRow = Prisma.UserActivityGetPayload<{ include: typeof activityInclude }>;

/**
 * One row of the `groupBy` over `UserStatDaily`: the sum of a metric (and
 * topic) in a range.
 */
export interface StatTotalRow {
  metricId: number;
  topicId: number | null;
  total: number;
}

export interface StatLabels {
  /** Metrics in their catalog order: the cards do not dance when the range changes. */
  metrics: { id: number; label: string }[];
  topics: Map<number, string>;
}

function mapRange(rows: StatTotalRow[], labels: StatLabels): DashboardStatsRange {
  // A null topicId = total of the metric; the rest are the breakdown by topic.
  const byMetric = new Map<number, number>();
  const byTopic = new Map<string, number>();
  for (const row of rows) {
    if (row.topicId === null) {
      byMetric.set(row.metricId, (byMetric.get(row.metricId) ?? 0) + row.total);
      continue;
    }
    const label = labels.topics.get(row.topicId);
    if (label) byTopic.set(label, (byTopic.get(label) ?? 0) + row.total);
  }

  return {
    // Always the same metrics, even when they are zero.
    totals: labels.metrics.map((metric) => ({ label: metric.label, count: byMetric.get(metric.id) ?? 0 })),
    topics: [...byTopic.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count })),
  };
}

/**
 * The sums per range already come done from the database (see `getStatTotals`);
 * here they are only given a name and an order.
 */
export function mapDashboardStats(totals: Record<StatsRangeKey, StatTotalRow[]>, labels: StatLabels): DashboardStats {
  return {
    week: mapRange(totals.week, labels),
    month: mapRange(totals.month, labels),
    year: mapRange(totals.year, labels),
    all: mapRange(totals.all, labels),
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
