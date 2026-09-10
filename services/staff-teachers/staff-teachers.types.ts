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

/** Student who is a candidate to be assigned, with their current teacher if they have one. */
export interface AssignableStudent {
  id: string;
  displayName: string;
  email: string;
  currentTeacherName?: string;
}

/** Account without a teacher record: a candidate to become one. */
export interface LinkableUser {
  id: string;
  displayName: string;
  email: string;
}
