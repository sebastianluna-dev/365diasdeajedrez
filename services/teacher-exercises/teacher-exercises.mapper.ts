import { INITIAL_FEN } from "chessops/fen";
import type {
  ExerciseAuthoringExercise,
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";
import {
  EXERCISE_KIND,
  EXERCISE_STATUS,
  type ExerciseKindCode,
  type ExerciseStatusCode,
} from "@/constants/platform/exercise-codes.const";
import { emptySolutionPgn } from "@/lib/chess/exercise-format";
import { teacherRoutes } from "@/lib/platform-routes";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { StudentShareRow } from "@/components/platform/shared/student-share-panel/student-share-panel.types";
import { levelOfDifficulty, type DifficultyLevel } from "@/services/shared/exercise-level";
import { isExerciseContentLocked } from "@/services/shared/exercise-status-transitions";
import { seriesItemAvailability } from "@/services/shared/exercise-visibility-rules";
import type {
  SeriesItemData,
  SeriesItemRow,
  SeriesPickOption,
  TeacherExerciseRow,
  TeacherSeriesCard,
} from "./teacher-exercises.types";

// From the rows of a teacher's exercises to what the bank and the editor
// draw. Pure: what a status allows is read from the shared transitions
// (`exercise-status-transitions.ts`), so a card or a button never offers what
// the server would refuse.

/** A new exercise's difficulty until the author says otherwise: the middle of the scale most students are in. */
export const NEW_EXERCISE_DIFFICULTY = 1200;

/** «Secuencia», «Mate en 2». */
export function exerciseKindLabel(kind: ExerciseKindCode, mateIn: number | null): string {
  return kind === EXERCISE_KIND.MATE_IN ? `Mate en ${mateIn ?? "N"}` : "Secuencia";
}

/** The side to move of a FEN, which the board puts at the bottom. */
export function sideToMove(fen: string): "white" | "black" {
  return fen.split(" ")[1] === "b" ? "black" : "white";
}

/**
 * The row actions a teacher's exercise offers: «Duplicar» always; «Archivar»
 * while it is a draft or ready (in review or in the library it is not the
 * teacher's to take away); «Restaurar» when archived; «Eliminar» only for one
 * nobody has tried and that is not in review or in the library — with
 * attempts, its history is kept and it is archived instead.
 */
export function teacherExerciseAllowed(status: ExerciseStatusCode, attemptCount: number): ExerciseCardData["allowed"] {
  const own = status === EXERCISE_STATUS.DRAFT || status === EXERCISE_STATUS.READY;
  return {
    duplicate: true,
    archive: own,
    restore: status === EXERCISE_STATUS.ARCHIVED,
    delete: attemptCount === 0 && (own || status === EXERCISE_STATUS.ARCHIVED),
  };
}

/** What the teacher may do in the editor, by the status. */
export function teacherExercisePermissions(status: ExerciseStatusCode | null): ExerciseAuthoringPermissions {
  const locked = status !== null && isExerciseContentLocked(status, "teacher");
  return {
    contentLocked: locked ? (status === EXERCISE_STATUS.IN_REVIEW ? "inReview" : "inLibrary") : null,
    canDuplicate: status !== null,
  };
}

const SAVING = "Guardando…";

/**
 * The save bar of a teacher's exercise: a new one or a draft is kept as a
 * draft or marked ready (the accent); a ready one is only saved, and stays
 * ready, so it must stay complete; an archived one is saved as it is. One in
 * review or in the library has none: its content is locked.
 */
export function teacherSaveButtons(status: ExerciseStatusCode | null): ExerciseSaveButton[] {
  if (status === null || status === EXERCISE_STATUS.DRAFT) {
    return [
      { intent: "draft", label: "Guardar borrador", pendingLabel: SAVING, accent: false, needsReadiness: false },
      {
        intent: "ready",
        label: "Guardar y marcar como listo",
        pendingLabel: SAVING,
        accent: true,
        needsReadiness: true,
      },
    ];
  }
  if (status === EXERCISE_STATUS.READY) {
    return [{ intent: "save", label: "Guardar", pendingLabel: SAVING, accent: true, needsReadiness: true }];
  }
  if (status === EXERCISE_STATUS.ARCHIVED) {
    return [{ intent: "save", label: "Guardar", pendingLabel: SAVING, accent: true, needsReadiness: false }];
  }
  return [];
}

/** The topics of a row in the catalog's order. */
function topicsOf(row: Pick<TeacherExerciseRow, "topics">) {
  return [...row.topics].map(({ topic }) => topic).sort((left, right) => left.order - right.order);
}

/** A card of the bank. */
export function mapExerciseCard(row: TeacherExerciseRow, levels: readonly DifficultyLevel[]): ExerciseCardData {
  const status = row.status.code as ExerciseStatusCode;
  return {
    id: row.id,
    href: teacherRoutes.exerciseDetail(row.id),
    title: row.title,
    startFen: row.startFen,
    orientation: sideToMove(row.startFen),
    statusCode: status,
    statusLabel: row.status.label,
    kindLabel: exerciseKindLabel(row.kind.code as ExerciseKindCode, row.mateIn),
    difficulty: row.difficulty,
    levelName: levelOfDifficulty(row.difficulty, levels)?.name ?? null,
    playerMoves: row.playerMoves,
    topicLabels: topicsOf(row).map((topic) => topic.label),
    allowed: teacherExerciseAllowed(status, row._count.attempts),
  };
}

/** A saved exercise as the editor opens it. */
export function mapAuthoringExercise(row: TeacherExerciseRow): ExerciseAuthoringExercise {
  return {
    id: row.id,
    statusCode: row.status.code as ExerciseStatusCode,
    solutionPgn: row.solutionPgn,
    kind: row.kind.code as ExerciseKindCode,
    mateIn: row.mateIn,
    title: row.title,
    prompt: row.prompt,
    difficulty: row.difficulty,
    topicCodes: topicsOf(row).map((topic) => topic.code),
    hints: [...row.hints],
    explanation: row.explanation,
    sourceWhite: row.sourceWhite,
    sourceBlack: row.sourceBlack,
    sourceEvent: row.sourceEvent,
    sourceYear: row.sourceYear,
    sourceGameId: row.sourceGameId,
  };
}

/** A new exercise: the standard start, no moves, a sequence, nothing written. */
export function newExercisePrefill(): ExerciseAuthoringExercise {
  return {
    id: null,
    statusCode: null,
    solutionPgn: emptySolutionPgn(INITIAL_FEN),
    kind: EXERCISE_KIND.SEQUENCE,
    mateIn: null,
    title: "",
    prompt: null,
    difficulty: NEW_EXERCISE_DIFFICULTY,
    topicCodes: [],
    hints: [],
    explanation: null,
    sourceWhite: null,
    sourceBlack: null,
    sourceEvent: null,
    sourceYear: null,
    sourceGameId: null,
  };
}

// --- Series ------------------------------------------------------------------

/** What a series' item or a pickable exercise says of itself: «Mate en 2 · 1400 · Intermedio». */
export function exerciseFacts(
  exercise: { kind: { code: string }; mateIn: number | null; difficulty: number },
  levels: readonly DifficultyLevel[] = [],
): string {
  const level = levelOfDifficulty(exercise.difficulty, levels)?.name;
  return [exerciseKindLabel(exercise.kind.code as ExerciseKindCode, exercise.mateIn), exercise.difficulty, level]
    .filter((part) => part !== undefined)
    .join(" · ");
}

/**
 * An item of a series in its editor. The teacher's own exercise opens in
 * their editor; one of the library's has no page of theirs. Whether the
 * students still see it is the visibility rule's own condition
 * (`seriesItemAvailability`), so the warning and what the student gets
 * cannot disagree.
 */
export function mapSeriesItem(
  row: SeriesItemRow,
  seriesTeacherId: string,
  levels: readonly DifficultyLevel[],
): SeriesItemData {
  const own = row.exercise.teacherId === seriesTeacherId;
  return {
    exerciseId: row.exercise.id,
    title: row.exercise.title,
    href: own ? teacherRoutes.exerciseDetail(row.exercise.id) : null,
    facts: exerciseFacts(row.exercise, levels),
    availability: seriesItemAvailability(
      { teacherId: row.exercise.teacherId, statusCode: row.exercise.status.code as ExerciseStatusCode },
      seriesTeacherId,
    ),
  };
}

/** A series in the bank's «Series» view. */
export function mapSeriesCard(
  row: {
    id: string;
    title: string;
    description: string | null;
    items: Pick<SeriesItemRow["exercise"], "teacherId" | "status">[];
    shareCount: number;
  },
  seriesTeacherId: string,
): TeacherSeriesCard {
  return {
    id: row.id,
    href: teacherRoutes.exerciseSeries(row.id),
    title: row.title,
    description: row.description,
    itemCount: row.items.length,
    studentCount: row.shareCount,
    unavailableCount: row.items.filter(
      (exercise) =>
        seriesItemAvailability(
          { teacherId: exercise.teacherId, statusCode: exercise.status.code as ExerciseStatusCode },
          seriesTeacherId,
        ) !== "available",
    ).length,
  };
}

/** An exercise «Agregar ejercicios» offers: its title, its facts and its topics in the catalog's order. */
export function mapSeriesPickOption(
  row: Pick<TeacherExerciseRow, "id" | "title" | "difficulty" | "mateIn" | "kind" | "topics">,
): SeriesPickOption {
  return {
    id: row.id,
    title: row.title,
    facts: exerciseFacts(row),
    topics: topicsOf(row)
      .map((topic) => topic.label)
      .join(", "),
  };
}

/** A student who has the series, as `StudentSharePanel` lists them. */
export function mapSeriesShare(share: {
  createdAt: Date;
  user: { id: string; displayName: string; email: string };
}): StudentShareRow {
  return {
    userId: share.user.id,
    displayName: share.user.displayName,
    email: share.user.email,
    sharedAtLabel: formatSpanishDate(share.createdAt),
  };
}
