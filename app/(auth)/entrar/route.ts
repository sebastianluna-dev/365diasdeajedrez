import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/constants/platform/auth.const";
import { rolesOf } from "@/lib/platform-auth/roles";
import { readSessionUser } from "@/lib/platform-auth/session";
import { homeRouteFor } from "@/lib/platform-routes";

// Puerta de quien llega a la portada con cookie de sesión: `proxy.ts` lo manda
// aquí. Existe para que `/` pueda ser estática. La portada ya no lee cookies,
// y la decisión «¿a qué panel?» —que necesita la sesión real y el rol— se toma
// en esta petición aparte, que cuesta la misma consulta que antes hacía la
// portada en cada visita.
//
// Cookie caducada o revocada: se borra y se vuelve a la portada. Sin esto, el
// proxy (que sólo ve si la cookie existe, no si vale) reenviaría aquí una y
// otra vez y la portada quedaría inalcanzable hasta iniciar sesión.
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await readSessionUser();
  const destination = session ? homeRouteFor(rolesOf(session)) : "/";

  const response = NextResponse.redirect(new URL(destination, request.url));
  // La respuesta depende de la cookie de cada visitante: ni el navegador ni la
  // CDN pueden guardarla, o el panel de uno acabaría siendo el destino de otro.
  response.headers.set("Cache-Control", "private, no-store");
  if (!session) response.cookies.delete(SESSION_COOKIE_NAME);

  return response;
}
