import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOGIN_PATH,
  PROTECTED_PATH_PREFIXES,
  RETURN_TO_PARAM,
  SESSION_COOKIE_NAME,
  SESSION_ENTRY_PATH,
} from "@/constants/platform/auth.const";
import { contentSecurityPolicy } from "@/lib/content-security-policy";

// OPTIMISTIC rejection of the private area: here only whether the session cookie
// exists is looked at, never whether it is valid. That is on purpose — the proxy
// runs in front of the app and must not touch the database; its role is to save
// a render, not to authorise. The real check is in the DAL
// (lib/platform-auth/current-user.ts), which is also what covers the server
// actions: they are POST requests to the route where they are declared, so a
// change of matcher could leave them outside this proxy without anyone noticing.
//
// The cookie does not distinguish roles either, and it must not: a student with
// a session who enters /profesor or /administracion passes this filter and is
// thrown out by the DAL's `require*` towards their dashboard. Correct by design
// — the database is not queried here.
//
// The opposite jump (with a cookie → their panel) is only made from the home
// page, and without deciding the destination here: they are sent to /entrar, a
// route handler that queries the real session and dispatches by role, and which,
// if the cookie is expired, deletes it and returns them to the home page. That
// way `/` does not read cookies and can be prerendered, and an old cookie leaves
// nobody without a home page nor causes a loop with the login (which still
// checks the real session, not the cookie).

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (pathname === "/") {
    if (!hasSessionCookie) return NextResponse.next();
    return NextResponse.redirect(new URL(SESSION_ENTRY_PATH, request.url));
  }

  const isProtected = PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set(RETURN_TO_PARAM, pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Only the platform and its login take the nonce: the matcher sends nothing
  // else here, and the site's static pages have their policy in next.config.ts.
  if (!isProtected && pathname !== LOGIN_PATH) return NextResponse.next();
  return withNonce(request);
}

/**
 * The platform's pages, and its login, go on with a Content-Security-Policy
 * that carries a nonce of their own (lib/content-security-policy.ts). They
 * are rendered per request anyway (the session), so the nonce costs no static
 * page. Next reads the nonce from the policy in the REQUEST's headers and puts
 * it on every script it renders; the same policy goes back in the response,
 * where the browser enforces it.
 */
function withNonce(request: NextRequest): NextResponse {
  // A random UUID, as base64: unguessable, and new on every request.
  const nonce = btoa(crypto.randomUUID());
  const policy = contentSecurityPolicy({
    target: "platform",
    nonce,
    isDev: process.env.NODE_ENV === "development",
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

// The prefixes must be literal: Next analyses the matcher at build time and
// discards any computed value (which is why it is not derived from the
// constant; `proxy.test.ts` watches that the two lists do not drift apart). The
// home page is included only for the jump of whoever brings a cookie; without
// one it passes straight through and the prerendered version is served. The
// login is here for its nonce: it is the page where a password is typed.
export const config = {
  matcher: [
    "/",
    "/iniciar-sesion",
    "/inicio/:path*",
    "/clases/:path*",
    "/estudios/:path*",
    "/cursos/:path*",
    "/ejercicios/:path*",
    "/lecciones/:path*",
    "/ajustes/:path*",
    "/entrenador/:path*",
    "/explorador/:path*",
    "/jugar/:path*",
    "/perfil/:path*",
    "/herramientas/:path*",
    "/profesor/:path*",
    "/administracion/:path*",
  ],
};
