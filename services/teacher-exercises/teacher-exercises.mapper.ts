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
import { EXERCISE_LIMITS } from "@/constants/platform/exercise.const";
import { teacherRoutes } from "@/lib/platform-routes";
import { formatClassDay } from "@/lib/format-class-when";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import type { StudentShareRow } from "@/components/platform/shared/student-share-panel/student-share-panel.types";
import { exerciseFacts } from "@/services/shared/exercise-facts";
import { levelOfDifficulty, type DifficultyLevel } from "@/services/shared/exercise-level";
import { isExerciseContentLocked } from "@/services/shared/exercise-status-transitions";
import { seriesItemAvailability } from "@/services/shared/exercise-visibility-rules";
import type {
  ExerciseSeedGameRow,
  SeriesItemData,
  SeriesItemRow,
  SeriesPickOption,
  SeriesProgressAttemptRow,
  TeacherAttemptRow,
  TeacherExerciseRow,
  TeacherSeriesCard,
} from "./teacher-exercises.types";
import type {
  ExerciseAttemptOutcome,
  ExerciseAttemptRowData,
} from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.types";
import type {
  SeriesProgressCell,
  SeriesProgressData,
} from "@/components/platform/shared/series-progress-table/series-progress-table.types";
import { ATTEMPT_CONTEXT, ATTEMPT_RESULT } from "@/constants/platform/training-codes.const";
import { sanToSpanish } from "@/lib/chess/notation";
import { moveSquaresOfSan } from "@/lib/chess/replay";
import { exerciseKindLabel, playerOfStart } from "@/lib/chess/exercise-labels";

// From the rows of a teacher's exercises to what the bank and the editor
// draw. Pure: what a status allows is read from the shared transitions
// (`exercise-status-transitions.ts`), so a card or a button never offers what
// the server would refuse.

/** A new exercise's difficulty until the author says otherwise: the middle of the scale most students are in. */
export const NEW_EXERCISE_DIFFICULTY = 1200;

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
    orientation: playerOfStart(row.startFen),
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

/** A PGN header's value as a source field: «?» and «-» mean nothing, and the column's length is kept. */
function sourceName(value: string | null, max: number): string | null {
  const trimmed = (value ?? "").trim();
  if (trimmed === "" || trimmed === "?" || trimmed === "-") return null;
  return trimmed.slice(0, max);
}

/**
 * «Crear ejercicio desde aquí» (D11): a new exercise seeded from a move of
 * one of the teacher's study games. The seed (`exerciseSeedFromGame`) gives
 * the position and the solution; the game gives the title — its own, or
 * «Blancas – Negras, 1999» —, the source fields and `sourceGameId`. The rest
 * is a new exercise's.
 */
export function exercisePrefillFromGame(
  game: ExerciseSeedGameRow,
  seed: { solutionPgn: string },
): ExerciseAuthoringExercise {
  const white = sourceName(game.white, EXERCISE_LIMITS.sourcePlayer);
  const black = sourceName(game.black, EXERCISE_LIMITS.sourcePlayer);
  const year = game.playedAt?.getUTCFullYear() ?? null;
  const inRange = year !== null && year >= EXERCISE_LIMITS.sourceYearMin && year <= EXERCISE_LIMITS.sourceYearMax;
  const sourceYear = inRange ? year : null;
  const pairing = [white ?? "Blancas", black ?? "Negras"].join(" – ");
  const title = game.title?.trim() || (sourceYear ? `${pairing}, ${sourceYear}` : pairing);
  return {
    ...newExercisePrefill(),
    solutionPgn: seed.solutionPgn,
    title: title.slice(0, EXERCISE_LIMITS.title),
    sourceWhite: white,
    sourceBlack: black,
    sourceEvent: sourceName(game.event, EXERCISE_LIMITS.sourceEvent),
    sourceYear,
    sourceGameId: game.id,
  };
}

// --- Series ------------------------------------------------------------------

/** What a series' item or a pickable exercise says of itself: «Mate en 2 · 1400 · Intermedio» (the shared wording). */
export { exerciseFacts };

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

// --- The teacher's view of attempts (D24, D45) ---------------------------

/** The four words the student saw, now the teacher's: «Ver la solución» is failed whatever the moves were (D20). */
export function attemptOutcomeOf(
  attempt: Pick<TeacherAttemptRow, "result" | "hintsUsed" | "solutionShown">,
): ExerciseAttemptOutcome {
  if (attempt.solutionShown) return "solutionShown";
  if (attempt.result.code !== ATTEMPT_RESULT.PASSED) return "failed";
  return attempt.hintsUsed > 0 ? "hinted" : "solved";
}

const OUTCOME_LABELS: Record<ExerciseAttemptOutcome, string> = {
  solved: "Resuelto",
  hinted: "Resuelto con pista",
  failed: "Fallado",
  solutionShown: "Vio la solución",
};

/** «42 s», «1 min 5 s»; null when the time was not kept. */
export function formatAttemptDuration(durationMs: number | null): string | null {
  if (durationMs === null || durationMs < 0) return null;
  const seconds = Math.round(durationMs / 1000);
  if (seconds === 0) return "menos de 1 s";
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`;
}

/**
 * Where an attempt was made: its series by title, «De una serie eliminada»
 * for one whose series is gone (D45: the row keeps its SERIES context with no
 * series); its class by topic («Clase: Repaso de la Najdorf») or by day
 * («Clase del mié 14 oct», the academy's zone, with the year once it is not
 * `now`'s) when it has none, «De un bloque de clase eliminado» when the block
 * is gone (D29: the attempt's `classBlockId` goes null when the block is
 * deleted or changes kind, while the class may well still exist); or the
 * context's own label («Práctica libre», «Repaso»…).
 */
export function attemptWhereLabel(
  attempt: Pick<TeacherAttemptRow, "context" | "series" | "classBlock">,
  now: Date,
): string {
  if (attempt.context.code === ATTEMPT_CONTEXT.SERIES) {
    return attempt.series ? `Serie: ${attempt.series.title}` : "De una serie eliminada";
  }
  if (attempt.context.code === ATTEMPT_CONTEXT.CLASS) {
    const cls = attempt.classBlock?.class;
    if (!cls) return "De un bloque de clase eliminado";
    const title = cls.title?.trim();
    // Dated against `now`: a row is read long after, so «Hoy» would lie, and a class of another year says its year.
    return title ? `Clase: ${title}` : `Clase del ${formatClassDay(cls.scheduledAt, STUDY_DAY_TIMEZONE, now)}`;
  }
  return attempt.context.label;
}

/**
 * An attempt as the student's tab draws it (D24). The exercise opens in the
 * editor only when it is the teacher's own; the mistake — the first wrong
 * move, the one the attempt holds — comes with its two moves in Spanish and
 * their arrows, the played one in the danger tone and the expected one in
 * the success tone, over the position it was played in.
 */
export function mapExerciseAttemptRow(
  attempt: TeacherAttemptRow,
  teacherId: string,
  now: Date,
): ExerciseAttemptRowData {
  const mistake = attempt.mistakeDetails[0];
  const played = mistake ? moveSquaresOfSan(mistake.fen, mistake.playedSan) : undefined;
  const expected = mistake ? moveSquaresOfSan(mistake.fen, mistake.expectedSan) : undefined;
  const outcome = attemptOutcomeOf(attempt);
  return {
    id: attempt.id,
    title: attempt.exercise?.title ?? "Ejercicio",
    href:
      attempt.exercise && attempt.exercise.teacherId === teacherId
        ? teacherRoutes.exerciseDetail(attempt.exercise.id)
        : null,
    atIso: attempt.createdAt.toISOString(),
    atLabel: formatSpanishDate(attempt.createdAt),
    outcome,
    outcomeLabel: OUTCOME_LABELS[outcome],
    whereLabel: attemptWhereLabel(attempt, now),
    durationLabel: formatAttemptDuration(attempt.durationMs),
    mistake:
      mistake && outcome === "failed"
        ? {
            fen: mistake.fen,
            orientation: playerOfStart(attempt.exercise?.startFen ?? mistake.fen),
            playedLabel: sanToSpanish(mistake.playedSan),
            expectedLabel: sanToSpanish(mistake.expectedSan),
            // The expected move first and the played one last: arrows draw in
            // order, and the two often share the from-square, so the mistake
            // has to be the one on top.
            arrows: [
              ...(expected ? [{ ...expected, tone: "success" as const }] : []),
              ...(played ? [{ ...played, tone: "danger" as const }] : []),
            ],
          }
        : null,
  };
}

/**
 * Who solved what in a series (D24), from the attempts made IN it: a cell is
 * solved with a pass there, failed with attempts and no pass, untried with
 * none — the student's own marks (`seriesMarks`), counted per student. An
 * attempt elsewhere marks nothing, as it marks nothing for the student.
 */
export function mapSeriesProgress(
  items: readonly { exerciseId: string; title: string }[],
  students: readonly { id: string; displayName: string }[],
  attempts: readonly SeriesProgressAttemptRow[],
): SeriesProgressData {
  const cells = new Map<string, SeriesProgressCell>();
  for (const attempt of attempts) {
    if (attempt.exerciseId === null) continue;
    const key = `${attempt.userId}:${attempt.exerciseId}`;
    const cell = cells.get(key) ?? { state: "untried", attempts: 0 };
    cell.attempts += 1;
    if (attempt.result.code === ATTEMPT_RESULT.PASSED) cell.state = "solved";
    else if (cell.state !== "solved") cell.state = "failed";
    cells.set(key, cell);
  }
  const rows = students.map((student) => {
    const own = items.map(
      (item) => cells.get(`${student.id}:${item.exerciseId}`) ?? { state: "untried" as const, attempts: 0 },
    );
    return {
      userId: student.id,
      displayName: student.displayName,
      href: teacherRoutes.studentExercises(student.id),
      cells: own,
      solved: own.filter((cell) => cell.state === "solved").length,
    };
  });
  return {
    items: items.map((item, index) => ({ exerciseId: item.exerciseId, n: index + 1, title: item.title })),
    students: rows,
    completed: items.length === 0 ? 0 : rows.filter((row) => row.solved === items.length).length,
  };
}
