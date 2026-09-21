"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LOGIN_ERROR_PARAM, LOGIN_PATH, RETURN_TO_PARAM } from "@/constants/platform/auth.const";
import { DUMMY_PASSWORD_HASH, PASSWORD_MAX_LENGTH, verifyPassword } from "@/lib/platform-auth/password";
import { createSession, destroyCurrentSession } from "@/lib/platform-auth/session";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { homeRouteFor } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { safeReturnTo } from "@/services/shared/safe-return-to";

// Plain server action (no useActionState) so the login works without JavaScript
// too: it is the entrance door, and a hydration failure cannot leave a student
// outside. The error travels back in the query, with the POST → redirect → GET
// pattern.

const EMAIL_MAX_LENGTH = 254;

function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

/** Returns to the form keeping the pending destination and the reason for the failure. */
function backToLogin(errorCode: string, returnTo: string): never {
  const params = new URLSearchParams({ [LOGIN_ERROR_PARAM]: errorCode });
  if (returnTo.length > 0) params.set(RETURN_TO_PARAM, returnTo);
  redirect(`${LOGIN_PATH}?${params.toString()}`);
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = readText(formData, "email").toLowerCase().slice(0, EMAIL_MAX_LENGTH);
  const password = readText(formData, "password");
  const rawReturnTo = readText(formData, RETURN_TO_PARAM);

  if (email.length === 0 || password.length === 0 || password.length > PASSWORD_MAX_LENGTH) {
    backToLogin("credentials", rawReturnTo);
  }

  // Two ceilings: per account (it slows an attack on one particular student) and
  // per origin (it slows a sweep of many accounts from the same machine).
  //
  // The origin comes from `x-forwarded-for`, which is only trustworthy behind a
  // proxy that rewrites it: Vercel does; a bare container or an nginx without
  // `proxy_set_header` does not, and there the client would set it. If the
  // deployment stops being Vercel, the last hop or the platform's header has to be
  // read instead.
  const requestHeaders = await headers();
  const origin = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocido";
  if (
    !(await allowAction(`login:${email}`, 10, 60_000)) ||
    !(await allowAction(`login-origin:${origin}`, 30, 60_000))
  ) {
    backToLogin("throttled", rawReturnTo);
  }

  const db = getPlatformDb();
  const user = await db.user.findUnique({
    where: { email },
    // The roles come from this same query (they are rows whose existence is the
    // role) only to choose where they land; authorising is still the job of
    // `requireTeacher`/`requireStaff` in each page.
    select: {
      id: true,
      passwordHash: true,
      teacher: { select: { isActive: true } },
      staff: { select: { id: true } },
    },
  });

  // It is always verified, even without a user, against a throwaway hash: that
  // way the login takes the same time whether the account exists or not.
  const matches = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !user.passwordHash || !matches) {
    backToLogin("credentials", rawReturnTo);
  }

  await createSession(user.id, requestHeaders.get("user-agent"));
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const home = homeRouteFor({
    isTeacher: user.teacher?.isActive === true,
    isStaff: user.staff !== null,
  });
  // The default destination is the role's home (see homeRouteFor): with the
  // exclusive menu, sending a teacher or an administrator to the student
  // dashboard would leave them on a page their own menu no longer links to.
  redirect(safeReturnTo(rawReturnTo, home));
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect(LOGIN_PATH);
}
