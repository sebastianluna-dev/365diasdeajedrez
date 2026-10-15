"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CLASS_FORMAT, CLASS_PHASE, CLASS_STATUS, type ClassFormatCode } from "@/constants/platform/class-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes, staffRoutes, teacherRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { recordAttendance } from "@/services/shared/class-attendance.service";
import { GROUP_CAPACITY_MAX, GROUP_CAPACITY_MIN, editableClassFields } from "@/services/shared/class-rules";
import { slotInstant } from "@/services/shared/class-schedule-rules";
import { createClassRecord, syncClassMeeting, syncClassSchedule } from "@/services/shared/class-schedule.service";
import {
  lockClasses,
  moveClassSeat,
  removeClassSeat,
  syncClassSeat,
  type SeatCoverage,
} from "@/services/shared/class-seats.service";
import { transitionClassStatus } from "@/services/shared/class-status.service";
import { formOptionalUrl, formText, parseForm } from "@/services/shared/form-schema";
import {
  popupFormDone,
  popupFormError,
  readFormValues,
  type FieldError,
  type PopupFormState,
} from "@/services/shared/form-state";
import { meetingVisibleChoice } from "@/services/shared/meeting-visible-from";
import { withErrorParam, withNoticeParam } from "@/services/shared/safe-return-to";
import { readClassPhase } from "./staff-classes.service";

// The staff's writes about classes: creating one, dating it, who gives it,
// how it is joined, who is in it, cancelling it, and — after it was given —
// correcting a mark with a reason and giving a no-show another date. Every
// action opens with `requireStaff()` and a one-minute window of attempts,
// checks what the class's phase allows (`editableClassFields`) and writes
// only through the writers of services/shared/: the only column written here
// by hand is the teacher (`setClassTeacher`), which has no derived twin.
//
// The popup actions return a `PopupFormState`; the ones a confirmation runs
// (`removeClassParticipant`, `cancelClass`) redirect with the notice.

const WINDOW_MS = 60_000;
const DAY = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/);
const TIME = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}$/);
const DURATION = z.coerce.number().int().min(15).max(480);
const VISIBLE_FROM = z.string().trim().min(1).max(8);
const COVERAGE = z.enum(["auto", "unpaid", "free"]);

/** A refusal inside the transaction: thrown so the writes roll back, and turned into a field error outside. */
class ClassRefused extends Error {
  constructor(
    readonly field: string,
    readonly fieldError: FieldError,
  ) {
    super(`class refused: ${field} ${fieldError.code}`);
  }
}

function refuse(field: string, code: string, args?: Record<string, string | number>): never {
  throw new ClassRefused(field, { code, ...(args ? { args } : {}) });
}

function revalidateClass(classId: string): void {
  revalidatePath(staffRoutes.staffClassDetail(classId));
  revalidatePath(staffRoutes.classes);
  revalidatePath(platformRoutes.classes);
  revalidatePath(platformRoutes.classDetail(classId));
  revalidatePath(teacherRoutes.classes);
  revalidatePath(teacherRoutes.classDetail(classId));
}

async function throttled(key: string, limit: number): Promise<boolean> {
  const staff = await requireStaff();
  return !(await allowAction(`${staff.user.id}:${key}`, limit, WINDOW_MS));
}

/** The coverage chosen for a student, from `coverage.<id>`; «auto» when none was sent. */
function coverageOf(formData: FormData, studentId: string): SeatCoverage | null {
  const raw = formData.get(`coverage.${studentId}`);
  if (raw === null) return "auto";
  const parsed = COVERAGE.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/** The ids a set of check cards sent under `name`. */
function idsOf(formData: FormData, name: string): string[] {
  return [
    ...new Set(formData.getAll(name).filter((value): value is string => typeof value === "string" && value.length > 0)),
  ];
}

const CREATE_SCHEMA = z.object({
  format: z.enum(["individual", "group"]),
  title: z.string().trim().max(200).default(""),
  description: z.string().trim().max(2000).default(""),
  teacherId: formText(64),
  date: DAY,
  time: TIME,
  duration: DURATION,
  meetingUrl: formOptionalUrl(2000),
  visibleFrom: VISIBLE_FROM.default("30"),
  capacity: z.coerce.number().int().min(GROUP_CAPACITY_MIN).max(GROUP_CAPACITY_MAX).optional(),
  studentId: z.string().trim().max(64).optional(),
});
const CREATE_FIELDS = [
  "format",
  "title",
  "description",
  "teacherId",
  "date",
  "time",
  "duration",
  "meetingUrl",
  "visibleFrom",
  "capacity",
  "studentId",
  "students",
];

/**
 * «Crear clase» (ADM-3): the row of the class with `createClassRecord`, then
 * a seat per student with the coverage the staff chose for each (D6): «Con
 * su pago» spends the oldest payment with a class left (D13), «Con el pago
 * pendiente» leaves the seat «Sin pago», «Gratis» charges nobody. One
 * transaction: a seat the writer refuses takes the class with it. On
 * success it redirects to the record with `?aviso=classCreated`.
 */
export async function createClass(prev: PopupFormState, formData: FormData): Promise<PopupFormState> {
  void prev;
  const staff = await requireStaff();
  const coverageNames = [...formData.keys()].filter((key) => key.startsWith("coverage."));
  const values = readFormValues(formData, [...CREATE_FIELDS, ...coverageNames]);
  if (await throttled("class-create", 20)) return popupFormError({}, values, { code: "throttled" });

  const parsed = parseForm(CREATE_SCHEMA, formData);
  if (!parsed.ok) return popupFormError({ [parsed.field]: { code: "invalid" } }, values);
  const data = parsed.data;
  const formatCode: ClassFormatCode = data.format === "group" ? CLASS_FORMAT.GROUP : CLASS_FORMAT.INDIVIDUAL;
  const now = new Date();

  const scheduledAt = slotInstant(data.date, data.time, STUDY_DAY_TIMEZONE);
  if (!scheduledAt) return popupFormError({ date: { code: "schedule" } }, values);
  const visible = meetingVisibleChoice(data.visibleFrom, scheduledAt, now, null);
  if (!visible.ok) return popupFormError({ visibleFrom: { code: "visibleFrom" } }, values);

  const studentIds =
    formatCode === CLASS_FORMAT.GROUP ? idsOf(formData, "students") : data.studentId ? [data.studentId] : [];
  if (formatCode === CLASS_FORMAT.INDIVIDUAL && studentIds.length === 0) {
    return popupFormError({ studentId: { code: "studentRequired" } }, values);
  }
  if (formatCode === CLASS_FORMAT.GROUP) {
    if (studentIds.length === 0) return popupFormError({ students: { code: "studentsRequired" } }, values);
    if (data.capacity !== undefined && studentIds.length > data.capacity) {
      return popupFormError(
        { students: { code: "tooManyStudents", args: { chosen: studentIds.length, capacity: data.capacity } } },
        values,
      );
    }
  }
  const coverages = new Map<string, SeatCoverage>();
  for (const studentId of studentIds) {
    const coverage = coverageOf(formData, studentId);
    if (!coverage) return popupFormError({ [`coverage.${studentId}`]: { code: "invalid" } }, values);
    coverages.set(studentId, coverage);
  }

  const teacher = await getPlatformDb().teacher.findUnique({
    where: { id: data.teacherId },
    select: { isActive: true },
  });
  if (!teacher || !teacher.isActive) return popupFormError({ teacherId: { code: "teacherInactive" } }, values);

  const outcome = await getPlatformDb()
    .$transaction(async (tx) => {
      const created = await createClassRecord(tx, {
        teacherId: data.teacherId,
        formatCode,
        capacity: formatCode === CLASS_FORMAT.GROUP ? (data.capacity ?? null) : null,
        title: data.title || null,
        description: data.description || null,
        scheduledAt,
        durationMin: data.duration,
        meetingUrl: data.meetingUrl,
        meetingVisibleFromChosen: visible.chosen,
        createdById: staff.user.id,
      });
      if (!created.ok) {
        refuse(
          created.code === "groupTitle" ? "title" : created.code === "capacity" ? "capacity" : "visibleFrom",
          created.code,
        );
      }
      await lockClasses(tx, [created.id]);
      for (const studentId of studentIds) {
        const seated = await syncClassSeat(tx, {
          classId: created.id,
          studentId,
          coverage: coverages.get(studentId) ?? "auto",
          addedById: staff.user.id,
          mode: "add",
        });
        if (!seated.ok) refuse(`coverage.${studentId}`, seated.code);
      }
      return { ok: true as const, classId: created.id };
    })
    .catch((error: unknown) => {
      if (error instanceof ClassRefused)
        return { ok: false as const, field: error.field, fieldError: error.fieldError };
      throw error;
    });
  if (!outcome.ok) return popupFormError({ [outcome.field]: outcome.fieldError }, values);

  revalidateClass(outcome.classId);
  for (const studentId of studentIds) revalidatePath(staffRoutes.studentPayments(studentId));
  redirect(withNoticeParam(staffRoutes.staffClassDetail(outcome.classId), "classCreated"));
}

const RESCHEDULE_SCHEMA = z.object({
  date: DAY,
  time: TIME,
  duration: DURATION,
  note: z.string().trim().max(300).default(""),
});

/** «Reprogramar» the whole class (ADM-4): `syncClassSchedule`, with the note the students read. */
export async function rescheduleClass(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const staff = await requireStaff();
  const values = readFormValues(formData, ["date", "time", "duration", "note"]);
  if (await throttled("class-reschedule", 30)) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(RESCHEDULE_SCHEMA, formData);
  if (!parsed.ok) return popupFormError({ [parsed.field]: { code: "invalid" } }, values);
  const now = new Date();
  const current = await readClassPhase(classId, now);
  if (!current || !editableClassFields(current.phase).reschedule) {
    return popupFormError({}, values, { code: "notEditable" });
  }
  const scheduledAt = slotInstant(parsed.data.date, parsed.data.time, STUDY_DAY_TIMEZONE);
  if (!scheduledAt) return popupFormError({ date: { code: "schedule" } }, values);

  const result = await syncClassSchedule(
    getPlatformDb(),
    classId,
    { scheduledAt, durationMin: parsed.data.duration, note: parsed.data.note || null },
    staff.user.id,
    now,
  );
  if (!result.ok) return popupFormError({ date: { code: result.code } }, values);

  revalidateClass(classId);
  return popupFormDone("classRescheduled");
}

const TEACHER_SCHEMA = z.object({ teacherId: formText(64) });

/** «Cambiar profesor» (ADM-4): an active teacher; the content stays with the class. */
export async function setClassTeacher(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  await requireStaff();
  const values = readFormValues(formData, ["teacherId"]);
  if (await throttled("class-teacher", 30)) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(TEACHER_SCHEMA, formData);
  if (!parsed.ok) return popupFormError({ teacherId: { code: "invalid" } }, values);
  const current = await readClassPhase(classId, new Date());
  if (!current || !editableClassFields(current.phase).changeTeacher) {
    return popupFormError({}, values, { code: "notEditable" });
  }
  const db = getPlatformDb();
  const teacher = await db.teacher.findUnique({ where: { id: parsed.data.teacherId }, select: { isActive: true } });
  if (!teacher || !teacher.isActive) return popupFormError({ teacherId: { code: "teacherInactive" } }, values);

  await db.class.update({ where: { id: classId }, data: { teacherId: parsed.data.teacherId } });
  revalidateClass(classId);
  return popupFormDone("teacherChanged");
}

const MEETING_SCHEMA = z.object({ meetingUrl: formOptionalUrl(2000), visibleFrom: VISIBLE_FROM.default("30") });

/** The meeting link and when the students see it (ADM-1's «Agregar», ADM-4's «Cambiar»). */
export async function setClassMeeting(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  await requireStaff();
  const values = readFormValues(formData, ["meetingUrl", "visibleFrom"]);
  if (await throttled("class-meeting", 60)) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(MEETING_SCHEMA, formData);
  if (!parsed.ok)
    return popupFormError(
      { [parsed.field]: { code: parsed.field === "meetingUrl" ? "meetingUrl" : "invalid" } },
      values,
    );
  if (!parsed.data.meetingUrl) return popupFormError({ meetingUrl: { code: "meetingUrl" } }, values);
  const now = new Date();
  const current = await readClassPhase(classId, now);
  if (!current || !editableClassFields(current.phase).changeMeeting) {
    return popupFormError({}, values, { code: "notEditable" });
  }
  const visible = meetingVisibleChoice(
    parsed.data.visibleFrom,
    current.scheduledAt,
    now,
    current.meetingUrlVisibleFrom,
  );
  if (!visible.ok) return popupFormError({ visibleFrom: { code: "visibleFrom" } }, values);

  const result = await syncClassMeeting(getPlatformDb(), classId, {
    meetingUrl: parsed.data.meetingUrl,
    visibleFromChosen: visible.chosen,
  });
  if (!result.ok) return popupFormError({ visibleFrom: { code: result.code } }, values);

  revalidateClass(classId);
  return popupFormDone(current.meetingUrl ? "meetingChanged" : "meetingAdded", [classId]);
}

/** «Agregar alumnos» (ADM-4): a seat per student, each with its coverage (D6), in one transaction. */
export async function addClassParticipants(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const staff = await requireStaff();
  const coverageNames = [...formData.keys()].filter((key) => key.startsWith("coverage."));
  const values = readFormValues(formData, ["students", ...coverageNames]);
  if (await throttled("class-add", 30)) return popupFormError({}, values, { code: "throttled" });
  const studentIds = idsOf(formData, "students");
  if (studentIds.length === 0) return popupFormError({ students: { code: "studentsRequired" } }, values);
  const current = await readClassPhase(classId, new Date());
  if (!current || !editableClassFields(current.phase).addStudents) {
    return popupFormError({}, values, { code: "notEditable" });
  }
  const coverages = new Map<string, SeatCoverage>();
  for (const studentId of studentIds) {
    const coverage = coverageOf(formData, studentId);
    if (!coverage) return popupFormError({ [`coverage.${studentId}`]: { code: "invalid" } }, values);
    coverages.set(studentId, coverage);
  }

  const outcome = await getPlatformDb()
    .$transaction(async (tx) => {
      await lockClasses(tx, [classId]);
      for (const studentId of studentIds) {
        const seated = await syncClassSeat(tx, {
          classId,
          studentId,
          coverage: coverages.get(studentId) ?? "auto",
          addedById: staff.user.id,
          mode: "add",
        });
        if (!seated.ok) refuse(seated.code === "classFull" ? "students" : `coverage.${studentId}`, seated.code);
      }
      return { ok: true as const };
    })
    .catch((error: unknown) => {
      if (error instanceof ClassRefused)
        return { ok: false as const, field: error.field, fieldError: error.fieldError };
      throw error;
    });
  if (!outcome.ok) return popupFormError({ [outcome.field]: outcome.fieldError }, values);

  revalidateClass(classId);
  for (const studentId of studentIds) revalidatePath(staffRoutes.studentPayments(studentId));
  return popupFormDone("participantsAdded", [studentIds.length]);
}

/** «Quitar» a student (ADM-4): only a seat with no mark and never moved goes; the seat returns to its payment. */
export async function removeClassParticipant(classId: string, studentId: string, formData: FormData): Promise<void> {
  void formData;
  await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (await throttled("class-remove", 30)) redirect(withErrorParam(detailPath, "throttled"));
  const current = await readClassPhase(classId, new Date());
  if (!current || !editableClassFields(current.phase).removeStudents)
    redirect(withErrorParam(detailPath, "notEditable"));

  const { removed } = await getPlatformDb().$transaction((tx) => removeClassSeat(tx, { classId, studentId }));
  if (!removed) redirect(withErrorParam(detailPath, "seatNotRemovable"));

  revalidateClass(classId);
  revalidatePath(staffRoutes.studentPayments(studentId));
  redirect(withNoticeParam(detailPath, "participantRemoved"));
}

const CANCEL_SCHEMA = z.object({ reason: formText(300), note: z.string().trim().max(300).default("") });

/**
 * «Cancelar la clase» (ADM-5): `transitionClassStatus` with the staff's
 * role, the reason (internal) and the note the students read. The paid
 * seats go back to their payments by the mere fact of the cancellation
 * (`paymentSeats` no longer counts them); the notice says how many.
 */
export async function cancelClass(classId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.staffClassDetail(classId);
  if (await throttled("class-cancel", 30)) redirect(withErrorParam(detailPath, "throttled"));
  const parsed = parseForm(CANCEL_SCHEMA, formData);
  if (!parsed.ok) redirect(withErrorParam(detailPath, "reasonRequired"));
  const now = new Date();
  const current = await readClassPhase(classId, now);
  if (!current || !editableClassFields(current.phase).cancel) redirect(withErrorParam(detailPath, "notEditable"));

  const db = getPlatformDb();
  const returned = await db.$transaction(async (tx) => {
    await lockClasses(tx, [classId]);
    const paid = await tx.classParticipant.count({ where: { classId, seatMovedAt: null, paymentId: { not: null } } });
    const { written } = await transitionClassStatus(tx, {
      classId,
      to: CLASS_STATUS.CANCELLED,
      actor: { userId: staff.user.id, role: "staff" },
      now,
      cancel: { reason: parsed.data.reason, note: parsed.data.note || null },
    });
    return written ? paid : null;
  });
  if (returned === null) redirect(withErrorParam(detailPath, "classClosed"));

  revalidateClass(classId);
  const seats = await db.classParticipant.findMany({ where: { classId }, select: { userId: true } });
  for (const seat of seats) revalidatePath(staffRoutes.studentPayments(seat.userId));
  redirect(withNoticeParam(detailPath, "classCancelled", [returned]));
}

const ATTENDANCE_SCHEMA = z.object({ attended: z.enum(["yes", "no"]), reason: formText(300) });

/** «Cambiar la asistencia» (ADM-9): the staff's override after a report, with its reason, logged (D2). */
export async function changeAttendanceAsStaff(
  classId: string,
  studentId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const staff = await requireStaff();
  const values = readFormValues(formData, ["attended", "reason"]);
  if (await throttled("class-attendance", 30)) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(ATTENDANCE_SCHEMA, formData);
  if (!parsed.ok) {
    return popupFormError(
      { [parsed.field]: { code: parsed.field === "attended" ? "attendanceRequired" : "reasonRequired" } },
      values,
    );
  }
  const now = new Date();
  const result = await getPlatformDb().$transaction((tx) =>
    recordAttendance(tx, {
      classId,
      marks: [{ studentId, attended: parsed.data.attended === "yes" }],
      actor: { userId: staff.user.id, role: "staff" },
      mode: "override",
      reason: parsed.data.reason,
      now,
    }),
  );
  if (!result.ok) {
    const field = result.code === "reasonRequired" ? "reason" : "attended";
    return popupFormError({ [field]: { code: result.code } }, values);
  }

  revalidateClass(classId);
  revalidatePath(platformRoutes.dashboard);
  return popupFormDone("attendanceChanged", [studentId]);
}

const STAFF_FINALIZE_SCHEMA = z.object({ reason: formText(300) });

/**
 * «Finalizar la clase en nombre de GM Profesor Demo» (D1): only once the
 * class ended and nobody finalized it, only the attendance, always with a
 * reason the teacher reads — the marks stay theirs to change.
 */
export async function finalizeClassAsStaff(
  classId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const staff = await requireStaff();
  const marksSent = [...formData.keys()].filter((key) => key.startsWith("attendance."));
  const values = readFormValues(formData, ["reason", ...marksSent]);
  if (await throttled("class-finalize", 20)) return popupFormError({}, values, { code: "throttled" });
  const parsed = parseForm(STAFF_FINALIZE_SCHEMA, formData);
  if (!parsed.ok) return popupFormError({ reason: { code: "reasonRequired" } }, values);
  const now = new Date();
  const current = await readClassPhase(classId, now);
  if (!current || current.phase !== CLASS_PHASE.AWAITING_CLOSE)
    return popupFormError({}, values, { code: "notEditable" });

  const db = getPlatformDb();
  const seats = await db.classParticipant.findMany({ where: { classId, seatMovedAt: null }, select: { userId: true } });
  const marks: { studentId: string; attended: boolean }[] = [];
  const missing: string[] = [];
  for (const seat of seats) {
    const value = formData.get(`attendance.${seat.userId}`);
    if (value === "yes" || value === "no") marks.push({ studentId: seat.userId, attended: value === "yes" });
    else missing.push(seat.userId);
  }
  if (missing.length > 0) {
    return popupFormError(
      Object.fromEntries(missing.map((id) => [`attendance.${id}`, { code: "missingMark" }])),
      values,
      { code: "missingMark" },
    );
  }

  const outcome = await db
    .$transaction(async (tx) => {
      const marked = await recordAttendance(tx, {
        classId,
        marks,
        actor: { userId: staff.user.id, role: "staff" },
        mode: "finalize",
        reason: parsed.data.reason,
        now,
      });
      if (!marked.ok) return { ok: false as const, code: marked.code };
      const closed = await transitionClassStatus(tx, {
        classId,
        to: CLASS_STATUS.COMPLETED,
        actor: { userId: staff.user.id, role: "staff" },
        now,
      });
      if (!closed.written) refuse("reason", "classClosed");
      return { ok: true as const };
    })
    .catch((error: unknown) => {
      if (error instanceof ClassRefused) return { ok: false as const, code: error.fieldError.code };
      throw error;
    });
  if (!outcome.ok) return popupFormError({}, values, { code: outcome.code });

  revalidateClass(classId);
  revalidatePath(platformRoutes.dashboard);
  return popupFormDone("classFinalized");
}

const SEAT_WHERE_SCHEMA = z.object({ where: z.enum(["new", "group", "later"]) });
const SEAT_NEW_SCHEMA = z.object({
  teacherId: z.string().trim().max(64).optional(),
  date: DAY,
  time: TIME,
  duration: DURATION,
  note: z.string().trim().max(300).default(""),
});
const SEAT_GROUP_SCHEMA = z.object({ classId: formText(64), note: z.string().trim().max(300).default("") });
const SEAT_FIELDS = ["where", "teacherId", "date", "time", "duration", "note", "classId"];

/**
 * «Reprogramar» a no-show's seat (ADM-10): in a new individual class made
 * here — the old class's teacher (or the one chosen when that teacher was
 * deactivated), topic, description and link —, in a group class with a
 * seat free, or back to its payment («Dejarla por programar», D4). The move
 * keeps the seat's coverage: it spends no other class.
 */
export async function rescheduleStudentSeat(
  classId: string,
  studentId: string,
  prev: PopupFormState,
  formData: FormData,
): Promise<PopupFormState> {
  void prev;
  const staff = await requireStaff();
  const values = readFormValues(formData, SEAT_FIELDS);
  if (await throttled("seat-move", 20)) return popupFormError({}, values, { code: "throttled" });
  const where = parseForm(SEAT_WHERE_SCHEMA, formData);
  if (!where.ok) return popupFormError({ where: { code: "invalid" } }, values);
  const now = new Date();
  const current = await readClassPhase(classId, now);
  if (!current || !editableClassFields(current.phase).moveSeat) {
    return popupFormError({}, values, { code: "notEditable" });
  }

  const db = getPlatformDb();
  let target:
    | { kind: "new"; teacherId: string; scheduledAt: Date; durationMin: number; note: string | null }
    | { kind: "group"; classId: string; note: string | null }
    | { kind: "later" };
  if (where.data.where === "new") {
    const parsed = parseForm(SEAT_NEW_SCHEMA, formData);
    if (!parsed.ok) return popupFormError({ [parsed.field]: { code: "invalid" } }, values);
    const scheduledAt = slotInstant(parsed.data.date, parsed.data.time, STUDY_DAY_TIMEZONE);
    if (!scheduledAt) return popupFormError({ date: { code: "schedule" } }, values);
    const teacherId = parsed.data.teacherId || current.teacherId;
    const teacher = await db.teacher.findUnique({ where: { id: teacherId }, select: { isActive: true } });
    if (!teacher || !teacher.isActive) return popupFormError({ teacherId: { code: "teacherInactive" } }, values);
    target = { kind: "new", teacherId, scheduledAt, durationMin: parsed.data.duration, note: parsed.data.note || null };
  } else if (where.data.where === "group") {
    const parsed = parseForm(SEAT_GROUP_SCHEMA, formData);
    if (!parsed.ok) return popupFormError({ classId: { code: "invalid" } }, values);
    target = { kind: "group", classId: parsed.data.classId, note: parsed.data.note || null };
  } else {
    target = { kind: "later" };
  }

  const outcome = await db
    .$transaction(async (tx) => {
      let toClassId: string | null = null;
      let when: { scheduledAt: Date; durationMin: number } | null = null;
      if (target.kind === "new") {
        const created = await createClassRecord(tx, {
          teacherId: target.teacherId,
          formatCode: CLASS_FORMAT.INDIVIDUAL,
          capacity: null,
          title: current.title,
          description: current.description,
          scheduledAt: target.scheduledAt,
          durationMin: target.durationMin,
          meetingUrl: current.meetingUrl,
          meetingVisibleFromChosen: null,
          createdById: staff.user.id,
        });
        if (!created.ok) refuse("date", created.code);
        toClassId = created.id;
        when = { scheduledAt: target.scheduledAt, durationMin: target.durationMin };
      } else if (target.kind === "group") {
        await lockClasses(tx, [classId, target.classId]);
        const row = await tx.class.findUnique({
          where: { id: target.classId },
          select: { scheduledAt: true, durationMin: true },
        });
        if (!row) refuse("classId", "invalid");
        toClassId = target.classId;
        when = row;
      }
      const moved = await moveClassSeat(tx, {
        fromClassId: classId,
        studentId,
        toClassId,
        note: target.kind === "later" ? null : target.note,
        actorId: staff.user.id,
        now,
      });
      if (!moved.ok) refuse(target.kind === "group" ? "classId" : target.kind === "new" ? "date" : "where", moved.code);
      return { ok: true as const, toClassId, when };
    })
    .catch((error: unknown) => {
      if (error instanceof ClassRefused)
        return { ok: false as const, field: error.field, fieldError: error.fieldError };
      throw error;
    });
  if (!outcome.ok) return popupFormError({ [outcome.field]: outcome.fieldError }, values);

  revalidateClass(classId);
  if (outcome.toClassId) revalidateClass(outcome.toClassId);
  revalidatePath(staffRoutes.studentPayments(studentId));
  if (!outcome.when) return popupFormDone("seatReturned");
  return popupFormDone("seatRescheduled", [
    Math.round(outcome.when.scheduledAt.getTime() / 60_000),
    outcome.when.durationMin,
  ]);
}

const SCHEDULE_WHERE_SCHEMA = z.object({ where: z.enum(["new", "group"]) });
const SCHEDULE_NEW_SCHEMA = z.object({
  teacherId: formText(64),
  date: DAY,
  time: TIME,
  duration: DURATION,
  meetingUrl: formOptionalUrl(2000),
});
const SCHEDULE_GROUP_SCHEMA = z.object({ classId: formText(64) });
const SCHEDULE_FIELDS = ["where", "teacherId", "date", "time", "duration", "meetingUrl", "classId"];

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
  const values = readFormValues(formData, SCHEDULE_FIELDS);
  if (await throttled("seat-schedule", 20)) return popupFormError({}, values, { code: "throttled" });
  const where = parseForm(SCHEDULE_WHERE_SCHEMA, formData);
  if (!where.ok) return popupFormError({ where: { code: "invalid" } }, values);

  const db = getPlatformDb();
  const payment = await db.classPayment.findUnique({ where: { id: paymentId }, select: { studentId: true } });
  if (!payment) return popupFormError({}, values, { code: "invalid" });
  const studentId = payment.studentId;

  let target:
    | { kind: "new"; teacherId: string; scheduledAt: Date; durationMin: number; meetingUrl: string | null }
    | { kind: "group"; classId: string };
  if (where.data.where === "new") {
    const parsed = parseForm(SCHEDULE_NEW_SCHEMA, formData);
    if (!parsed.ok) return popupFormError({ [parsed.field]: { code: "invalid" } }, values);
    const scheduledAt = slotInstant(parsed.data.date, parsed.data.time, STUDY_DAY_TIMEZONE);
    if (!scheduledAt) return popupFormError({ date: { code: "schedule" } }, values);
    target = {
      kind: "new",
      teacherId: parsed.data.teacherId,
      scheduledAt,
      durationMin: parsed.data.duration,
      meetingUrl: parsed.data.meetingUrl,
    };
  } else {
    const parsed = parseForm(SCHEDULE_GROUP_SCHEMA, formData);
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
        if (!created.ok) refuse("date", created.code);
        classId = created.id;
        scheduledAt = target.scheduledAt;
        durationMin = target.durationMin;
      } else {
        await lockClasses(tx, [target.classId]);
        const row = await tx.class.findUnique({
          where: { id: target.classId },
          select: { scheduledAt: true, durationMin: true },
        });
        if (!row) refuse("classId", "invalid");
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
      if (!seated.ok) refuse(target.kind === "new" ? "date" : "classId", seated.code);
      return { ok: true as const, classId, scheduledAt, durationMin };
    })
    .catch((error: unknown) => {
      if (error instanceof ClassRefused)
        return { ok: false as const, field: error.field, fieldError: error.fieldError };
      throw error;
    });
  if (!outcome.ok) return popupFormError({ [outcome.field]: outcome.fieldError }, values);

  revalidateClass(outcome.classId);
  revalidatePath(staffRoutes.studentPayments(studentId));
  return popupFormDone("seatScheduled", [Math.round(outcome.scheduledAt.getTime() / 60_000), outcome.durationMin]);
}
