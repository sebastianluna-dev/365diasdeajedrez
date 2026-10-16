import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseAuthoringGame,
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";
import type {
  StudentShareOption,
  StudentShareRow,
} from "@/components/platform/shared/student-share-panel/student-share-panel.types";
import type { SeriesItemAvailability } from "@/services/shared/exercise-visibility-rules";

/** The bank's three views: what is in use, what was archived, and the series. */
export type TeacherExercisesTab = "activos" | "archivados" | "series";

/** «Ejercicios» of a teacher: their own exercises, newest first, or their series. */
export interface TeacherExercisesView {
  tab: TeacherExercisesTab;
  /** Empty on the «Series» view. */
  exercises: ExerciseCardData[];
  /** Filled only on the «Series» view. */
  series: TeacherSeriesCard[];
  counts: { active: number; archived: number; series: number };
}

/** A series in the bank's «Series» view. */
export interface TeacherSeriesCard {
  id: string;
  href: string;
  title: string;
  description: string | null;
  itemCount: number;
  /** Students who have it now: a share reaches a student only while they are the teacher's. */
  studentCount: number;
  /** Items its students no longer see: archived, or taken out of the library. */
  unavailableCount: number;
}

/** An exercise of a series, in its order, as its editor lists it. */
export interface SeriesItemData {
  exerciseId: string;
  title: string;
  /** The teacher's own exercise opens in the editor; a library one has no page of theirs. */
  href: string | null;
  /** «Mate en 2 · 1400 · Intermedio». */
  facts: string;
  /** Whether the series' students see it now (`seriesItemAvailability`). */
  availability: SeriesItemAvailability;
}

/** An exercise the teacher may add to a series: theirs and usable, or the library's (D08). */
export interface SeriesPickOption {
  id: string;
  title: string;
  /** «Mate en 2 · 1400». */
  facts: string;
  /** The topics, «Táctica, Clavada». */
  topics: string;
}

/** What the editor of a series opens with. */
export interface TeacherSeriesEditor {
  series: {
    id: string;
    title: string;
    description: string | null;
    /** When it was last changed (ISO): its data popup opens again on what was stored. */
    version: string;
  };
  items: SeriesItemData[];
  /** What «Agregar ejercicios» offers: the pickable exercises not in the series yet, the last changed first. */
  pickable: SeriesPickOption[];
  /** Who has it now: shares to a student no longer assigned to the teacher reach nobody and are not listed. */
  shares: StudentShareRow[];
  /** The teacher's students now, to give it to. */
  students: StudentShareOption[];
}

/** An item as the series editor reads it. */
export interface SeriesItemRow {
  order: number;
  exercise: {
    id: string;
    title: string;
    teacherId: string | null;
    difficulty: number;
    mateIn: number | null;
    kind: { code: string };
    status: { code: string };
  };
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
