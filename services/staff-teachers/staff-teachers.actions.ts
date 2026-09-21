"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCommonTimezone } from "@/constants/platform/timezones.const";
import { hashPassword, passwordProblem } from "@/lib/platform-auth/password";
import { requireStaff } from "@/lib/platform-auth/roles";
import { generateTempPassword } from "@/lib/platform-auth/temp-password";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readBoolean, readOptionalText, readText, readUrl } from "@/services/shared/form-data";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { safeReturnTo, withErrorParam } from "@/services/shared/safe-return-to";
import { createDefaultStudy } from "@/services/studies/default-study";
import { planAssignment } from "./assignment-rules";

// Teachers and assignments. Nothing is deleted here: a teacher is deactivated
// and an assignment is closed. The history of who took whom is part of the data.

const DISPLAY_NAME_MAX_LENGTH = 120;
const TITLE_MAX_LENGTH = 120;
const BIO_MAX_LENGTH = 1000;
const NOTE_MAX_LENGTH = 300;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Partial index that imposes "one active teacher per student" (manual SQL). */
const ONE_ACTIVE_INDEX = "teacher_student_one_active";

function fail(path: string, code: string): never {
  redirect(withErrorParam(path, code));
}

/**
 * Creates the teacher record: either over an account that already exists, or
 * creating account and record at once (in a transaction, so as not to leave a
 * loose user if something fails). The temporary password is shown on the
 * student's page; here, if the account is created, it is given a generated one
 * that the staff resets afterwards from their page if needed.
 */
export async function createTeacher(formData: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:teacher-create`, 20, 3_600_000))) fail(staffRoutes.newTeacher, "throttled");

  const displayName = readText(formData, "displayName").slice(0, DISPLAY_NAME_MAX_LENGTH);
  if (displayName.length === 0) fail(staffRoutes.newTeacher, "displayName");

  const title = readOptionalText(formData, "title", TITLE_MAX_LENGTH);
  const bio = readOptionalText(formData, "bio", BIO_MAX_LENGTH);
  const timezone = readText(formData, "timezone");
  const db = getPlatformDb();

  const existingUserId = readText(formData, "userId");
  if (existingUserId.length > 0) {
    const user = await db.user.findUnique({
      where: { id: existingUserId },
      select: { id: true, teacher: { select: { id: true } } },
    });
    if (!user) fail(staffRoutes.newTeacher, "studentMissing");
    if (user.teacher) fail(staffRoutes.newTeacher, "userTaken");

    const created = await db.teacher.create({
      data: {
        user: { connect: { id: user.id } },
        displayName,
        title,
        bio,
        timezone: isCommonTimezone(timezone) ? timezone : null,
      },
      select: { id: true },
    });

    revalidatePath(staffRoutes.teachers);
    redirect(staffRoutes.teacherDetail(created.id));
  }

  const email = readText(formData, "email").toLowerCase().slice(0, EMAIL_MAX_LENGTH);
  if (!EMAIL_SHAPE.test(email)) fail(staffRoutes.newTeacher, "email");

  const typedPassword = readText(formData, "password");
  if (typedPassword.length > 0 && passwordProblem(typedPassword) !== null) fail(staffRoutes.newTeacher, "invalid");
  const password = typedPassword.length > 0 ? typedPassword : generateTempPassword();

  let teacherId: string;
  try {
    // Account and record in the same transaction: either both go in or neither does.
    const created = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, displayName, passwordHash: await hashPassword(password), passwordUpdatedAt: new Date() },
        select: { id: true },
      });
      // A teacher also uses "Mis estudios" — that is where they make the collections
      // they share — so their account is born just like a student's.
      await createDefaultStudy(tx, user.id);
      return tx.teacher.create({
        data: {
          user: { connect: { id: user.id } },
          displayName,
          title,
          bio,
          timezone: isCommonTimezone(timezone) ? timezone : null,
        },
        select: { id: true },
      });
    });
    teacherId = created.id;
  } catch (error) {
    if (isUniqueConstraintError(error, "User_email_key", "email")) fail(staffRoutes.newTeacher, "emailTaken");
    throw error;
  }

  revalidatePath(staffRoutes.teachers);
  // The new account's password is handed over by resetting it from the student's
  // page: that way there is only ONE place that shows it (and only once).
  redirect(staffRoutes.teacherDetail(teacherId));
}

export async function updateTeacher(teacherId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.teacherDetail(teacherId);
  if (!(await allowAction(`${staff.user.id}:teacher-update`, 60, 60_000))) fail(detailPath, "throttled");

  const displayName = readText(formData, "displayName").slice(0, DISPLAY_NAME_MAX_LENGTH);
  if (displayName.length === 0) fail(detailPath, "displayName");

  const timezone = readText(formData, "timezone");
  const photoRaw = readText(formData, "photo");
  const photo = photoRaw.length > 0 ? readUrl(formData, "photo") : null;
  if (photoRaw.length > 0 && photo === null) fail(detailPath, "invalid");

  await getPlatformDb().teacher.update({
    where: { id: teacherId },
    data: {
      displayName,
      title: readOptionalText(formData, "title", TITLE_MAX_LENGTH),
      bio: readOptionalText(formData, "bio", BIO_MAX_LENGTH),
      photo,
      timezone: isCommonTimezone(timezone) ? timezone : null,
    },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.teachers);
}

/**
 * Activating and deactivating the teacher. Deactivating does NOT close their
 * assignments: whoever reassigns their students is a person, not a side effect.
 * The page reports how many are left open.
 */
export async function setTeacherActive(teacherId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.teacherDetail(teacherId);
  if (!(await allowAction(`${staff.user.id}:teacher-active`, 60, 60_000))) fail(detailPath, "throttled");

  await getPlatformDb().teacher.update({
    where: { id: teacherId },
    data: { isActive: readBoolean(formData, "isActive") },
  });

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.teachers);
}

export async function assignStudent(formData: FormData): Promise<void> {
  const staff = await requireStaff();

  const studentId = readText(formData, "studentId");
  const teacherId = readText(formData, "teacherId");
  // `returnTo` comes from a hidden field, that is, from the client: internal
  // paths only, or `redirect()` would serve to send the staff to another domain.
  const returnTo = safeReturnTo(readText(formData, "returnTo"), staffRoutes.studentDetail(studentId));

  if (!(await allowAction(`${staff.user.id}:assign-student`, 60, 60_000))) fail(returnTo, "throttled");

  const db = getPlatformDb();
  const [teacher, student] = await Promise.all([
    db.teacher.findUnique({ where: { id: teacherId }, select: { id: true, isActive: true } }),
    db.user.findUnique({ where: { id: studentId }, select: { id: true } }),
  ]);
  if (!teacher) fail(returnTo, "teacherMissing");
  if (!teacher.isActive) fail(returnTo, "teacherInactive");
  if (!student) fail(returnTo, "studentMissing");

  const note = readOptionalText(formData, "note", NOTE_MAX_LENGTH);

  try {
    await db.$transaction(async (tx) => {
      const active = await tx.teacherStudent.findMany({
        where: { studentId, endedAt: null },
        select: { id: true, teacherId: true },
      });

      const plan = planAssignment(active, teacherId);
      if (plan.alreadyAssigned) return;

      // Closing and creating go in the SAME transaction: if they were separated, a
      // failure in between would leave the student without a teacher.
      const now = new Date();
      if (plan.closeIds.length > 0) {
        await tx.teacherStudent.updateMany({ where: { id: { in: plan.closeIds } }, data: { endedAt: now } });
      }
      await tx.teacherStudent.create({
        data: { teacherId, studentId, assignedBy: staff.user.id, note },
      });
    });
  } catch (error) {
    // Race: two simultaneous creations both pass through the plan and only the
    // partial index separates them. It is translated into a message that says what to do.
    if (isUniqueConstraintError(error, ONE_ACTIVE_INDEX)) fail(returnTo, "alreadyAssigned");
    throw error;
  }

  revalidatePath(staffRoutes.studentDetail(studentId));
  revalidatePath(staffRoutes.teacherDetail(teacherId));
  revalidatePath(staffRoutes.home);
}

/** Ends an assignment. It never deletes the row: it is history. */
export async function endAssignment(assignmentId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const returnTo = safeReturnTo(readText(formData, "returnTo"), staffRoutes.teachers);
  if (!(await allowAction(`${staff.user.id}:end-assignment`, 60, 60_000))) fail(returnTo, "throttled");

  const db = getPlatformDb();
  const closed = await db.teacherStudent.updateMany({
    where: { id: assignmentId, endedAt: null },
    data: { endedAt: new Date() },
  });
  if (closed.count === 0) fail(returnTo, "assignmentMissing");

  revalidatePath(returnTo);
  revalidatePath(staffRoutes.home);
}
