import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_RENEW_AFTER_MS,
  SESSION_TTL_MS,
} from "@/constants/platform/auth.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

// Sesiones opacas en base de datos. El token en claro sólo existe en la cookie
// del navegador; en la tabla se guarda su SHA-256, así que un volcado de la
// base no permite suplantar a nadie. SHA-256 a secas basta aquí (a diferencia
// de las contraseñas) porque el token son 256 bits aleatorios: no hay
// diccionario que probar.

const USER_AGENT_MAX_LENGTH = 255;

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  sessionId: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Abre sesión para el usuario y deja la cookie puesta. Sólo puede llamarse
 * desde una server action o un route handler: fuera de ahí Next no permite
 * escribir cookies.
 */
export async function createSession(userId: string, userAgent?: string | null): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const db = getPlatformDb();

  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      userAgent: userAgent ? userAgent.slice(0, USER_AGENT_MAX_LENGTH) : null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
}

/**
 * Usuario de la sesión vigente, o null. Caduca por `expiresAt` y se renueva de
 * forma deslizante (como mucho una vez al día) para que quien entra a diario no
 * acabe expulsado; la renovación es sólo en base de datos porque durante el
 * render no se pueden reescribir cookies, y la cookie ya vive más que la sesión.
 */
export async function readSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const db = getPlatformDb();
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      expiresAt: true,
      lastSeenAt: true,
      user: { select: { id: true, email: true, displayName: true, createdAt: true } },
    },
  });

  const now = new Date();
  if (!session || session.expiresAt <= now) return null;

  if (now.getTime() - session.lastSeenAt.getTime() > SESSION_RENEW_AFTER_MS) {
    await db.session.update({
      where: { id: session.id },
      data: { lastSeenAt: now, expiresAt: new Date(now.getTime() + SESSION_TTL_MS) },
    });
  }

  return { ...session.user, sessionId: session.id };
}

/**
 * Cierra la sesión actual: borra la fila (revocación inmediata, aunque la
 * cookie sobreviva en el navegador) y retira la cookie.
 */
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    // deleteMany y no delete: si la fila ya no está, no hay nada que reportar.
    await getPlatformDb().session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Cierra todas las sesiones del usuario (cambio de contraseña, robo de cuenta). */
export async function destroyAllSessionsOf(userId: string): Promise<void> {
  await getPlatformDb().session.deleteMany({ where: { userId } });
}
