import "server-only";
import { cache } from "react";
import { DEMO_USER_EMAIL } from "@/constants/platform/demo-user.const";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

// DAL de identidad: ÚNICO punto que decide quién es el usuario actual.
// Hoy devuelve al alumno demo del seed; cuando exista autenticación real,
// sólo hay que cambiar esta función (leer la sesión y buscar por su id) sin
// tocar servicios ni UI. Todos los servicios y server actions deben resolver
// el usuario a través de aquí, nunca confiar en datos del cliente.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const db = getPlatformDb();
  const user = await db.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) {
    throw new Error("No existe el usuario demo de la plataforma. Ejecuta `npm run db:seed`.");
  }
  return { id: user.id, email: user.email, displayName: user.displayName, createdAt: user.createdAt };
});
