// The ONLY writer of UserActivity and UserStatDaily. No "server-only": the
// seed and the scripts run outside Next, and the test drives it with a fake
// client.
import { randomUUID } from "node:crypto";
import {
  STAT_METRIC_BY_ACTIVITY_TYPE,
  type ActivityTypeCode,
  type SubjectTypeCode,
} from "@/constants/platform/activity-codes.const";
import { statsDay } from "@/lib/date-ranges";

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
 * The minimum of Prisma this service needs, so it also accepts a transaction.
 * The arguments are `unknown` because Prisma's generated methods are generic
 * over them and would not fit a narrower signature.
 */
export interface ActivityWriter {
  $executeRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  userActivity: { create(args: unknown): Promise<unknown> };
  statMetric: { findUnique(args: unknown): Promise<{ id: number } | null> };
}

/**
 * Records a fact about the student and updates the daily aggregate.
 *
 * UserActivity is append-only and the source of truth; UserStatDaily is a
 * derived copy (rebuildable with `rebuildDailyStats`, `npm run stats:rebuild`) that makes the
 * dashboard's time ranges cheap. Two rows are incremented per fact: the
 * metric's total (topicId null) and, if there is a topic, its breakdown.
 *
 * It receives the client as its first parameter, like every shared writer, so
 * it runs inside the transaction of the write that produced the fact: a mark
 * of attendance that is refused afterwards must not leave a class attended
 * in the student's statistics.
 */
export async function recordUserActivity(db: ActivityWriter, input: RecordActivityInput): Promise<void> {
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
  await incrementDailyStat(db, input.userId, day, metric.id, null);
  if (topicId !== null) await incrementDailyStat(db, input.userId, day, metric.id, topicId);
}

/**
 * Upsert +1 over the daily bucket. It goes in raw SQL because the unique index
 * uses NULLS NOT DISTINCT (so a null topicId does not duplicate rows) and
 * Prisma's typed `upsert` cannot express that condition.
 */
async function incrementDailyStat(
  db: ActivityWriter,
  userId: string,
  day: Date,
  metricId: number,
  topicId: number | null,
): Promise<void> {
  await db.$executeRaw`
    INSERT INTO "UserStatDaily" ("id", "userId", "day", "metricId", "topicId", "value")
    VALUES (${randomUUID()}, ${userId}, ${day}::date, ${metricId}, ${topicId}, 1)
    ON CONFLICT ("userId", "day", "metricId", "topicId")
    DO UPDATE SET "value" = "UserStatDaily"."value" + 1
  `;
}
