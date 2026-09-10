import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { readSessionUser, type SessionUser } from "@/lib/platform-auth/session";

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// Identity DAL: the ONLY point that decides who the current user is. Services
// and server actions always resolve it here and never trust an id coming from
// the client.
//
// `proxy.ts` does an optimistic rejection by looking only at whether the cookie
// exists; this is the real check (the one that queries the session in the
// database), and it is the one that also protects the server actions, which are
// reachable by direct POST without going through navigation.

/**
 * Full session (identity + roles), memoised per request. It is the ONLY point
 * that queries the session: getSessionUser and lib/platform-auth/roles.ts rely
 * on it so that a page needing identity AND role does not fire two queries.
 * Outside the DAL and roles.ts it must not be used: pages ask for
 * `CurrentUser`, which deliberately carries no roles.
 */
export const getSessionContext = cache(async (): Promise<SessionUser | null> => readSessionUser());

/** The session's user, or null when there is no valid one. It does not redirect. */
export const getSessionUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSessionContext();
  if (!session) return null;

  const { id, email, displayName, createdAt } = session;
  return { id, email, displayName, createdAt };
});

/**
 * The session's user or a redirect to the login. It is what the pages and
 * actions of the private area use: if it returns, identity is verified.
 *
 * Nuance of the "cookie present but session no longer valid" case (expired or
 * revoked): the proxy lets it through, and by the time this redirect is thrown
 * the response has already started streaming, so Next sends it inside the
 * stream and the HTTP status is 200 instead of 307. The browser redirects all
 * the same and no student data leaks (nothing gets rendered), but a client
 * without JavaScript would be left looking at the empty shell. It is accepted
 * because the frequent case — entering without a cookie — is cut by the proxy
 * with a clean 307.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
});
