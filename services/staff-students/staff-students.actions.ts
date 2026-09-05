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

// Alta y mantenimiento de cuentas.
//
// [Excepción deliberada al patrón de formularios del proyecto]
// `createStudentAccount` y `resetStudentPassword` devuelven ESTADO en vez de
// redirigir con `?error=`, porque tienen que enseñar la contraseña temporal una
// vez: una contraseña en un query param queda en el historial del navegador, en
// el Referer y en los logs del servidor. El precio es que sus formularios usan
// `useActionState` y por tanto NECESITAN JavaScript (comprobado: sin JS no
// emiten el `$ACTION_ID` y el envío no llega). Se acepta porque es un panel
// interno, y no se extiende esta excepción a ninguna otra action.
//
// La contraseña temporal no se guarda, ni se registra en el log, ni se vuelve a
// mostrar tras navegar: sólo viaja en la respuesta de esta llamada.

const DISPLAY_NAME_MAX_LENGTH = 120;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(formData: FormData): string {
  return readText(formData, "email").toLowerCase().slice(0, EMAIL_MAX_LENGTH);
}

/** Contraseña tecleada por el staff, la generada, o el problema que la invalida. */
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
    // La cuenta y su «Mis partidas» entran juntas o no entra ninguna: un alumno
    // sin ese estudio no tendría dónde guardar una partida suelta, y crearlo
    // después dejaría una ventana en la que la cuenta existe a medias.
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
      // Sólo se devuelve la generada: si el staff tecleó una, ya la conoce.
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

  // Cambiar la contraseña tiene que expulsar de verdad: las sesiones abiertas
  // sobrevivirían al cambio porque la cookie no lleva la contraseña.
  await destroyAllSessionsOf(target.id);

  revalidatePath(staffRoutes.studentDetail(target.id));

  return {
    status: "ok",
    userId: target.id,
    message: "Contraseña restablecida. Se han cerrado todas las sesiones de esa cuenta.",
    tempPassword: resolved.generated ? resolved.password : undefined,
  };
}

/** Datos básicos de la cuenta. Sigue el patrón normal: redirect con `?error=`. */
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

/** P2002 sobre `User.email` y no cualquier otro conflicto. */
function isEmailTaken(error: unknown): boolean {
  return isUniqueConstraintError(error, "User_email_key", "email");
}
