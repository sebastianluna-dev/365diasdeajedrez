import "server-only";
import { randomUUID } from "node:crypto";
import {
  STAT_METRIC_BY_ACTIVITY_TYPE,
  type ActivityTypeCode,
  type SubjectTypeCode,
} from "@/constants/platform/activity-codes.const";
import { statsDay } from "@/lib/date-ranges";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

export interface RecordActivityInput {
  userId: string;
  typeCode: ActivityTypeCode;
  subjectTypeCode: SubjectTypeCode;
  subjectId: string;
  /** Topic of the content, when it is known: it allows breaking the statistics down. */
  topicId?: number | null;
  occurredAt?: Date;
  meta?: Record<string, string>;
}

/**
 * Records a fact about the student and updates the daily aggregate.
 *
 * UserActivity is append-only and the source of truth; UserStatDaily is a
 * derived copy (rebuildable with `rebuildDailyStats`, `npm run stats:rebuild`) that makes the
 * dashboard's time ranges cheap. Two rows are incremented per fact: the
 * metric's total (topicId null) and, if there is a topic, its breakdown.
 */
export async function recordUserActivity(input: RecordActivityInput): Promise<void> {
  const db = getPlatformDb();
  const occurredAt = input.occurredAt ?? new Date();
  const topicId = input.topicId ?? null;

  await db.userActivity.create({
    data: {
      user: { connect: { id: input.userId } },
      type: { connect: { code: input.typeCode } },
      subjectType: { connect: { code: input.subjectTypeCode } },
      subjectId: input.subjectId,
      ...(topicId !== null ? { topic: { connect: { id: topicId } } } : {}),
      occurredAt,
      ...(input.meta ? { meta: input.meta } : {}),
    },
  });

  const metric = await db.statMetric.findUnique({
    where: { code: STAT_METRIC_BY_ACTIVITY_TYPE[input.typeCode] },
    select: { id: true },
  });
  if (!metric) return;

  const day = statsDay(occurredAt);
  await incrementDailyStat(input.userId, day, metric.id, null);
  if (topicId !== null) await incrementDailyStat(input.userId, day, metric.id, topicId);
}

/**
 * Upsert +1 over the daily bucket. It goes in raw SQL because the unique index
 * uses NULLS NOT DISTINCT (so a null topicId does not duplicate rows) and
 * Prisma's typed `upsert` cannot express that condition.
 */
async function incrementDailyStat(userId: string, day: Date, metricId: number, topicId: number | null): Promise<void> {
  const db = getPlatformDb();
  await db.$executeRaw`
    INSERT INTO "UserStatDaily" ("id", "userId", "day", "metricId", "topicId", "value")
    VALUES (${randomUUID()}, ${userId}, ${day}::date, ${metricId}, ${topicId}, 1)
    ON CONFLICT ("userId", "day", "metricId", "topicId")
    DO UPDATE SET "value" = "UserStatDaily"."value" + 1
  `;
}
