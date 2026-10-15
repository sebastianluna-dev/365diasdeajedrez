"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLASS_FORMAT } from "@/constants/platform/class-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { createClassRecord } from "@/services/shared/class-schedule.service";
import { countingSeatsOf, lockClasses, syncClassSeat } from "@/services/shared/class-seats.service";
import {
  popupFormDone,
  popupFormError,
  readFormValues,
  type FieldError,
  type PopupFormState,
} from "@/services/shared/form-state";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { withErrorParam, withNoticeParam } from "@/services/shared/safe-return-to";
import { readPaymentFields, readRegisterPaymentForm } from "./payment-form";
import { paymentStarted, getPaymentContext, getTeacherBusy } from "./staff-payments.service";
import type { BusySlotView, PaymentContext } from "./staff-payments.types";

// The staff's writes about money. Every action opens with `requireStaff()`
// and a one-minute window of attempts, which is what «Demasiados intentos.
// Espera un minuto.» promises. The payment's row is written here — the only
// file that may — and everything a payment does to a class goes through the
// writers of services/shared/: the seats it covers, the classes it dates.

const WINDOW_MS = 60_000;
const BUSY_WEEKS_MS = 12 * 7 * 24 * 60 * 60 * 1000;

/** The fields «Registrar pago» gets back on an error, so it opens with them again. */
const REGISTER_FIELDS = [
  "studentId",
  "amount",
  "currency",
  "paidOn",
  "classCount",
  "reference",
  "note",
  "when",
  "meetingUrl",
  "cover",
];
const EDIT_FIELDS = ["amount", "currency", "paidOn", "classCount", "reference", "note"];

/** A refusal inside the transaction: thrown so the writes roll back, and turned into a field error outside. */
class PaymentRefused extends Error {
  constructor(
    readonly field: string,
    readonly fieldError: FieldError,
  ) {
    super(`payment refused: ${field} ${fieldError.code}`);
  }
}

function revalidateStudent(studentId: string): void {
  revalidatePath(staffRoutes.studentPayments(studentId));
  revalidatePath(staffRoutes.studentDetail(studentId));
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classes);
}

/** What «Registrar pago» needs about a student, read when the student is chosen. */
export async function loadPaymentContext(studentId: string): Promise<PaymentContext | null> {
  await requireStaff();
  return getPaymentContext(studentId, new Date());
}

/** A teacher's calendar for the next twelve weeks, read when the teacher of a class changes. */
export async function loadTeacherBusy(teacherId: string): Promise<BusySlotView[]> {
  await requireStaff();
  const now = new Date();
  return getTeacherBusy(teacherId, now, new Date(now.getTime() + BUSY_WEEKS_MS));
}

async function currencyIdOf(db: Prisma.TransactionClient, code: string): Promise<number> {
  const row = await db.currency.findUnique({ where: { code }, select: { id: true } });
  if (!row) throw new PaymentRefused("currency", { code: "invalid" });
  return row.id;
}

/**
 * Registers a payment and, in the same transaction, what it does to the
 * student's classes: it covers the «Sin pago» classes ticked, creates the
 * dated classes with their seats, and seats the student in the group classes
 * chosen. Every Class row it touches is locked first, by id. A writer's
 * refusal undoes everything and comes back as a field error, with what was
 * typed, so the popup opens on it again.
 */
export async function registerPayment(prev: PopupFormState, formData: FormData): Promise<PopupFormState> {
  void prev;
  const { user } = await requireStaff();
  const values = readFormValues(formData, REGISTER_FIELDS);
  if (!(await allowAction(`${user.id}:payment-register`, 20, WINDOW_MS))) {
    return popupFormError({}, values, { code: "throttled" });
  }
  const now = new Date();
  const read = readRegisterPaymentForm(formData, now);
  if (!read.ok) return popupFormError(read.fieldErrors, values);
  const form = read.data;

  const db = getPlatformDb();
  const student = await db.user.findUnique({ where: { id: form.studentId }, select: { id: true } });
  if (!student) return popupFormError({ studentId: { code: "invalid" } }, values);

  try {
    await db.$transaction(async (tx) => {
      const payment = await tx.classPayment.create({
        data: {
          studentId: form.studentId,
          amount: form.amount,
          currencyId: await currencyIdOf(tx, form.currency),
          paidOn: new Date(`${form.paidOn}T00:00:00.000Z`),
          classCount: form.classCount,
          reference: form.reference,
          note: form.note,
          recordedById: user.id,
        },
        select: { id: true },
      });

      const groupIds = form.slots.flatMap((slot) => (slot.kind === "group" ? [slot.classId] : []));
      await lockClasses(tx, [...form.cover, ...groupIds]);

      for (const classId of form.cover) {
        const covered = await syncClassSeat(tx, {
          classId,
          studentId: form.studentId,
          coverage: { paymentId: payment.id },
          addedById: user.id,
          mode: "cover",
        });
        if (!covered.ok) throw new PaymentRefused("cover", { code: covered.code });
      }

      for (const [index, slot] of form.slots.entries()) {
        if (slot.kind === "later") continue;
        let classId: string;
        if (slot.kind === "dated") {
          const created = await createClassRecord(tx, {
            teacherId: slot.teacherId,
            formatCode: CLASS_FORMAT.INDIVIDUAL,
            capacity: null,
            title: null,
            description: null,
            scheduledAt: slot.scheduledAt,
            durationMin: slot.durationMin,
            meetingUrl: form.meetingUrl,
            meetingVisibleFromChosen: null,
            createdById: user.id,
          });
          if (!created.ok) throw new PaymentRefused(`slot.${index}`, { code: created.code });
          classId = created.id;
        } else {
          classId = slot.classId;
        }
        const seated = await syncClassSeat(tx, {
          classId,
          studentId: form.studentId,
          coverage: { paymentId: payment.id },
          addedById: user.id,
          mode: "add",
        });
        if (!seated.ok) throw new PaymentRefused(`slot.${index}`, { code: seated.code });
      }
    });
  } catch (error) {
    if (error instanceof PaymentRefused) return popupFormError({ [error.field]: error.fieldError }, values);
    if (isUniqueConstraintError(error, "ClassParticipant_pkey", "classId")) {
      return popupFormError({ classCount: { code: "studentInClass" } }, values);
    }
    throw error;
  }

  revalidateStudent(form.studentId);
  return popupFormDone("paymentRegistered", [form.classCount, form.dated, form.later]);
}

/** Changes a payment's own fields; its classes never go below the seats that count. */
export async function updatePayment(
  paymentId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const { user } = await requireStaff();
  const values = readFormValues(formData, EDIT_FIELDS);
  if (!(await allowAction(`${user.id}:payment-update`, 20, WINDOW_MS))) {
    return popupFormError({}, values, { code: "throttled" });
  }
  const read = readPaymentFields(formData, new Date());
  if (!read.ok) return popupFormError(read.fieldErrors, values);
  const fields = read.data;

  const db = getPlatformDb();
  const outcome = await db.$transaction(async (tx) => {
    const payment = await tx.classPayment.findUnique({
      where: { id: paymentId },
      select: { id: true, studentId: true },
    });
    if (!payment) return { ok: false as const, field: "classCount", code: "invalid" };
    const counting = await countingSeatsOf(tx, paymentId);
    if (fields.classCount < counting) {
      return { ok: false as const, field: "classCount", code: "classCountBelowSeats", args: { counting } };
    }
    await tx.classPayment.update({
      where: { id: paymentId },
      data: {
        amount: fields.amount,
        currencyId: await currencyIdOf(tx, fields.currency),
        paidOn: new Date(`${fields.paidOn}T00:00:00.000Z`),
        classCount: fields.classCount,
        reference: fields.reference,
        note: fields.note,
      },
    });
    return { ok: true as const, studentId: payment.studentId };
  });
  if (!outcome.ok) {
    return popupFormError(
      { [outcome.field]: { code: outcome.code, ...(outcome.args ? { args: outcome.args } : {}) } },
      values,
    );
  }

  revalidateStudent(outcome.studentId);
  return popupFormDone("paymentUpdated");
}

/**
 * Deletes a payment nothing of which was given: its seats stay, «Sin pago»
 * (the relation sets null). From the confirmation popup; it redirects with
 * the notice.
 */
export async function deletePayment(paymentId: string, formData: FormData): Promise<void> {
  const { user } = await requireStaff();
  const db = getPlatformDb();
  const payment = await db.classPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      studentId: true,
      seats: {
        select: {
          classId: true,
          attended: true,
          seatMovedAt: true,
          seatMovedToClassId: true,
          isFree: true,
          paymentId: true,
          class: {
            select: {
              id: true,
              title: true,
              scheduledAt: true,
              endsAt: true,
              durationMin: true,
              meetingUrl: true,
              meetingUrlVisibleFrom: true,
              status: { select: { code: true } },
              format: { select: { code: true } },
              teacher: { select: { displayName: true } },
            },
          },
        },
      },
    },
  });
  if (!payment) redirect(withErrorParam(staffRoutes.students, "invalid"));
  const path = staffRoutes.studentPayments(payment.studentId);
  if (!(await allowAction(`${user.id}:payment-delete`, 20, WINDOW_MS))) redirect(withErrorParam(path, "throttled"));
  // The confirmation popup is the gate on screen; the gate that holds for a
  // direct POST too is below: nothing of the payment may have been given.
  void formData;

  const now = new Date();
  const seats = payment.seats.map((seat) => ({
    ...seat,
    class: {
      ...seat.class,
      statusCode: seat.class.status.code as "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED",
      formatCode: seat.class.format.code,
      teacherName: seat.class.teacher.displayName,
      studentNames: [],
    },
  }));
  if (paymentStarted(seats, payment.id, now)) redirect(withErrorParam(path, "paymentStarted"));

  const leftUnpaid = seats.filter(
    (seat) => seat.seatMovedAt === null && seat.class.statusCode !== "CANCELLED" && seat.paymentId === payment.id,
  ).length;
  await db.classPayment.delete({ where: { id: paymentId } });

  revalidateStudent(payment.studentId);
  redirect(withNoticeParam(path, "paymentDeleted", [leftUnpaid]));
}
