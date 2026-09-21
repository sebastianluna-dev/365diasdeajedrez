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
import { z } from "zod";
import { formEmail, formText, parseForm } from "@/services/shared/form-schema";
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

const ACCOUNT_SCHEMA = z.object({
  displayName: formText(120),
  email: formEmail(),
  password: z.string().trim().max(200).optional(),
});
const RESET_SCHEMA = z.object({ userId: formText(64), password: z.string().trim().max(200).optional() });
const UPDATE_SCHEMA = z.object({ displayName: formText(120), email: formEmail() });

const FIELD_MESSAGES: Record<string, string> = {
  displayName: "El nombre para mostrar es obligatorio.",
  email: "Ese email no tiene un formato válido.",
  password: "La contraseña es demasiado larga.",
};

/** Password typed by the staff, the generated one, or the problem that invalidates it. */
function resolvePassword(typed: string | undefined): { password: string; generated: boolean } | { problem: string } {
  if (!typed || typed.length === 0) return { password: generateTempPassword(), generated: true };

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

  const parsed = parseForm(ACCOUNT_SCHEMA, formData);
  if (!parsed.ok)
    return { status: "error", message: FIELD_MESSAGES[parsed.field] ?? "Revisa los datos del formulario." };
  const { displayName, email } = parsed.data;

  const resolved = resolvePassword(parsed.data.password);
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

  const parsed = parseForm(RESET_SCHEMA, formData);
  if (!parsed.ok) return { status: "error", message: FIELD_MESSAGES[parsed.field] ?? "Esa cuenta no existe." };
  const { userId } = parsed.data;
  const resolved = resolvePassword(parsed.data.password);
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

  const parsed = parseForm(UPDATE_SCHEMA, formData);
  if (!parsed.ok) redirect(`${detailPath}?error=${parsed.field === "email" ? "email" : "displayName"}`);
  const { displayName, email } = parsed.data;

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
