import "server-only";
import { notFound } from "next/navigation";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

// Comprobaciones de pertenencia para las server actions de escritura, donde no
// basta con acotar un `where` de lectura (o donde repetirlo en cada action
// invita a olvidarlo). Toda action de /teacher que reciba un id del cliente
// pasa por aquí antes de escribir: un POST directo con el id de otro profesor
// tiene que morir aquí, no en la interfaz.
//
// Fallan con `notFound()` y no con un error de permisos a propósito: es el
// mismo efecto que «el servicio devolvió null» y no confirma que el recurso
// exista.

export async function assertTeacherOwnsClass(teacherId: string, classId: string): Promise<void> {
  const row = await getPlatformDb().class.findFirst({
    where: { id: classId, teacherId },
    select: { id: true },
  });
  if (!row) notFound();
}

/** Asignación ACTIVA: un alumno reasignado deja de ser accesible al instante. */
export async function assertTeacherHasStudent(teacherId: string, studentId: string): Promise<void> {
  const row = await getPlatformDb().teacherStudent.findFirst({
    where: { teacherId, studentId, endedAt: null },
    select: { id: true },
  });
  if (!row) notFound();
}

/**
 * El profesor puede referenciar en una clase una partida de un estudio suyo o
 * de un alumno con asignación activa.
 *
 * La validez se comprueba AL INSERTAR el bloque: si más tarde la asignación
 * termina, el bloque histórico sigue siendo válido. Es deliberado — reasignar
 * a un alumno no puede romper las clases que ya se dieron. (Si el alumno borra
 * su partida, `ClassBlock.gameId` es `onDelete: SetNull` y el renderer ya
 * tolera el bloque sin referencia.)
 */
export async function assertTeacherCanReferenceGame(
  teacher: { id: string; userId: string },
  gameId: string,
): Promise<void> {
  const row = await getPlatformDb().game.findFirst({
    where: {
      id: gameId,
      database: {
        OR: [
          { userId: teacher.userId },
          { user: { studentAssignments: { some: { teacherId: teacher.id, endedAt: null } } } },
        ],
      },
    },
    select: { id: true },
  });
  if (!row) notFound();
}
