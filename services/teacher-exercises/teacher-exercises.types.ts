import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseAuthoringGame,
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";

/** The bank's two views: what is in use, and what was archived. */
export type TeacherExercisesTab = "activos" | "archivados";

/** «Ejercicios» of a teacher: their own exercises, newest first. */
export interface TeacherExercisesView {
  tab: TeacherExercisesTab;
  exercises: ExerciseCardData[];
  counts: { active: number; archived: number };
}

/** What the editor of a teacher's exercise opens with. */
export interface TeacherExerciseEditor {
  exercise: ExerciseAuthoringExercise;
  /** When it was last saved (ISO), so a save that stays on the page mounts the editor again on what was stored. */
  version: string;
  /** The status in words, for the page's header; null for a new one. */
  statusLabel: string | null;
  catalogs: ExerciseAuthoringCatalogs;
  games: ExerciseAuthoringGame[];
  permissions: ExerciseAuthoringPermissions;
  buttons: ExerciseSaveButton[];
}

/** An exercise as the bank and the editor read it from the database. */
export interface TeacherExerciseRow {
  id: string;
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
  updatedAt: Date;
  _count: { attempts: number };
}
