import { formatSpanishDate } from "@/lib/format-spanish-date";
import { rangeStart, type StatsRangeKey } from "@/lib/date-ranges";
import { Prisma } from "@/lib/platform-db/generated/client";
import type { ActivityItem, DashboardStats, DashboardStatsRange } from "./dashboard.types";

export const activityInclude = {
  type: { select: { code: true, label: true, order: true } },
  subjectType: { select: { code: true } },
  topic: { select: { label: true } },
} satisfies Prisma.UserActivityInclude;

export type ActivityRow = Prisma.UserActivityGetPayload<{ include: typeof activityInclude }>;

/** The statistics' calendar ranges, in the order the query names its columns. */
export const STATS_RANGES = ["week", "month", "year", "all"] as const satisfies readonly StatsRangeKey[];

/** The sum of a metric (and topic) in a range. */
export interface StatTotalRow {
  metricId: number;
  topicId: number | null;
  total: number;
}

/**
 * One row of `statRangeSumsQuery`: a metric (and topic) of the student with its
 * sum in each range. A range where it has no row is NULL — `SUM` over nothing —,
 * which is exactly when the per-range `groupBy` this replaced did not return
 * the group at all.
 */
export type StatRangeSumsRow = { metricId: number; topicId: number | null } & Record<StatsRangeKey, number | null>;

/**
 * The four ranges of the statistics in ONE query over the daily aggregate: a
 * `SUM` per range with a `FILTER` on the day, grouped by metric and topic. It is
 * raw SQL because Prisma's `groupBy` cannot sum conditionally, and one
 * `groupBy` per range was one round trip per range for figures a single pass
 * over the student's rows gives — the pass the "all" range made anyway.
 *
 * Each range starts where `rangeStart` says (the study day's calendar, from
 * Monday), and "all", which has no start, sums without a filter: the same cut
 * the four `groupBy` made with `day >= start`. The day is bound as a `Date` and
 * cast to `date`, like the writer does (`incrementDailyStat`): the adapter
 * sends its UTC date, which is the day the column stores.
 */
export function statRangeSumsQuery(userId: string, now: Date): Prisma.Sql {
  const sums = STATS_RANGES.map((key) => {
    const start = rangeStart(key, now);
    const column = Prisma.raw(`"${key}"`);
    return start
      ? Prisma.sql`(SUM("value") FILTER (WHERE "day" >= ${start}::date))::int AS ${column}`
      : Prisma.sql`SUM("value")::int AS ${column}`;
  });

  return Prisma.sql`SELECT "metricId", "topicId", ${Prisma.join(sums)} FROM "UserStatDaily" WHERE "userId" = ${userId} GROUP BY "metricId", "topicId"`;
}

/**
 * The rows of `statRangeSumsQuery` split into one list per range, leaving out
 * of a range the groups whose sum there is NULL: the shape, and the figures,
 * the four `groupBy` gave.
 */
export function bucketStatRangeSums(rows: StatRangeSumsRow[]): Record<StatsRangeKey, StatTotalRow[]> {
  const totals: Record<StatsRangeKey, StatTotalRow[]> = { week: [], month: [], year: [], all: [] };
  for (const row of rows) {
    for (const key of STATS_RANGES) {
      const total = row[key];
      if (total !== null) totals[key].push({ metricId: row.metricId, topicId: row.topicId, total });
    }
  }
  return totals;
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
 * The sums per range already come done from the database (`statRangeSumsQuery`
 * and `bucketStatRangeSums`); here they are only given a name and an order.
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
