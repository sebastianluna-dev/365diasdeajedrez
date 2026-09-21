import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_RENEW_AFTER_MS,
  SESSION_TTL_MS,
} from "@/constants/platform/auth.const";
import { logWarning } from "@/lib/logger";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

// Opaque sessions in the database. The plain token only exists in the browser's
// cookie; the table stores its SHA-256, so a dump of the database does not let
// anyone impersonate anybody. Plain SHA-256 is enough here (unlike passwords)
// because the token is 256 random bits: there is no dictionary to try.

const USER_AGENT_MAX_LENGTH = 255;

/**
 * How often expired sessions are swept, as a fraction of reads. Same pattern as
 * `allowAction` with `RateLimit`: the table only grows with what it writes
 * itself, so it is cleaned from the app itself and without blocking the
 * response. The row just detected as expired is always deleted.
 */
const PURGE_CHANCE = 0.01;

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  sessionId: string;
  /// Platform roles, resolved in the SAME session query: they are rows whose
  /// existence is the role (see prisma/schema.prisma). They are exposed only
  /// through lib/platform-auth/roles.ts; `CurrentUser` does not carry them, so as
  /// not to couple the student's pages to the roles.
  teacher: { id: string; displayName: string; isActive: boolean } | null;
  staff: { id: string } | null;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Opens a session for the user and sets the cookie. It can only be called from
 * a server action or a route handler: outside those Next does not allow writing
 * cookies.
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
 * User of the current session, or null. It expires by `expiresAt` and is
 * renewed in a sliding fashion (at most once a day) so that whoever comes in
 * daily does not end up locked out; the renewal is database-only because
 * cookies cannot be rewritten during a render, and the cookie already lives
 * longer than the session.
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
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          createdAt: true,
          // Roles by row existence. They go in the nested select so that this path —
          // which every authenticated request goes through — keeps costing a single query.
          teacher: { select: { id: true, displayName: true, isActive: true } },
          staff: { select: { id: true } },
        },
      },
    },
  });

  const now = new Date();
  if (Math.random() < PURGE_CHANCE) {
    void db.session
      .deleteMany({ where: { expiresAt: { lte: now } } })
      .catch((error: unknown) =>
        logWarning("session", "No se pudieron barrer las sesiones caducadas", { error: String(error) }),
      );
  }
  if (!session) return null;
  if (session.expiresAt <= now) {
    await db.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  if (now.getTime() - session.lastSeenAt.getTime() > SESSION_RENEW_AFTER_MS) {
    await db.session.update({
      where: { id: session.id },
      data: { lastSeenAt: now, expiresAt: new Date(now.getTime() + SESSION_TTL_MS) },
    });
  }

  return { ...session.user, sessionId: session.id };
}

/**
 * Closes the current session: deletes the row (immediate revocation, even if
 * the cookie survives in the browser) and removes the cookie.
 */
export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    // deleteMany and not delete: if the row is already gone, there is nothing to report.
    await getPlatformDb().session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Closes every session of the user (password change, account theft). */
export async function destroyAllSessionsOf(userId: string): Promise<void> {
  await getPlatformDb().session.deleteMany({ where: { userId } });
}
