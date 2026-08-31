export interface StaffTeacherSummary {
  id: string;
  displayName: string;
  title?: string;
  email: string;
  isActive: boolean;
  activeStudentCount: number;
  classCount: number;
  href: string;
}

export interface TeacherStudentAssignment {
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignedAtIso: string;
  assignedAtLabel: string;
  note?: string;
  studentHref: string;
}

export interface StaffTeacherClass {
  id: string;
  title: string;
  scheduledAtIso: string;
  dateLabel: string;
  statusLabel: string;
  participantCount: number;
}

export interface StaffTeacherDetail {
  id: string;
  userId: string;
  displayName: string;
  title?: string;
  bio?: string;
  photo?: string;
  timezone?: string;
  email: string;
  isActive: boolean;
  students: TeacherStudentAssignment[];
  classes: StaffTeacherClass[];
}

/** Alumno candidato a ser asignado, con su profesor actual si lo tiene. */
export interface AssignableStudent {
  id: string;
  displayName: string;
  email: string;
  currentTeacherName?: string;
}

/** Cuenta sin ficha de profesor: candidata a convertirse en una. */
export interface LinkableUser {
  id: string;
  displayName: string;
  email: string;
}
