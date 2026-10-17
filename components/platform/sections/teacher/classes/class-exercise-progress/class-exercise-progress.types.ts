import type { ExerciseAttemptRowData } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.types";

// What the teacher reads of an EXERCISE block of their class (D29): per
// exercise, how many of the seated students solved it and every attempt made
// from the block, as data. The teacher's service maps it; nothing is stored.

/** One exercise of the block, with who solved it. */
export interface ClassExerciseProgressItem {
  exerciseId: string;
  /** Its number in the block, from 1. */
  n: number;
  title: string;
  /** «Mate en 2 · 1400». */
  facts: string;
  /** Seated students with a PASSED attempt from this block. */
  solvedCount: number;
  /** «2 de 3 lo resolvieron». */
  label: string;
  /** The students no longer get it (archived, or taken out of the library; `seriesItemAvailability`): «Ya no está disponible». */
  unavailable?: boolean;
  /** The seated students' attempts from this block, the latest first; each row's title is the student. */
  attempts: ExerciseAttemptRowData[];
  /** The seated students with no attempt here, by name. */
  untried: string[];
}

export interface ClassExerciseProgressData {
  blockId: string;
  /** The seats not moved: the denominator. */
  seatCount: number;
  exercises: ClassExerciseProgressItem[];
}
