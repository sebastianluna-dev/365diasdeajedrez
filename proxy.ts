import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOGIN_PATH,
  PROTECTED_PATH_PREFIXES,
  RETURN_TO_PARAM,
  SESSION_COOKIE_NAME,
} from "@/constants/platform/auth.const";

// Rechazo OPTIMISTA de la zona privada: aquí sólo se mira si existe la cookie
// de sesión, nunca si es válida. Es a propósito — el proxy corre delante de la
// app y no debe tocar la base de datos; su papel es ahorrar un render, no
// autorizar. La comprobación real está en el DAL
// (lib/platform-auth/current-user.ts), que es además quien cubre las server
// actions: son peticiones POST a la ruta donde se declaran, así que un cambio
// de matcher podría dejarlas fuera de este proxy sin que se note.
//
// La cookie tampoco distingue roles, y no debe: un alumno con sesión que entre
// a /profesor o /administracion pasa este filtro y lo expulsa el `require*` del DAL hacia
// su dashboard. Correcto por diseño — aquí no se consulta la base de datos.
//
// No se hace el salto contrario (con cookie → /dashboard) a propósito: una
// cookie caducada provocaría un bucle entre /login y /dashboard, porque el
// proxy la ve presente y el DAL la rechaza. Esa redirección la hace la página
// de login, que sí consulta la sesión de verdad.

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return NextResponse.next();

  if (request.cookies.has(SESSION_COOKIE_NAME)) return NextResponse.next();

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set(RETURN_TO_PARAM, pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

// Los prefijos deben ser literales: Next analiza el matcher en tiempo de build
// y descarta cualquier valor calculado (por eso no se deriva de la constante).
export const config = {
  matcher: [
    "/inicio/:path*",
    "/clases/:path*",
    "/estudios/:path*",
    "/cursos/:path*",
    "/entrenador/:path*",
    "/explorador/:path*",
    "/profesor/:path*",
    "/administracion/:path*",
  ],
};
