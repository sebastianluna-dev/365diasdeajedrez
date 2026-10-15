import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { CLASS_PHASE, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { classPhase } from "./class-phase";
import { attendanceEditableBy, type AttendanceEdit, type ClassActorRole } from "./class-rules";
import { lockClasses } from "./class-seats.service";
import { classStatusIds, type ClassStatusReader } from "./class-status.service";
import { recordUserActivity, type ActivityWriter } from "./user-activity.service";

// The ONLY writer of attendance: the marks (`ClassParticipant.attended`), the
// class's `attendanceTakenAt`, the log of every mark (`ClassAttendanceChange`)
// and the CLASS_ATTENDED activity of the student, once per student and class.
// It receives the client as its first parameter so it runs inside the caller's
// transaction; no "server-only".
//
// The class is locked first: two marks of the same class that overlap are
// serialised, so the «once per student and class» of the activity holds
// without a unique index (which would have to name a serial id).

/** The minimum of Prisma this service needs, so it also accepts a transaction. */
export interface AttendanceWriter extends ActivityWriter, ClassStatusReader {
  $queryRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  class: {
    findUnique(args: unknown): Promise<AttendanceClassRow | null>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  classParticipant: {
    findMany(args: unknown): Promise<{ userId: string; attended: boolean | null; seatMovedAt: Date | null }[]>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  classAttendanceChange: {
    findMany(args: unknown): Promise<{ userId: string; isOverride: boolean; changedAt: Date }[]>;
    create(args: unknown): Promise<unknown>;
  };
  userActivity: ActivityWriter["userActivity"] & { findMany(args: unknown): Promise<{ userId: string }[]> };
}

export interface AttendanceClassRow {
  id: string;
  statusId: number;
  scheduledAt: Date;
  endsAt: Date;
  meetingUrl: string | null;
  meetingUrlVisibleFrom: Date | null;
  attendanceTakenAt: Date | null;
}

export type RecordAttendanceError =
  | "classCancelled"
  | "notStarted"
  | "reasonRequired"
  | "markLocked"
  | "seatMoved"
  | "notInClass"
  | "missingMark"
  | "notAllowed";

export interface RecordAttendanceInput {
  classId: string;
  marks: { studentId: string; attended: boolean }[];
  actor: { userId: string; role: ClassActorRole };
  /** What the actor is doing; it has to be what `attendanceEditableBy` gives their role in this phase. */
  mode: AttendanceEdit;
  reason: string | null;
  now: Date;
}

/**
 * Writes the marks the actor may write. Finalizing needs a mark for every
 * seat that was not moved; the staff always gives a reason. A mark equal to
 * the current one changes nothing and is not logged; unmarking «Asistió» keeps
 * the activity it produced (the log is append-only; D5).
 */
export async function recordAttendance(
  db: AttendanceWriter,
  input: RecordAttendanceInput,
): Promise<{ ok: true; changed: number } | { ok: false; code: RecordAttendanceError }> {
  await lockClasses(db, [input.classId]);
  const [ids, classRow] = await Promise.all([
    classStatusIds(db),
    db.class.findUnique({ where: { id: input.classId } }),
  ]);
  if (!classRow) return { ok: false, code: "notInClass" };
  const statusCode = ids.codeOf.get(classRow.statusId) ?? CLASS_STATUS.SCHEDULED;
  const phase = classPhase(
    {
      statusCode,
      scheduledAt: classRow.scheduledAt,
      endsAt: classRow.endsAt,
      visibleFrom: classRow.meetingUrlVisibleFrom,
      hasLink: classRow.meetingUrl !== null,
    },
    input.now,
  );
  if (phase === CLASS_PHASE.CANCELLED) return { ok: false, code: "classCancelled" };
  if (phase === CLASS_PHASE.UPCOMING || phase === CLASS_PHASE.OPEN) return { ok: false, code: "notStarted" };
  if (input.actor.role === "staff" && (input.reason ?? "").trim().length === 0) {
    return { ok: false, code: "reasonRequired" };
  }

  const [seats, changes] = await Promise.all([
    db.classParticipant.findMany({
      where: { classId: input.classId },
      select: { userId: true, attended: true, seatMovedAt: true },
    }),
    db.classAttendanceChange.findMany({
      where: { classId: input.classId },
      orderBy: { changedAt: "desc" },
      select: { userId: true, isOverride: true, changedAt: true },
    }),
  ]);
  const seatOf = new Map(seats.map((seat) => [seat.userId, seat]));
  const lastChangeOf = new Map<string, { isOverride: boolean }>();
  for (const change of changes) if (!lastChangeOf.has(change.userId)) lastChangeOf.set(change.userId, change);

  const markOf = new Map(input.marks.map((mark) => [mark.studentId, mark.attended]));
  if (input.mode === "finalize") {
    for (const seat of seats) {
      if (seat.seatMovedAt === null && !markOf.has(seat.userId)) return { ok: false, code: "missingMark" };
    }
  }
  for (const mark of input.marks) {
    const seat = seatOf.get(mark.studentId);
    if (!seat) return { ok: false, code: "notInClass" };
    if (seat.seatMovedAt !== null) return { ok: false, code: "seatMoved" };
    const allowed = attendanceEditableBy({
      role: input.actor.role,
      phase,
      lastChange: lastChangeOf.get(mark.studentId) ?? null,
      seatMoved: false,
    });
    if (allowed === null) return { ok: false, code: "markLocked" };
    if (allowed !== input.mode) return { ok: false, code: "notAllowed" };
  }

  const changed = input.marks.filter((mark) => seatOf.get(mark.studentId)?.attended !== mark.attended);
  const newlyAttended = changed.filter((mark) => mark.attended).map((mark) => mark.studentId);
  const already = new Set(
    newlyAttended.length === 0
      ? []
      : (
          await db.userActivity.findMany({
            where: {
              userId: { in: newlyAttended },
              subjectId: input.classId,
              type: { code: ACTIVITY_TYPE.CLASS_ATTENDED },
            },
            select: { userId: true },
          })
        ).map((row) => row.userId),
  );

  for (const mark of changed) {
    await db.classParticipant.updateMany({
      where: { classId: input.classId, userId: mark.studentId },
      data: { attended: mark.attended },
    });
    await db.classAttendanceChange.create({
      data: {
        classId: input.classId,
        userId: mark.studentId,
        fromAttended: seatOf.get(mark.studentId)?.attended ?? null,
        toAttended: mark.attended,
        reason: input.reason,
        changedById: input.actor.userId,
        isOverride: input.mode === "override",
        changedAt: input.now,
      },
    });
    if (mark.attended && !already.has(mark.studentId)) {
      await recordUserActivity(db, {
        userId: mark.studentId,
        typeCode: ACTIVITY_TYPE.CLASS_ATTENDED,
        subjectTypeCode: SUBJECT_TYPE.CLASS,
        subjectId: input.classId,
        occurredAt: classRow.scheduledAt,
      });
    }
  }
  if (classRow.attendanceTakenAt === null) {
    await db.class.updateMany({
      where: { id: input.classId, attendanceTakenAt: null },
      data: { attendanceTakenAt: input.now },
    });
  }
  return { ok: true, changed: changed.length };
}
