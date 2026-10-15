import { CLASS_STATUS, type ClassFormatCode } from "@/constants/platform/class-codes.const";
import { lockClasses } from "./class-locks";
import { classPhase } from "./class-phase";
import { canAddParticipants, canMoveSeat } from "./class-rules";
import { classStatusIds, type ClassStatusReader } from "./class-status.service";
import { isUnpaidSeat } from "./payment-seats";

// The ONLY writers of a seat (`ClassParticipant`): who is in a class, with
// what coverage, and the move of a no-show's seat to another date. They
// receive the client as their first parameter so they run inside the caller's
// transaction; no "server-only", so the seed and the tests drive them with a
// client of their own.
//
// What they protect is the payment's invariant: a payment of n classes never
// covers more than n seats that count. Two writes that race for the last seat
// of a payment are serialised by locking: first every `Class` row the
// transaction touches, at once and by id (`lockClasses`), then the student's
// payments by (paidOn, id). The same order everywhere, so no two transactions
// can wait on each other. The locks live until the caller's transaction ends,
// which is one more reason these run inside it.

/** The minimum of Prisma this service needs, so it also accepts a transaction. */
export interface ClassSeatsWriter extends ClassStatusReader {
  $queryRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  class: {
    findUnique(args: unknown): Promise<ClassSeatsClassRow | null>;
    findMany(args: unknown): Promise<{ id: string; statusId: number }[]>;
  };
  classFormat: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  classParticipant: {
    findUnique(args: unknown): Promise<SeatRecord | null>;
    findMany(args: unknown): Promise<SeatRecord[]>;
    create(args: unknown): Promise<unknown>;
    updateMany(args: unknown): Promise<{ count: number }>;
    deleteMany(args: unknown): Promise<{ count: number }>;
  };
  classPayment: {
    findMany(args: unknown): Promise<{ id: string; studentId: string; classCount: number }[]>;
  };
}

/** A class, as the seat writers read it (scalars only, so a transaction's client fits). */
export interface ClassSeatsClassRow {
  id: string;
  formatId: number;
  capacity: number | null;
  statusId: number;
  scheduledAt: Date;
  endsAt: Date;
}

/** A seat's row, scalars only. */
export interface SeatRecord {
  classId: string;
  userId: string;
  paymentId: string | null;
  isFree: boolean;
  attended: boolean | null;
  seatMovedAt: Date | null;
}

/** How a seat is covered: a given payment, the oldest with classes left, free, or none yet. */
export type SeatCoverage = { paymentId: string } | "auto" | "free" | "unpaid";

export type SyncClassSeatError =
  | "studentInClass"
  | "notInClass"
  | "seatIsFree"
  | "seatAlreadyPaid"
  | "seatsExhausted"
  | "paymentNotStudents"
  | "noPaidSeats"
  | "classFull";

export interface SyncClassSeatInput {
  classId: string;
  studentId: string;
  coverage: SeatCoverage;
  addedById: string | null;
  /** "add": create the seat (refuses one already there). "cover": pay an existing unpaid seat. */
  mode: "add" | "cover";
}

/** The lock itself lives in class-locks.ts, shared with the attendance writer; the staff's callers take it from here. */
export { lockClasses };

/** The seats of a payment that count: class not cancelled, seat not moved. */
async function countingSeats(
  db: ClassSeatsWriter,
  paymentId: string,
  cancelledId: number | undefined,
): Promise<number> {
  const seats = await db.classParticipant.findMany({ where: { paymentId, seatMovedAt: null } });
  if (seats.length === 0) return 0;
  const classes = await db.class.findMany({
    where: { id: { in: [...new Set(seats.map((seat) => seat.classId))] } },
    select: { id: true, statusId: true },
  });
  const cancelled = new Set(classes.filter((row) => row.statusId === cancelledId).map((row) => row.id));
  return seats.filter((seat) => !cancelled.has(seat.classId)).length;
}

/** How many of a payment's classes are spent or dated: what `classCount` may never go below. */
export async function countingSeatsOf(db: ClassSeatsWriter, paymentId: string): Promise<number> {
  const ids = await classStatusIds(db);
  return countingSeats(db, paymentId, ids.byCode.get(CLASS_STATUS.CANCELLED));
}

/**
 * The payment a seat will spend, locked: the one asked for, if it is the
 * student's and has a class left, or the student's oldest with one.
 */
async function resolvePayment(
  db: ClassSeatsWriter,
  studentId: string,
  coverage: { paymentId: string } | "auto",
): Promise<{ ok: true; paymentId: string } | { ok: false; code: SyncClassSeatError }> {
  const ids = await classStatusIds(db);
  const cancelledId = ids.byCode.get(CLASS_STATUS.CANCELLED);

  if (coverage === "auto") {
    await db.$queryRaw`SELECT "id" FROM "ClassPayment" WHERE "studentId" = ${studentId} ORDER BY "paidOn", "id" FOR UPDATE`;
    const payments = await db.classPayment.findMany({
      where: { studentId },
      orderBy: [{ paidOn: "asc" }, { id: "asc" }],
      select: { id: true, studentId: true, classCount: true },
    });
    for (const payment of payments) {
      if ((await countingSeats(db, payment.id, cancelledId)) < payment.classCount) {
        return { ok: true, paymentId: payment.id };
      }
    }
    return { ok: false, code: "noPaidSeats" };
  }

  await db.$queryRaw`SELECT "id" FROM "ClassPayment" WHERE "id" = ${coverage.paymentId} FOR UPDATE`;
  const [payment] = await db.classPayment.findMany({
    where: { id: coverage.paymentId },
    select: { id: true, studentId: true, classCount: true },
  });
  if (!payment || payment.studentId !== studentId) return { ok: false, code: "paymentNotStudents" };
  if ((await countingSeats(db, payment.id, cancelledId)) >= payment.classCount) {
    return { ok: false, code: "seatsExhausted" };
  }
  return { ok: true, paymentId: payment.id };
}

/**
 * Adds a student to a class, or pays a seat that was «Sin pago». The class is
 * locked first; a student already there is reported without writing (never
 * left to the unique index: a P2002 inside a transaction aborts it).
 */
export async function syncClassSeat(
  db: ClassSeatsWriter,
  input: SyncClassSeatInput,
): Promise<{ ok: true; paymentId: string | null; isFree: boolean } | { ok: false; code: SyncClassSeatError }> {
  await lockClasses(db, [input.classId]);
  const existing = await db.classParticipant.findUnique({
    where: { classId_userId: { classId: input.classId, userId: input.studentId } },
  });

  if (input.mode === "cover") {
    if (!existing) return { ok: false, code: "notInClass" };
    if (existing.isFree) return { ok: false, code: "seatIsFree" };
    if (existing.paymentId !== null) return { ok: false, code: "seatAlreadyPaid" };
    const ids = await classStatusIds(db);
    const classes = await db.class.findMany({ where: { id: input.classId }, select: { id: true, statusId: true } });
    const statusCode = classes[0] ? (ids.codeOf.get(classes[0].statusId) ?? CLASS_STATUS.SCHEDULED) : null;
    if (
      statusCode === null ||
      !isUnpaidSeat({
        paymentId: existing.paymentId,
        isFree: existing.isFree,
        seatMovedAt: existing.seatMovedAt,
        classStatusCode: statusCode,
      })
    ) {
      return { ok: false, code: "notInClass" };
    }
    if (input.coverage === "free" || input.coverage === "unpaid") {
      throw new Error("syncClassSeat: covering a seat takes a payment");
    }
    const payment = await resolvePayment(db, input.studentId, input.coverage);
    if (!payment.ok) return payment;
    await db.classParticipant.updateMany({
      where: { classId: input.classId, userId: input.studentId },
      data: { paymentId: payment.paymentId },
    });
    return { ok: true, paymentId: payment.paymentId, isFree: false };
  }

  if (existing) return { ok: false, code: "studentInClass" };
  const classRow = await db.class.findUnique({ where: { id: input.classId } });
  if (!classRow) throw new Error(`syncClassSeat: class ${input.classId} does not exist`);
  const formats = await db.classFormat.findMany({ select: { id: true, code: true } });
  const formatCode = formats.find((row) => row.id === classRow.formatId)?.code as ClassFormatCode | undefined;
  if (!formatCode) throw new Error("syncClassSeat: the class has no format");
  const seated = await db.classParticipant.findMany({ where: { classId: input.classId, seatMovedAt: null } });
  if (!canAddParticipants(formatCode, classRow.capacity, seated.length, 1)) return { ok: false, code: "classFull" };

  let paymentId: string | null = null;
  if (input.coverage !== "free" && input.coverage !== "unpaid") {
    const payment = await resolvePayment(db, input.studentId, input.coverage);
    if (!payment.ok) return payment;
    paymentId = payment.paymentId;
  }
  const isFree = input.coverage === "free";
  await db.classParticipant.create({
    data: { classId: input.classId, userId: input.studentId, paymentId, isFree, addedById: input.addedById },
  });
  return { ok: true, paymentId, isFree };
}

/**
 * Takes a student out of a class. Only a seat with no history goes: one with
 * a mark, or one already moved, stays (`removed: false`).
 */
export async function removeClassSeat(
  db: ClassSeatsWriter,
  input: { classId: string; studentId: string },
): Promise<{ removed: boolean }> {
  await lockClasses(db, [input.classId]);
  const result = await db.classParticipant.deleteMany({
    where: { classId: input.classId, userId: input.studentId, attended: null, seatMovedAt: null },
  });
  return { removed: result.count > 0 };
}

export type MoveClassSeatError = "seatNotMovable" | "studentInClass" | "classFull" | "seatsExhausted";

export interface MoveClassSeatInput {
  fromClassId: string;
  studentId: string;
  /** The class the seat goes to, or null to leave it «por programar» in its payment. */
  toClassId: string | null;
  note: string | null;
  actorId: string;
  now: Date;
}

/**
 * Gives a no-show's seat another date, or returns it to its payment. The old
 * row stays as history, marked moved, so it stops counting; the new seat is
 * added with the same coverage and counts instead. The old row is marked
 * BEFORE the new seat is added, so the payment does not look exhausted by the
 * very seat that is leaving; if the destination refuses the seat, the mark is
 * undone and the refusal returned, with nothing written.
 */
export async function moveClassSeat(
  db: ClassSeatsWriter,
  input: MoveClassSeatInput,
): Promise<{ ok: true } | { ok: false; code: MoveClassSeatError }> {
  await lockClasses(db, [input.fromClassId, ...(input.toClassId ? [input.toClassId] : [])]);
  const [ids, seat, fromClass] = await Promise.all([
    classStatusIds(db),
    db.classParticipant.findUnique({
      where: { classId_userId: { classId: input.fromClassId, userId: input.studentId } },
    }),
    db.class.findUnique({ where: { id: input.fromClassId } }),
  ]);
  if (!seat || !fromClass) return { ok: false, code: "seatNotMovable" };
  const phase = classPhase(
    {
      statusCode: ids.codeOf.get(fromClass.statusId) ?? CLASS_STATUS.SCHEDULED,
      scheduledAt: fromClass.scheduledAt,
      endsAt: fromClass.endsAt,
      visibleFrom: null,
      hasLink: false,
    },
    input.now,
  );
  if (!canMoveSeat(seat, phase)) return { ok: false, code: "seatNotMovable" };

  const moved = {
    seatMovedAt: input.now,
    seatMovedById: input.actorId,
    seatMovedToClassId: input.toClassId,
    seatMoveNote: input.note,
  };
  await db.classParticipant.updateMany({
    where: { classId: input.fromClassId, userId: input.studentId },
    data: moved,
  });
  if (input.toClassId === null) return { ok: true };

  const added = await syncClassSeat(db, {
    classId: input.toClassId,
    studentId: input.studentId,
    coverage: seat.paymentId !== null ? { paymentId: seat.paymentId } : seat.isFree ? "free" : "unpaid",
    addedById: input.actorId,
    mode: "add",
  });
  if (added.ok) return { ok: true };
  await db.classParticipant.updateMany({
    where: { classId: input.fromClassId, userId: input.studentId },
    data: { seatMovedAt: null, seatMovedById: null, seatMovedToClassId: null, seatMoveNote: null },
  });
  const code: MoveClassSeatError =
    added.code === "studentInClass" || added.code === "classFull" || added.code === "seatsExhausted"
      ? added.code
      : "seatsExhausted";
  return { ok: false, code };
}
