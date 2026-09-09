import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/constants/platform/auth.const";
import { getSessionContext, type CurrentUser } from "@/lib/platform-auth/current-user";
import type { SessionUser } from "@/lib/platform-auth/session";
import { platformRoutes } from "@/lib/platform-routes";

// Roles de la plataforma. No hay tabla de roles ni columna en `User`: el rol es
// la existencia de una fila (`Teacher`, `Staff`), el patrón que ya establecía
// el modelo. Son ortogonales — un mismo usuario puede ser profesor Y staff — y
// se leen de la MISMA consulta que resuelve la sesión (ver session.ts), así que
// preguntar por el rol no cuesta una consulta extra.
//
// Nada de esto sustituye a la autorización de datos: `require*` decide si se
// puede ENTRAR a un panel; qué filas se ven se sigue decidiendo dentro del
// `where` de cada servicio y con los guards de guards.ts.

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
  // Un profesor desactivado conserva sus clases y su historial, pero deja de
  // tener panel: es la baja sin borrar datos.
  if (!session?.teacher || !session.teacher.isActive) return null;

  const { id, email, displayName, createdAt } = session;
  return { user: { id, email, displayName, createdAt }, teacher: session.teacher };
});

export const getStaffContext = cache(async (): Promise<StaffContext | null> => {
  const session = await getSessionContext();
  if (!session?.staff) return null;

  const { id, email, displayName, createdAt } = session;
  return { user: { id, email, displayName, createdAt }, staffId: session.staff.id };
});

/**
 * Regla de roles a partir de la sesión. La comparten `getSessionRoles` y el
 * route handler de /entrar, que no tiene render y por eso no pasa por los
 * `cache()` de este módulo.
 */
export function rolesOf(session: SessionUser | null): SessionRoles {
  return {
    isTeacher: session?.teacher?.isActive === true,
    isStaff: session?.staff !== null && session?.staff !== undefined,
  };
}

/** Para la navegación: qué grupos de menú se pintan. Nunca autoriza nada. */
export const getSessionRoles = cache(async (): Promise<SessionRoles> => rolesOf(await getSessionContext()));

/**
 * Frontera del panel del profesor: PRIMER await de toda página y de toda
 * server action de `/teacher`. Sin sesión manda al login (el proxy ya corta el
 * caso normal, pero una cookie caducada llega hasta aquí); con sesión pero sin
 * el rol, al dashboard: la cuenta es válida, sólo que ese panel no es suyo.
 */
export async function requireTeacher(): Promise<TeacherContext> {
  const context = await getTeacherContext();
  if (context) return context;

  const session = await getSessionContext();
  redirect(session ? platformRoutes.dashboard : LOGIN_PATH);
}

/** Frontera del panel de Administración. Mismas reglas que `requireTeacher`. */
export async function requireStaff(): Promise<StaffContext> {
  const context = await getStaffContext();
  if (context) return context;

  const session = await getSessionContext();
  redirect(session ? platformRoutes.dashboard : LOGIN_PATH);
}
