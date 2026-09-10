// Authentication constants shared by the DAL, the server actions and
// `proxy.ts`. They live here (without "server-only") because proxy runs before
// the render and must not drag in the Prisma client or React modules.

export const SESSION_COOKIE_NAME = "platform_session";

/**
 * Cookie lifetime: very long on purpose. What rules over expiry is
 * `Session.expiresAt` in the database, so the cookie only has to stay around
 * to transport the token; if the browser keeps it longer, the server rejects
 * the expired session all the same.
 */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

/** Real duration of a session without activity. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Sliding renewal: refreshed at most once a day. */
export const SESSION_RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

export const LOGIN_PATH = "/iniciar-sesion";

/**
 * Where `proxy.ts` sends whoever reaches the home page with a session cookie.
 * It is a route handler (app/(auth)/entrar/route.ts) that queries the real
 * session and dispatches by role; it exists so the home page does not have to
 * read cookies and can be prerendered.
 */
export const SESSION_ENTRY_PATH = "/entrar";

/** Parameter with the destination to return to after logging in. */
export const RETURN_TO_PARAM = "next";

/** Parameter with which the login reports the failure reason back to itself. */
export const LOGIN_ERROR_PARAM = "error";

/**
 * Login error messages. They live here and not in `auth.actions.ts` because a
 * "use server" module can only export async functions.
 *
 * A single text for every credential failure on purpose: distinguishing
 * "that email does not exist" from "that password is wrong" hands an
 * attacker the list of enrolled students.
 */
export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  credentials: "Email o contraseña incorrectos.",
  throttled: "Demasiados intentos. Espera un minuto y vuelve a probar.",
};

/**
 * Prefixes of the private area. `proxy.ts` uses them for the optimistic
 * rejection and `app/robots.ts` to exclude them from crawling; the real check
 * always lives in the DAL (`getCurrentUser`), because the proxy only sees the
 * cookie, not the session.
 *
 * The `matcher` of `proxy.ts` cannot be derived from here (Next requires it
 * literal), so `proxy.test.ts` checks that the two lists match: a new route
 * under `app/(platform)` is added HERE and in the matcher.
 */
export const PROTECTED_PATH_PREFIXES = [
  "/inicio",
  "/clases",
  "/estudios",
  "/cursos",
  "/lecciones",
  "/entrenador",
  "/explorador",
  "/profesor",
  "/administracion",
] as const;
