import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseAuthoringGame,
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";
import type { ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import type { ExerciseOwnerKind } from "@/services/shared/exercise-status-transitions";

// What the staff's exercise screens read (PLAN.md §8; D07, D16, D32): the
// library, the review queue and one exercise with its review bar. Only
// exercises of a bank — a teacher's or the academy's — never a lesson's, which
// have their own editor under the course.

/** The staff bank's views: the library, the teachers' proposals, the academy's series. */
export type StaffExercisesTab = "biblioteca" | "revision" | "series";

/** A proposal in the queue: the exercise's card, with its author, and when it was proposed. */
export interface StaffReviewItem {
  card: ExerciseCardData;
  /** «Propuesto el 14 oct por Profesor Demo». */
  submittedLabel: string;
}

/** `/administracion/ejercicios` and `/administracion/ejercicios/revision`. */
export interface StaffExercisesView {
  tab: StaffExercisesTab;
  /** On «Biblioteca»: every exercise in the library, the last published first. */
  library: ExerciseCardData[];
  /** On «En revisión»: the proposals, the oldest first. */
  review: StaffReviewItem[];
  counts: { library: number; review: number; series: number };
}

/** The review bar of an exercise, as the staff sees it: what it is, who wrote it, and what the staff may decide. */
export interface StaffExerciseReview {
  statusCode: ExerciseStatusCode;
  statusLabel: string;
  owner: ExerciseOwnerKind;
  /** «Academia», or the teacher's name. */
  authorLabel: string;
  /** «Propuesto el 14 oct»; null when it was never proposed. */
  submittedLabel: string | null;
  /** The last decision: «Devuelto el 15 oct por Staff Demo»; null before any. */
  reviewedLabel: string | null;
  /** The note of the last decision, if any. */
  reviewNote: string | null;
  /** «Aprobar»: IN_REVIEW → PUBLISHED. */
  canApprove: boolean;
  /** «Devolver», with a note: IN_REVIEW → READY. */
  canReturn: boolean;
  /** «Quitar de la biblioteca», with a note: a teacher's PUBLISHED → READY; the academy's → ARCHIVED. */
  canRemove: boolean;
}

/** What the staff editor of a bank's exercise opens with. */
export interface StaffExerciseEditor {
  exercise: ExerciseAuthoringExercise;
  /** When it was last saved (ISO): a save that stays on the page mounts the editor again on what was stored. */
  version: string;
  catalogs: ExerciseAuthoringCatalogs;
  games: ExerciseAuthoringGame[];
  permissions: ExerciseAuthoringPermissions;
  buttons: ExerciseSaveButton[];
  review: StaffExerciseReview;
}

/** An exercise of a bank as the staff reads it from the database. */
export interface StaffExerciseRow {
  id: string;
  teacherId: string | null;
  teacher: { displayName: string } | null;
  title: string;
  prompt: string | null;
  difficulty: number;
  hints: string[];
  explanation: string | null;
  mateIn: number | null;
  solutionPgn: string;
  startFen: string;
  playerMoves: number;
  sourceWhite: string | null;
  sourceBlack: string | null;
  sourceEvent: string | null;
  sourceYear: number | null;
  sourceGameId: string | null;
  kind: { code: string };
  status: { code: string; label: string };
  topics: { topic: { code: string; label: string; order: number } }[];
  submittedAt: Date | null;
  reviewedAt: Date | null;
  reviewedBy: { displayName: string } | null;
  reviewNote: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  _count: { attempts: number };
}
