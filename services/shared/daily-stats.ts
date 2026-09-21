import { STAT_METRIC_BY_ACTIVITY_TYPE, type ActivityTypeCode } from "@/constants/platform/activity-codes.const";
import { statsDay } from "@/lib/date-ranges";
import type { PrismaClient } from "@/lib/platform-db/generated/client";

// No "server-only": the seed and `scripts/rebuild-daily-stats.ts` run this from
// the terminal (like lib/logger.ts).

/**
 * Recomputes a user's daily aggregate from scratch: one row per
 * (day, metric, topic) plus the total row with a null topicId.
 *
 * UserActivity is the source of truth and UserStatDaily a derived copy, so the
 * rebuild is the answer whenever the bucketing changes (it moved from UTC to the
 * study day on 2026-09-21) or the two are suspected to have drifted apart.
 */
export async function rebuildDailyStats(db: PrismaClient, userId: string): Promise<number> {
  const activities = await db.userActivity.findMany({
    where: { userId },
    select: { occurredAt: true, topicId: true, type: { select: { code: true } } },
  });
  const metrics = await db.statMetric.findMany({ select: { id: true, code: true } });
  const metricIdByCode = new Map(metrics.map((metric) => [metric.code, metric.id]));

  const buckets = new Map<string, { day: Date; metricId: number; topicId: number | null; value: number }>();
  for (const activity of activities) {
    const metricCode = STAT_METRIC_BY_ACTIVITY_TYPE[activity.type.code as ActivityTypeCode];
    const metricId = metricCode ? metricIdByCode.get(metricCode) : undefined;
    if (metricId === undefined) continue;

    const day = statsDay(activity.occurredAt);
    // Each fact adds to its metric's total and, if it has a topic, to its breakdown.
    for (const topicId of activity.topicId === null ? [null] : [null, activity.topicId]) {
      const key = `${day.toISOString()}|${metricId}|${topicId ?? "null"}`;
      const bucket = buckets.get(key);
      if (bucket) bucket.value += 1;
      else buckets.set(key, { day, metricId, topicId, value: 1 });
    }
  }

  // Delete and recreate in one transaction: a reader never sees half a rebuild.
  await db.$transaction(async (tx) => {
    await tx.userStatDaily.deleteMany({ where: { userId } });
    if (buckets.size > 0) {
      await tx.userStatDaily.createMany({ data: [...buckets.values()].map((bucket) => ({ userId, ...bucket })) });
    }
  });
  return buckets.size;
}
