export interface StaffStudentSummary {
  id: string;
  displayName: string;
  email: string;
  /** Sin contraseña no puede iniciar sesión (cuenta dada de alta a medias). */
  hasPassword: boolean;
  activeTeacherName?: string;
  lastLoginAtIso?: string;
  lastLoginAtLabel?: string;
  createdAtLabel: string;
  href: string;
}

export interface StudentAssignmentHistoryItem {
  id: string;
  teacherId: string;
  teacherName: string;
  assignedAtIso: string;
  assignedAtLabel: string;
  endedAtIso?: string;
  endedAtLabel?: string;
  assignedByName?: string;
  note?: string;
  isActive: boolean;
}

export interface StudentClassParticipation {
  classId: string;
  title: string;
  teacherName: string;
  scheduledAtIso: string;
  dateLabel: string;
  statusLabel: string;
  attended: boolean;
  hasPayment: boolean;
}

export interface StaffStudentDetail {
  id: string;
  displayName: string;
  email: string;
  hasPassword: boolean;
  createdAtLabel: string;
  lastLoginAtLabel?: string;
  passwordUpdatedAtLabel?: string;
  assignments: StudentAssignmentHistoryItem[];
  classes: StudentClassParticipation[];
}

/** Opción de profesor para los selectores de asignación. */
export interface TeacherOption {
  id: string;
  displayName: string;
}

/**
 * Resultado de las acciones de cuenta (alta y reinicio de contraseña). Vive
 * aquí y no junto a las actions porque un módulo "use server" sólo puede
 * exportar funciones asíncronas: exportar este objeto desde allí rompe el build.
 */
export interface AccountActionState {
  status: "idle" | "ok" | "error";
  message?: string;
  /** Sólo presente en la respuesta inmediata de la acción. Nunca se persiste. */
  tempPassword?: string;
  userId?: string;
}

export const ACCOUNT_INITIAL_STATE: AccountActionState = { status: "idle" };
