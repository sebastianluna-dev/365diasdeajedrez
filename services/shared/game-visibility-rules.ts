import type { Prisma } from "@/lib/platform-db/generated/client";

// La REGLA de visibilidad, separada de quién la pregunta.
//
// Módulo puro (sólo tipos de Prisma, nada de DAL ni de server-only) para que
// puedan ejercitarla los tests y los scripts con ids explícitos: es la frontera
// que impide que el buscador enseñe partidas de los estudios privados de otro
// alumno, y comprobarla no debería exigir montar una petición con sesión.
//
// El envoltorio que resuelve la identidad vive en game-visibility.ts.

export interface GameViewer {
  userId: string;
  /** Id de Teacher si quien mira es profesor activo; ausente si no lo es. */
  teacherId?: string;
}

/**
 * Bases de partidas visibles: las propias y las de los cursos EMPEZADOS. No
 * basta con que el curso esté publicado: su base es material del curso y se
 * abre al entrar en él.
 */
export function buildVisibleDatabasesWhere({ userId }: GameViewer): Prisma.GameDatabaseWhereInput {
  return {
    OR: [{ userId }, { course: { progresses: { some: { userId } } } }],
  };
}

/**
 * Partidas visibles. Es más ancho que «las partidas de las bases visibles»,
 * porque hay dos caminos que no pasan por la propiedad de la base:
 *
 * - las vistas en clase, que llegan por referencia desde un bloque de la clase
 *   (ClassBlock.gameId) y pueden vivir en la base de otra persona;
 * - las de los alumnos con asignación ACTIVA, si quien mira es su profesor;
 *   mismo criterio que los guards de lib/platform-auth/guards.ts.
 */
export function buildVisibleGamesWhere({ userId, teacherId }: GameViewer): Prisma.GameWhereInput {
  const visible: Prisma.GameWhereInput[] = [
    { database: { userId } },
    { database: { course: { progresses: { some: { userId } } } } },
    { classBlocks: { some: { class: { participants: { some: { userId } } } } } },
  ];

  if (teacherId) {
    visible.push({
      database: { user: { studentAssignments: { some: { teacherId, endedAt: null } } } },
    });
  }

  return { OR: visible };
}
