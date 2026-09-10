"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hashPassword, passwordProblem } from "@/lib/platform-auth/password";
import { requireStaff } from "@/lib/platform-auth/roles";
import { destroyAllSessionsOf } from "@/lib/platform-auth/session";
import { generateTempPassword } from "@/lib/platform-auth/temp-password";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { readText } from "@/services/shared/form-data";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { createDefaultStudy } from "@/services/studies/default-study";
import type { AccountActionState } from "./staff-students.types";

// Creating and maintaining accounts.
//
// [Deliberate exception to the project's form pattern]
// `createStudentAccount` and `resetStudentPassword` return STATE instead of
// redirecting with `?error=`, because they have to show the temporary password
// once: a password in a query param stays in the browser's history, in the
// Referer and in the server's logs. The price is that their forms use
// `useActionState` and therefore NEED JavaScript (verified: without JS they do
// not emit the `$ACTION_ID` and the submit does not arrive). It is accepted
// because it is an internal panel, and this exception is not extended to any
// other action.
//
// The temporary password is not stored, nor written to the log, nor shown again
// after navigating: it only travels in this call's response.

const DISPLAY_NAME_MAX_LENGTH = 120;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(formData: FormData): string {
  return readText(formData, "email").toLowerCase().slice(0, EMAIL_MAX_LENGTH);
}

/** Password typed by the staff, the generated one, or the problem that invalidates it. */
function resolvePassword(formData: FormData): { password: string; generated: boolean } | { problem: string } {
  const typed = readText(formData, "password");
  if (typed.length === 0) return { password: generateTempPassword(), generated: true };

  const problem = passwordProblem(typed);
  return problem ? { problem } : { password: typed, generated: false };
}

export async function createStudentAccount(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:account-create`, 10, 60_000))) {
    return { status: "error", message: "Demasiadas altas seguidas. Espera un minuto." };
  }

  const displayName = readText(formData, "displayName").slice(0, DISPLAY_NAME_MAX_LENGTH);
  if (displayName.length === 0) return { status: "error", message: "El nombre para mostrar es obligatorio." };

  const email = normalizeEmail(formData);
  if (!EMAIL_SHAPE.test(email)) return { status: "error", message: "Ese email no tiene un formato válido." };

  const resolved = resolvePassword(formData);
  if ("problem" in resolved) return { status: "error", message: resolved.problem };

  try {
    // The account and its "Mis partidas" go in together or neither does: a student
    // without that study would have nowhere to save a loose game, and creating it
    // afterwards would leave a window in which the account exists by halves.
    const created = await getPlatformDb().$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          displayName,
          passwordHash: await hashPassword(resolved.password),
          passwordUpdatedAt: new Date(),
        },
        select: { id: true },
      });
      await createDefaultStudy(tx, user.id);
      return user;
    });

    revalidatePath(staffRoutes.students);
    revalidatePath(staffRoutes.home);

    return {
      status: "ok",
      userId: created.id,
      message: "Cuenta creada.",
      // Only the generated one is returned: if the staff typed one, they already know it.
      tempPassword: resolved.generated ? resolved.password : undefined,
    };
  } catch (error) {
    if (isEmailTaken(error)) return { status: "error", message: "Ya existe una cuenta con ese email." };
    throw error;
  }
}

export async function resetStudentPassword(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const staff = await requireStaff();
  if (!(await allowAction(`${staff.user.id}:account-reset`, 10, 60_000))) {
    return { status: "error", message: "Demasiados reinicios seguidos. Espera un minuto." };
  }

  const userId = readText(formData, "userId");
  const resolved = resolvePassword(formData);
  if ("problem" in resolved) return { status: "error", message: resolved.problem };

  const db = getPlatformDb();
  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) return { status: "error", message: "Esa cuenta no existe." };

  await db.user.update({
    where: { id: target.id },
    data: { passwordHash: await hashPassword(resolved.password), passwordUpdatedAt: new Date() },
  });

  // Changing the password has to really throw them out: the open sessions would
  // survive the change because the cookie does not carry the password.
  await destroyAllSessionsOf(target.id);

  revalidatePath(staffRoutes.studentDetail(target.id));

  return {
    status: "ok",
    userId: target.id,
    message: "Contraseña restablecida. Se han cerrado todas las sesiones de esa cuenta.",
    tempPassword: resolved.generated ? resolved.password : undefined,
  };
}

/** Basic account data. It follows the normal pattern: redirect with `?error=`. */
export async function updateStudent(userId: string, formData: FormData): Promise<void> {
  const staff = await requireStaff();
  const detailPath = staffRoutes.studentDetail(userId);

  if (!(await allowAction(`${staff.user.id}:account-update`, 60, 60_000))) redirect(`${detailPath}?error=throttled`);

  const displayName = readText(formData, "displayName").slice(0, DISPLAY_NAME_MAX_LENGTH);
  if (displayName.length === 0) redirect(`${detailPath}?error=displayName`);

  const email = normalizeEmail(formData);
  if (!EMAIL_SHAPE.test(email)) redirect(`${detailPath}?error=email`);

  try {
    await getPlatformDb().user.update({ where: { id: userId }, data: { displayName, email } });
  } catch (error) {
    if (isEmailTaken(error)) redirect(`${detailPath}?error=emailTaken`);
    throw error;
  }

  revalidatePath(detailPath);
  revalidatePath(staffRoutes.students);
}

/** P2002 over `User.email` and not any other conflict. */
function isEmailTaken(error: unknown): boolean {
  return isUniqueConstraintError(error, "User_email_key", "email");
}
