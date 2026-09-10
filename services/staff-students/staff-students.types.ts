export interface StaffStudentSummary {
  id: string;
  displayName: string;
  email: string;
  /** Without a password they cannot log in (account created by halves). */
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

/** Teacher option for the assignment selectors. */
export interface TeacherOption {
  id: string;
  displayName: string;
}

/**
 * Result of the account actions (creation and password reset). It lives here
 * and not next to the actions because a "use server" module can only export
 * async functions: exporting this object from there breaks the build.
 */
export interface AccountActionState {
  status: "idle" | "ok" | "error";
  message?: string;
  /** Only present in the action's immediate response. It is never persisted. */
  tempPassword?: string;
  userId?: string;
}

export const ACCOUNT_INITIAL_STATE: AccountActionState = { status: "idle" };
