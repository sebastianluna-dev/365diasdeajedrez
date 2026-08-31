// Regla de la asignación alumno↔profesor, aislada del acceso a datos para
// poder probarla: reasignar CIERRA la fila activa y crea otra, nunca borra.
// El historial es el registro de quién llevó a quién y cuándo.
//
// Esto NO es la verdad última: dos peticiones simultáneas pasan las dos por
// aquí. Quien impide de verdad dos asignaciones activas es el índice único
// parcial `teacher_student_one_active`, y la action captura su P2002.

export interface ActiveAssignment {
  id: string;
  teacherId: string;
}

export interface AssignmentPlan {
  /** Filas activas que hay que cerrar (`endedAt = now`). */
  closeIds: string[];
  /** Si hay que crear la fila nueva. */
  create: boolean;
  /** El alumno ya estaba con ese mismo profesor: no se toca nada. */
  alreadyAssigned: boolean;
}

export function planAssignment(active: ActiveAssignment[], teacherId: string): AssignmentPlan {
  // Reasignar al mismo profesor sería cerrar y reabrir la misma relación:
  // ensuciaría el historial sin cambiar nada.
  if (active.some((assignment) => assignment.teacherId === teacherId)) {
    return { closeIds: [], create: false, alreadyAssigned: true };
  }

  return { closeIds: active.map((assignment) => assignment.id), create: true, alreadyAssigned: false };
}
