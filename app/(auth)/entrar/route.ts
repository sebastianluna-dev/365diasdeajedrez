import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/constants/platform/auth.const";
import { rolesOf } from "@/lib/platform-auth/roles";
import { readSessionUser } from "@/lib/platform-auth/session";
import { homeRouteFor } from "@/lib/platform-routes";

// Gate for whoever reaches the home page with a session cookie: `proxy.ts`
// sends them here. It exists so that `/` can stay static. The home page no
// longer reads cookies, and the "which panel?" decision — which needs the real
// session and the role — is taken in this separate request, which costs the
// same query the home page used to run on every visit.
//
// Expired or revoked cookie: it is deleted and the visitor goes back to the
// home page. Without this, the proxy (which only sees whether the cookie
// exists, not whether it is valid) would send them here again and again and
// the home page would be unreachable until they logged in.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await readSessionUser();
  const destination = session ? homeRouteFor(rolesOf(session)) : "/";

  const response = NextResponse.redirect(new URL(destination, request.url));
  // The response depends on each visitor's cookie: neither the browser nor the
  // CDN may cache it, or one person's panel would become another's destination.
  response.headers.set("Cache-Control", "private, no-store");
  if (!session) response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
