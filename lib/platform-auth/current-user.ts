import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { readSessionUser } from "@/lib/platform-auth/session";

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// DAL de identidad: ÚNICO punto que decide quién es el usuario actual. Los
// servicios y las server actions lo resuelven siempre por aquí y nunca confían
// en un id que venga del cliente.
//
// `proxy.ts` hace un rechazo optimista mirando sólo si existe la cookie; esta
// es la comprobación de verdad (la que consulta la sesión en base de datos), y
// es la que protege también a las server actions, que son alcanzables por POST
// directo sin pasar por la navegación.

/** Usuario de la sesión, o null si no hay ninguna válida. No redirige. */
export const getSessionUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await readSessionUser();
  if (!session) return null;

  const { id, email, displayName, createdAt } = session;
  return { id, email, displayName, createdAt };
});

/**
 * Usuario de la sesión o redirección al login. Es lo que usan las páginas y
 * acciones de la zona privada: si devuelve, hay identidad verificada.
 *
 * Matiz del caso «cookie presente pero sesión ya no válida» (caducada o
 * revocada): el proxy la deja pasar, y para cuando esta redirección se lanza
 * la respuesta ya ha empezado a transmitirse, así que Next la manda dentro del
 * stream y el estado HTTP es 200 en vez de 307. El navegador redirige igual y
 * no se filtra ningún dato del alumno (nada llega a renderizarse), pero un
 * cliente sin JavaScript se quedaría viendo el armazón vacío. Se acepta porque
 * el caso frecuente —entrar sin cookie— sí lo corta el proxy con un 307 limpio.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const user = await getSessionUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
});
