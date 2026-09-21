import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { getSessionContext, type CurrentUser } from "@/lib/platform-auth/current-user";
import type { SessionUser } from "@/lib/platform-auth/session";
import { platformRoutes } from "@/lib/platform-routes";

// Platform roles. There is no roles table and no column in `User`: the role is
// the existence of a row (`Teacher`, `Staff`), the pattern the model already
// established. They are orthogonal — the same user can be teacher AND staff —
// and they are read from the SAME query that resolves the session (see
// session.ts), so asking for the role does not cost an extra query.
//
// None of this replaces data authorisation: `require*` decides whether one can
// ENTER a panel; which rows are seen is still decided inside each service's
// `where` and with the guards of guards.ts.

export interface TeacherContext {
  user: CurrentUser;
  teacher: { id: string; displayName: string; isActive: boolean };
}

export interface StaffContext {
  user: CurrentUser;
  staffId: string;
}

export interface SessionRoles {
  isTeacher: boolean;
  isStaff: boolean;
}

export const getTeacherContext = cache(async (): Promise<TeacherContext | null> => {
  const session = await getSessionContext();
  // A deactivated teacher keeps their classes and their history, but stops having
  // a panel: it is the deactivation without deleting data.
  if (!session?.teacher || !session.teacher.isActive) return null;

  const { id, email, displayName, createdAt } = session;
  return { user: { id, email, displayName, createdAt }, teacher: session.teacher };
});

const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const session = await getSessionContext();
  if (!session?.staff) return null;

  const { id, email, displayName, createdAt } = session;
  return { user: { id, email, displayName, createdAt }, staffId: session.staff.id };
});

/**
 * Role rule from the session. It is shared by `getSessionRoles` and the /entrar
 * route handler, which has no render and therefore does not go through this
 * module's `cache()`.
 */
export function rolesOf(session: SessionUser | null): SessionRoles {
  return {
    isTeacher: session?.teacher?.isActive === true,
    isStaff: session?.staff !== null && session?.staff !== undefined,
  };
}

/** For the navigation: which menu groups are rendered. It never authorises anything. */
export const getSessionRoles = cache(async (): Promise<SessionRoles> => rolesOf(await getSessionContext()));

/**
 * Border of the teacher panel: FIRST await of every page and every server
 * action of `/teacher`. Without a session it sends to the login (the proxy
 * already cuts the normal case, but an expired cookie reaches here); with a
 * session but without the role, to the dashboard: the account is valid, that
 * panel just is not theirs.
 */
export async function requireTeacher(): Promise<TeacherContext> {
  const context = await getTeacherContext();
  if (context) return context;

  const session = await getSessionContext();
  redirect(session ? platformRoutes.dashboard : LOGIN_PATH);
}

/** Border of the Administration panel. Same rules as `requireTeacher`. */
export async function requireStaff(): Promise<StaffContext> {
  const context = await getStaffContext();
  if (context) return context;

  const session = await getSessionContext();
  redirect(session ? platformRoutes.dashboard : LOGIN_PATH);
}
