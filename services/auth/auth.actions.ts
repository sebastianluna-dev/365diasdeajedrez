"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_ERROR_PARAM, LOGIN_PATH, RETURN_TO_PARAM } from "@/constants/platform/auth.const";
import { DUMMY_PASSWORD_HASH, PASSWORD_MAX_LENGTH, verifyPassword } from "@/lib/platform-auth/password";
import { createSession, destroyCurrentSession } from "@/lib/platform-auth/session";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";

// Server action plana (sin useActionState) para que el login funcione también
// sin JavaScript: es la puerta de entrada, y un fallo de hidratación no puede
// dejar a un alumno fuera. El error viaja de vuelta en la query, con el patrón
// POST → redirect → GET.

const EMAIL_MAX_LENGTH = 254;

function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Destino tras iniciar sesión. Sólo se aceptan rutas internas: sin esto, un
 * enlace `?next=https://otro-sitio` convertiría el login en un trampolín de
 * phishing. `//host` y `/\host` son URLs absolutas para el navegador, de ahí
 * la segunda comprobación.
 */
function safeReturnTo(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return platformRoutes.dashboard;
  return raw;
}

/** Vuelve al formulario conservando el destino pendiente y el motivo del fallo. */
function backToLogin(errorCode: string, returnTo: string): never {
  const params = new URLSearchParams({ [LOGIN_ERROR_PARAM]: errorCode });
  if (returnTo.length > 0) params.set(RETURN_TO_PARAM, returnTo);
  redirect(`${LOGIN_PATH}?${params.toString()}`);
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = readText(formData, "email").toLowerCase().slice(0, EMAIL_MAX_LENGTH);
  const password = readText(formData, "password");
  const rawReturnTo = readText(formData, RETURN_TO_PARAM);
  const returnTo = safeReturnTo(rawReturnTo);

  if (email.length === 0 || password.length === 0 || password.length > PASSWORD_MAX_LENGTH) {
    backToLogin("credentials", rawReturnTo);
  }

  // Dos techos: por cuenta (frena el ataque a un alumno concreto) y por origen
  // (frena el barrido de muchas cuentas desde la misma máquina).
  const requestHeaders = await headers();
  const origin = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocido";
  if (!allowAction(`login:${email}`, 10, 60_000) || !allowAction(`login-origin:${origin}`, 30, 60_000)) {
    backToLogin("throttled", rawReturnTo);
  }

  const db = getPlatformDb();
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  // Se verifica siempre, incluso sin usuario, contra un hash de descarte: así
  // el login tarda lo mismo exista la cuenta o no.
  const matches = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !user.passwordHash || !matches) {
    backToLogin("credentials", rawReturnTo);
  }

  await createSession(user.id, requestHeaders.get("user-agent"));
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  redirect(returnTo);
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect(LOGIN_PATH);
}
