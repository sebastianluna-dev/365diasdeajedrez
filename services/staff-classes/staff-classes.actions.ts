"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CLASS_FORMAT, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { slotInstant } from "@/services/shared/class-schedule-rules";
import { createClassRecord } from "@/services/shared/class-schedule.service";
import { lockClasses, syncClassSeat } from "@/services/shared/class-seats.service";
import { popupFormDone, popupFormError, readFormValues, type PopupFormState } from "@/services/shared/form-state";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { z } from "zod";
import { transitionClassStatus } from "@/services/shared/class-status.service";
import { formOptionalUrl, formText, parseForm } from "@/services/shared/form-schema";
import { withErrorParam } from "@/services/shared/safe-return-to";

// The staff does NOT own the classes: exactly two support actions and nothing
// else. Blocks, attendance, metadata and participants belong to the teacher —
// if any of those appeared here, two roles would be editing the same thing
// without either being responsible.
//
// These are the OLD screens, kept until phase 6 retires them. The status is
// written only by `transitionClassStatus`; `setRecordingUrl` writes the
// recording directly, a documented exception that phase 5 removes.

const RECORDING_SCHEMA = z.object({ recordingUrl: formOptionalUrl(2000) });
const CANCEL_SCHEMA = z.object({ note: formText(300) });

function fail(path: string, code: string): never {
  redirect(withErrorParam(path, code));
}

/** Adds or corrects the recording's link. */
export async function setRecordingUrl(classId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (!(await allowAction(`${staff.user.id}:class-recording`, 60, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(RECORDING_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "invalid");
  const { recordingUrl } = parsed.data;

  await getPlatformDb().class.update({ where: { id: classId }, data: { recordingUrl } });

  revalidatePath(detailPath);
  revalidatePath(platformRoutes.classDetail(classId));
}

/**
 * Cancels a class from support. It requires a note, kept as the cancellation's
 * reason (`cancelReason`, with who and when): the trace that the cancellation
 * did not come from the teacher, without touching the summary, which is theirs.
 * Cancelling is a class's deletion — there is no physical delete. A class that
 * is already finished or cancelled is not written (`written: false`).
 */
export async function cancelClassAsStaff(classId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (!(await allowAction(`${staff.user.id}:class-cancel`, 60, 60_000))) fail(detailPath, "throttled");

  const parsed = parseForm(CANCEL_SCHEMA, formData);
  if (!parsed.ok) fail(detailPath, "invalid");
  const { note } = parsed.data;

  const { written } = await transitionClassStatus(getPlatformDb(), {
    classId,
    to: CLASS_STATUS.CANCELLED,
    actor: { userId: staff.user.id, role: "staff" },
    now: new Date(),
    cancel: { reason: note, note: null },
  });
  if (!written) fail(detailPath, "status");

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classDetail(classId));
}

const SEAT_WHERE_SCHEMA = z.object({ where: z.enum(["new", "group"]) });
const SEAT_NEW_SCHEMA = z.object({
  teacherId: formText(64),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/),
  duration: z.coerce.number().int().min(15).max(480),
  meetingUrl: formOptionalUrl(2000),
});
const SEAT_GROUP_SCHEMA = z.object({ classId: formText(64) });
const SEAT_FIELDS = ["where", "teacherId", "date", "time", "duration", "meetingUrl", "classId"];

/** A seat the writer refused inside the transaction: thrown so the class created with it rolls back. */
class SeatRefused extends Error {
  constructor(
    readonly field: string,
    readonly code: string,
  ) {
    super(`seat refused: ${code}`);
  }
}

/**
 * Gives a date to a paid class that has none (ADM-6): in a new individual
 * class, created here with its seat, or in a group class with a seat free.
 * The payment's writer refuses a payment that has no class left.
 */
export async function scheduleSeat(
  paymentId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const staff = await requireStaff();
  const values = readFormValues(formData, SEAT_FIELDS);
  if (!(await allowAction(`${staff.user.id}:seat-schedule`, 20, 60_000))) {
    return popupFormError({}, values, { code: "throttled" });
  }
  const where = parseForm(SEAT_WHERE_SCHEMA, formData);
  if (!where.ok) return popupFormError({ where: { code: "invalid" } }, values);

  const db = getPlatformDb();
  const payment = await db.classPayment.findUnique({ where: { id: paymentId }, select: { studentId: true } });
  if (!payment) return popupFormError({}, values, { code: "invalid" });
  const studentId = payment.studentId;

  let target:
    | { kind: "new"; teacherId: string; scheduledAt: Date; durationMin: number; meetingUrl: string | null }
    | { kind: "group"; classId: string };
  if (where.data.where === "new") {
    const parsed = parseForm(SEAT_NEW_SCHEMA, formData);
    if (!parsed.ok) return popupFormError({ [parsed.field]: { code: "invalid" } }, values);
    const scheduledAt = slotInstant(parsed.data.date, parsed.data.time, STUDY_DAY_TIMEZONE);
    if (!scheduledAt) return popupFormError({ date: { code: "invalid" } }, values);
    target = {
      kind: "new",
      teacherId: parsed.data.teacherId,
      scheduledAt,
      durationMin: parsed.data.duration,
      meetingUrl: parsed.data.meetingUrl,
    };
  } else {
    const parsed = parseForm(SEAT_GROUP_SCHEMA, formData);
    if (!parsed.ok) return popupFormError({ classId: { code: "invalid" } }, values);
    target = { kind: "group", classId: parsed.data.classId };
  }

  const outcome = await db
    .$transaction(async (tx) => {
      let classId: string;
      let scheduledAt: Date;
      let durationMin: number;
      if (target.kind === "new") {
        const created = await createClassRecord(tx, {
          teacherId: target.teacherId,
          formatCode: CLASS_FORMAT.INDIVIDUAL,
          capacity: null,
          title: null,
          description: null,
          scheduledAt: target.scheduledAt,
          durationMin: target.durationMin,
          meetingUrl: target.meetingUrl,
          meetingVisibleFromChosen: null,
          createdById: staff.user.id,
        });
        if (!created.ok) return { ok: false as const, field: "date", code: created.code };
        classId = created.id;
        scheduledAt = target.scheduledAt;
        durationMin = target.durationMin;
      } else {
        await lockClasses(tx, [target.classId]);
        const row = await tx.class.findUnique({
          where: { id: target.classId },
          select: { scheduledAt: true, durationMin: true },
        });
        if (!row) return { ok: false as const, field: "classId", code: "invalid" };
        classId = target.classId;
        scheduledAt = row.scheduledAt;
        durationMin = row.durationMin;
      }
      const seated = await syncClassSeat(tx, {
        classId,
        studentId,
        coverage: { paymentId },
        addedById: staff.user.id,
        mode: "add",
      });
      // A refusal must take the class created above with it.
      if (!seated.ok) throw new SeatRefused(target.kind === "new" ? "date" : "classId", seated.code);
      return { ok: true as const, scheduledAt, durationMin };
    })
    .catch((error: unknown) => {
      if (error instanceof SeatRefused) return { ok: false as const, field: error.field, code: error.code };
      throw error;
    });
  if (!outcome.ok) return popupFormError({ [outcome.field]: { code: outcome.code } }, values);

  revalidatePath(staffRoutes.studentPayments(studentId));
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classes);
  return popupFormDone("seatScheduled", [Math.round(outcome.scheduledAt.getTime() / 60_000), outcome.durationMin]);
}
