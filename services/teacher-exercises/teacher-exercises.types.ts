import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseAuthoringGame,
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseAttemptRowData } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.types";
import type { ExercisePickOption } from "@/components/platform/shared/exercise-picker/exercise-picker.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";
import type { SeriesProgressData } from "@/components/platform/shared/series-progress-table/series-progress-table.types";
import type {
  StudentShareOption,
  StudentShareRow,
} from "@/components/platform/shared/student-share-panel/student-share-panel.types";
import type { ExerciseFormTab } from "@/services/shared/exercise-form";
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

/** An exercise the teacher may add to a series: theirs and usable, or the library's (D08); what `ExercisePicker` offers. */
export type SeriesPickOption = ExercisePickOption;

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
  /** The tab the editor opens on: «Solución» for a new exercise seeded from a game («Crear ejercicio desde aquí»). */
  initialTab?: ExerciseFormTab;
}

/** A move of one of the teacher's study games: where «Crear ejercicio desde aquí» (D11) starts a new exercise. */
export interface ExerciseGameSeed {
  studyId: string;
  gameId: string;
  /** The dotted path of the move; «» is the game's start. */
  path: string;
}

/** A study game as the prefill of «Crear ejercicio desde aquí» reads it. */
export interface ExerciseSeedGameRow {
  id: string;
  title: string | null;
  white: string;
  black: string;
  event: string | null;
  playedAt: Date | null;
  pgn: string;
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

// --- The teacher's view of attempts (D24, D45) ---------------------------

/** An attempt as the student's tab reads it, with what the row needs of its exercise, series, context and mistake. */
export interface TeacherAttemptRow {
  id: string;
  exerciseId: string | null;
  seriesId: string | null;
  createdAt: Date;
  durationMs: number | null;
  hintsUsed: number;
  solutionShown: boolean;
  result: { code: string };
  context: { code: string; label: string };
  exercise: { id: string; title: string; teacherId: string | null; startFen: string } | null;
  series: { title: string } | null;
  mistakeDetails: { fen: string; expectedSan: string; playedSan: string }[];
}

/** `/profesor/alumnos/[studentId]/ejercicios`: the student's attempts the teacher may see, the latest first. */
export interface StudentExerciseAttemptsView {
  student: { id: string; displayName: string };
  attempts: ExerciseAttemptRowData[];
  /** How many the teacher may see in all; `attempts` holds the first `page × pageSize`. */
  total: number;
  page: number;
  pageSize: number;
  /** Over every visible attempt: distinct exercises passed, attempts, and attempts in the last seven days. */
  stats: { solved: number; attempts: number; lastWeek: number };
}

/** An attempt as the series' progress reads it. */
export interface SeriesProgressAttemptRow {
  userId: string;
  exerciseId: string | null;
  result: { code: string };
}

/** The series page on «Progreso». */
export type SeriesProgressView = SeriesProgressData;
