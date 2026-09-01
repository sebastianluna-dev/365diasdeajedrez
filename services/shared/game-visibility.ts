import { cache } from "react";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getTeacherContext } from "@/lib/platform-auth/roles";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { buildVisibleDatabasesWhere, buildVisibleGamesWhere } from "./game-visibility-rules";

// Quién puede ver qué partidas, resuelto para la petición en curso. La regla
// está en game-visibility-rules (módulo puro); aquí sólo se le dice quién
// pregunta.
//
// Lo comparten «Mis estudios» y el buscador por posición: una discrepancia
// entre los dos sería una fuga, porque el buscador enseñaría en un listado
// agregado partidas que el alumno no puede abrir.
//
// Estas funciones sólo construyen el `where`; quien las usa sigue teniendo que
// meterlo en su consulta. No autorizan por sí solas.

/** Quién mira: su id y, si es profesor activo, el id de su ficha de profesor. */
const getViewer = cache(async () => {
  const user = await getCurrentUser();
  const teacherContext = await getTeacherContext();
  return { userId: user.id, teacherId: teacherContext?.teacher.id };
});

export const getVisibleDatabasesWhere = cache(async (): Promise<Prisma.GameDatabaseWhereInput> =>
  buildVisibleDatabasesWhere(await getViewer()),
);

export const getVisibleGamesWhere = cache(async (): Promise<Prisma.GameWhereInput> =>
  buildVisibleGamesWhere(await getViewer()),
);
