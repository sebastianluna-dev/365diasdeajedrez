import "server-only";
import { randomUUID } from "node:crypto";
import {
  STAT_METRIC_BY_ACTIVITY_TYPE,
  type ActivityTypeCode,
  type SubjectTypeCode,
} from "@/constants/platform/activity-codes.const";
import { toUtcDay } from "@/lib/date-ranges";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

export interface RecordActivityInput {
  userId: string;
  typeCode: ActivityTypeCode;
  subjectTypeCode: SubjectTypeCode;
  subjectId: string;
  /** Tema del contenido, cuando se conoce: permite desglosar las estadísticas. */
  topicId?: number | null;
  occurredAt?: Date;
  meta?: Record<string, string>;
}

/**
 * Registra un hecho del alumno y actualiza el agregado diario.
 *
 * UserActivity es append-only y la fuente de verdad; UserStatDaily es una
 * copia derivada (reconstruible con `rebuildUserStatDaily`) que hace baratos
 * los rangos temporales del dashboard. Se incrementan dos filas por hecho: el
 * total de la métrica (topicId null) y, si hay tema, su desglose.
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

  await incrementDailyStat(input.userId, toUtcDay(occurredAt), metric.id, null);
  if (topicId !== null) await incrementDailyStat(input.userId, toUtcDay(occurredAt), metric.id, topicId);
}

/**
 * Upsert +1 sobre el bucket diario. Va en SQL crudo porque el índice único usa
 * NULLS NOT DISTINCT (para que topicId nulo no duplique filas) y el `upsert`
 * tipado de Prisma no puede expresar esa condición.
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
