import type { AttendanceMarkView } from "@/components/platform/shared/attendance-row/attendance-row.types";
import type { PopupFormState } from "@/services/shared/form-state";

// What finalizing a class is about, as data: the services map a class to
// it, a row carries it in its action, and the popup draws the rows from it.

export interface FinalizeClassStudent {
  id: string;
  displayName: string;
  /** Lines under the name: the email, or nothing. */
  details?: string[];
  mark: AttendanceMarkView;
}

export interface FinalizeClassData {
  classId: string;
  classTitle: string;
  /** «lun 12 oct · 17:00–18:00 · Diego Salas». */
  whenLine: string;
  isGroup: boolean;
  teacherName: string;
  students: FinalizeClassStudent[];
  summary: string | null;
  recordingUrl: string | null;
}

/** `finalizeClass`, `changeAttendance` (the teacher's) or `finalizeClassAsStaff`, bound by the popup to its class. */
export type FinalizeClassAction = (
  classId: string,
  prev: PopupFormState,
  formData: FormData,
) => Promise<PopupFormState>;
