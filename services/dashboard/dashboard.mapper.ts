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

/** Una fila del `groupBy` de `UserStatDaily`: la suma de una métrica (y tema) en un rango. */
export interface StatTotalRow {
  metricId: number;
  topicId: number | null;
  total: number;
}

export interface StatLabels {
  /** Métricas en su orden de catálogo: las cards no bailan al cambiar el rango. */
  metrics: { id: number; label: string }[];
  topics: Map<number, string>;
}

function mapRange(rows: StatTotalRow[], labels: StatLabels): DashboardStatsRange {
  // topicId nulo = total de la métrica; el resto son el desglose por tema.
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
    // Siempre las mismas métricas, aunque valgan cero.
    totals: labels.metrics.map((metric) => ({ label: metric.label, count: byMetric.get(metric.id) ?? 0 })),
    topics: [...byTopic.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count })),
  };
}

/**
 * Las sumas por rango ya vienen hechas de la base (ver `getStatTotals`); aquí
 * sólo se les pone nombre y orden.
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
