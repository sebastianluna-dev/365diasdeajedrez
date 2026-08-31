import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";

// Transiciones válidas del estado de una clase. Función pura y sin Prisma para
// poder probarla; la action la consulta antes de escribir.
//
// No hay borrado físico de clases: CANCELLED **es** el borrado. Una clase
// cancelada o terminada es historia y no vuelve atrás — si hubo un error, se
// crea otra clase.

const ALLOWED_TRANSITIONS: Record<ClassStatusCode, readonly ClassStatusCode[]> = {
  [CLASS_STATUS.SCHEDULED]: [
    CLASS_STATUS.LIVE,
    CLASS_STATUS.CANCELLED,
    // Se permite saltar a COMPLETED: es la clase que se documenta a posteriori,
    // sin haber pasado por «en vivo» en la plataforma.
    CLASS_STATUS.COMPLETED,
  ],
  [CLASS_STATUS.LIVE]: [CLASS_STATUS.COMPLETED, CLASS_STATUS.CANCELLED],
  [CLASS_STATUS.COMPLETED]: [],
  [CLASS_STATUS.CANCELLED]: [],
};

export function canTransitionClassStatus(from: ClassStatusCode, to: ClassStatusCode): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Estados a los que se puede pasar desde el actual (para pintar los botones). */
export function nextClassStatuses(from: ClassStatusCode): readonly ClassStatusCode[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}
