import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LOGIN_PATH,
  PROTECTED_PATH_PREFIXES,
  RETURN_TO_PARAM,
  SESSION_COOKIE_NAME,
  SESSION_ENTRY_PATH,
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
// El salto contrario (con cookie → su panel) sólo se hace desde la portada, y
// sin decidir aquí el destino: se manda a /entrar, un route handler que
// consulta la sesión de verdad y reparte por rol, y que si la cookie está
// caducada la borra y devuelve a la portada. Así `/` no lee cookies y puede
// prerenderizarse, y una cookie vieja no deja a nadie sin portada ni provoca
// un bucle con el login (que sigue comprobando la sesión real, no la cookie).

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
  if (!isProtected || hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL(LOGIN_PATH, request.url);
  loginUrl.searchParams.set(RETURN_TO_PARAM, pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

// Los prefijos deben ser literales: Next analiza el matcher en tiempo de build
// y descarta cualquier valor calculado (por eso no se deriva de la constante;
// `proxy.test.ts` vigila que las dos listas no se separen). La portada entra
// sólo por el salto de quien trae cookie; sin ella pasa tal cual y se sirve la
// versión prerenderizada.
export const config = {
  matcher: [
    "/",
    "/inicio/:path*",
    "/clases/:path*",
    "/estudios/:path*",
    "/cursos/:path*",
    "/lecciones/:path*",
    "/entrenador/:path*",
    "/explorador/:path*",
    "/profesor/:path*",
    "/administracion/:path*",
  ],
};
