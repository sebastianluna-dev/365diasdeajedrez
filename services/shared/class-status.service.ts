import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import type { ClassActorRole } from "./class-rules";
import { canTransitionClassStatus } from "./class-status-transitions";

// The ONLY writer of a class's status after it is created, and of the columns
// that say who closed or cancelled it and why. It receives the client as its
// first parameter so it runs inside the caller's transaction, like every shared
// writer; no "server-only", so the seed and the tests drive it with their own
// client.
//
// The status is what somebody wrote; the phase a class is in is read from the
// clock (class-phase.ts). LIVE is never written any more.

/** The minimum of Prisma this service needs, so it also accepts a transaction. */
export interface ClassStatusReader {
  classStatus: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
}

export interface ClassStatusWriter extends ClassStatusReader {
  class: {
    findUnique(args: unknown): Promise<{ statusId: number } | null>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
}

/** The ids of the status catalog, by code and back. */
export interface ClassStatusIds {
  byCode: ReadonlyMap<ClassStatusCode, number>;
  codeOf: ReadonlyMap<number, ClassStatusCode>;
}

export async function classStatusIds(db: ClassStatusReader): Promise<ClassStatusIds> {
  const rows = await db.classStatus.findMany({ select: { id: true, code: true } });
  const byCode = new Map<ClassStatusCode, number>();
  const codeOf = new Map<number, ClassStatusCode>();
  for (const row of rows) {
    byCode.set(row.code as ClassStatusCode, row.id);
    codeOf.set(row.id, row.code as ClassStatusCode);
  }
  return { byCode, codeOf };
}

/** The status a class is created with: SCHEDULED, always. */
export function initialClassStatusData(ids: ClassStatusIds): { statusId: number } {
  const statusId = ids.byCode.get(CLASS_STATUS.SCHEDULED);
  if (statusId === undefined) throw new Error("ClassStatus SCHEDULED is not seeded");
  return { statusId };
}

export interface TransitionClassStatusInput {
  classId: string;
  to: typeof CLASS_STATUS.COMPLETED | typeof CLASS_STATUS.CANCELLED;
  actor: { userId: string; role: ClassActorRole };
  now: Date;
  /** With CANCELLED: the reason (internal) and the note the students read. */
  cancel?: { reason: string; note: string | null };
}

/**
 * Finalizes or cancels a class, after `canTransitionClassStatus` says the actor
 * may. The write is an `updateMany` conditioned on the class still being open,
 * so two closes that overlap write once: the second finds nothing and reports
 * `written: false`, which the caller reads as «ya no está en ese estado».
 */
export async function transitionClassStatus(
  db: ClassStatusWriter,
  input: TransitionClassStatusInput,
): Promise<{ written: boolean }> {
  const ids = await classStatusIds(db);
  const row = await db.class.findUnique({ where: { id: input.classId }, select: { statusId: true } });
  if (!row) return { written: false };
  const from = ids.codeOf.get(row.statusId);
  if (!from || !canTransitionClassStatus(from, input.to, input.actor.role)) return { written: false };

  const openIds = [ids.byCode.get(CLASS_STATUS.SCHEDULED), ids.byCode.get(CLASS_STATUS.LIVE)].filter(
    (id): id is number => id !== undefined,
  );
  const audit =
    input.to === CLASS_STATUS.CANCELLED
      ? {
          cancelledAt: input.now,
          cancelledById: input.actor.userId,
          cancelReason: input.cancel?.reason ?? null,
          cancelNote: input.cancel?.note ?? null,
        }
      : { closedAt: input.now, closedById: input.actor.userId };

  const result = await db.class.updateMany({
    where: { id: input.classId, statusId: { in: openIds } },
    data: { statusId: ids.byCode.get(input.to), ...audit },
  });
  return { written: result.count > 0 };
}
