import type { ClassStatusCode } from "@/constants/platform/class-codes.const";

export interface TeacherClassBrief {
  id: string;
  title: string;
  /** Instante en UTC; la interfaz lo reformatea en la zona del profesor. */
  scheduledAtIso: string;
  dateLabel: string;
  timeLabel: string;
  durationMin: number;
  statusCode: ClassStatusCode;
  statusLabel: string;
  participantCount: number;
  href: string;
}

/** Clase terminada a la que le falta documentación: asistencia o resumen. */
export interface TeacherPendingClass {
  id: string;
  title: string;
  dateLabel: string;
  scheduledAtIso: string;
  needsAttendance: boolean;
  needsSummary: boolean;
  href: string;
}

export interface TeacherDashboard {
  displayName: string;
  today: TeacherClassBrief[];
  upcoming: TeacherClassBrief[];
  activeStudentCount: number;
  pending: TeacherPendingClass[];
}

export interface TeacherProfile {
  displayName: string;
  title?: string;
  bio?: string;
  photo?: string;
  timezone?: string;
  email: string;
}
