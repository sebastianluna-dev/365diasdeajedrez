import type { ClassStatusCode } from "@/constants/platform/class-codes.const";
import type { StudySummary } from "@/services/studies/studies.types";

export interface AssignedStudentSummary {
  id: string;
  displayName: string;
  email: string;
  assignedAtLabel: string;
  assignedAtIso: string;
  /** Próxima clase compartida con este profesor, si la hay. */
  nextClassLabel?: string;
  nextClassIso?: string;
  lastActivityLabel?: string;
  lastActivityIso?: string;
  href: string;
}

export interface StudentCourseProgress {
  courseId: string;
  courseName: string;
  statusLabel: string;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  lastLessonName?: string;
}

export interface StudentSharedClass {
  id: string;
  title: string;
  scheduledAtIso: string;
  dateLabel: string;
  statusCode: ClassStatusCode;
  statusLabel: string;
  attended: boolean;
  href: string;
}

export interface StudentActivityItem {
  id: string;
  typeLabel: string;
  subjectTypeLabel: string;
  occurredAtIso: string;
  occurredAtLabel: string;
}

export interface AssignedStudentDetail {
  id: string;
  displayName: string;
  email: string;
  assignedAtLabel: string;
  assignedAtIso: string;
  note?: string;
  courses: StudentCourseProgress[];
  upcomingClasses: StudentSharedClass[];
  pastClasses: StudentSharedClass[];
  studies: StudySummary[];
  activity: StudentActivityItem[];
}
