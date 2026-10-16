// What the panel that gives a teacher's material to their students draws, as
// data: the services map their shares to it (a collection's in
// services/studies, a series' in services/teacher-exercises) and the sections
// hand it to `StudentSharePanel` with the two actions already bound.

/** A student the material was given to. */
export interface StudentShareRow {
  userId: string;
  displayName: string;
  email: string;
  /** «14 de octubre de 2026»: since when they have it. */
  sharedAtLabel: string;
}

/** A student of the teacher's, who may be given it. */
export interface StudentShareOption {
  id: string;
  displayName: string;
  email: string;
}

/** What is given: the panel's heading and the line under it say it. */
export type StudentShareSubject = "collection" | "series";

/** A share or an unshare, bound to its collection or series; it reads `studentId`. */
export type StudentShareAction = (formData: FormData) => Promise<void>;
