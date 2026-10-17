import type {
  ExerciseAuthoringPermissions,
  ExerciseSaveButton,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseCardData } from "@/components/platform/shared/exercise-card/exercise-card.types";
import {
  EXERCISE_STATUS,
  type ExerciseKindCode,
  type ExerciseStatusCode,
} from "@/constants/platform/exercise-codes.const";
import { exerciseKindLabel, playerOfStart } from "@/lib/chess/exercise-labels";
import { staffRoutes } from "@/lib/platform-routes";
import { levelOfDifficulty, type DifficultyLevel } from "@/services/shared/exercise-level";
import type { LessonExerciseAdminRow } from "./staff-courses.types";

// From the rows of a lesson's exercises to what the staff panel and its editor
// draw (PLAN.md §7.1). Pure, so the row's words and the save bar are tested
// here; what a status allows is the shared transitions table's (DRAFT ⇄
// PUBLISHED, ARCHIVED from either and back to DRAFT, for the owner «lesson»),
// and a button or a word never offers what the writer would refuse.

/** A lesson's exercise as the panel reads it. */
export interface LessonExerciseRow {
  id: string;
  title: string;
  difficulty: number;
  mateIn: number | null;
  startFen: string;
  playerMoves: number;
  lessonOrder: number | null;
  kind: { code: string };
  status: { code: string };
  topics: { topic: { label: string; order: number } }[];
  _count: { attempts: number };
}

/**
 * How the lesson's panel words a status. The catalog says «En la biblioteca»
 * for PUBLISHED, which is true of the library's exercises and false of a
 * lesson's: a published one here is simply what the lesson's students see,
 * once the course is published.
 */
export function lessonExerciseStatusLabel(status: ExerciseStatusCode): string {
  switch (status) {
    case EXERCISE_STATUS.PUBLISHED:
      return "Publicado";
    case EXERCISE_STATUS.ARCHIVED:
      return "Archivado";
    default:
      return "Borrador";
  }
}

/**
 * The row's words: «Eliminar» only for one nobody has tried (it destroys the
 * row and, with it, the solution); «Archivar» for one with attempts, whose
 * history stays (PUBLISHED or DRAFT → ARCHIVED); «Restaurar» for an archived
 * one, which comes back to the lesson as a draft at the end (ARCHIVED →
 * DRAFT), like the teacher's bank's. Never «Duplicar»: a copy is a bank's
 * thing.
 */
export function lessonExerciseAllowed(status: ExerciseStatusCode, attemptCount: number): ExerciseCardData["allowed"] {
  const inLesson = status === EXERCISE_STATUS.DRAFT || status === EXERCISE_STATUS.PUBLISHED;
  return {
    duplicate: false,
    archive: inLesson && attemptCount > 0,
    restore: status === EXERCISE_STATUS.ARCHIVED,
    delete: inLesson && attemptCount === 0,
  };
}

/** The staff may always edit a lesson's exercise; a copy of it is a bank's thing, not a lesson's. */
export const LESSON_EXERCISE_PERMISSIONS: ExerciseAuthoringPermissions = { contentLocked: null, canDuplicate: false };

const SAVING = "Guardando…";

/**
 * The save bar of a lesson's exercise: a new one or a draft is kept as a
 * draft or published (the accent, which needs it complete); a published one
 * is only saved, and stays published, so it must stay complete; an archived
 * one is saved as it is.
 */
export function lessonSaveButtons(status: ExerciseStatusCode | null): ExerciseSaveButton[] {
  if (status === null || status === EXERCISE_STATUS.DRAFT) {
    return [
      { intent: "draft", label: "Guardar borrador", pendingLabel: SAVING, accent: false, needsReadiness: false },
      { intent: "publish", label: "Guardar y publicar", pendingLabel: SAVING, accent: true, needsReadiness: true },
    ];
  }
  if (status === EXERCISE_STATUS.PUBLISHED) {
    return [{ intent: "save", label: "Guardar", pendingLabel: SAVING, accent: true, needsReadiness: true }];
  }
  return [{ intent: "save", label: "Guardar", pendingLabel: SAVING, accent: true, needsReadiness: false }];
}

/** A row of the lesson's panel, drawn as a bank card whose title opens the staff editor. */
export function mapLessonExerciseRow(
  row: LessonExerciseRow,
  lesson: { courseId: string; chapterId: string; lessonId: string },
  levels: readonly DifficultyLevel[],
): LessonExerciseAdminRow {
  const status = row.status.code as ExerciseStatusCode;
  return {
    id: row.id,
    href: staffRoutes.lessonExercise(lesson.courseId, lesson.chapterId, lesson.lessonId, row.id),
    title: row.title,
    startFen: row.startFen,
    orientation: playerOfStart(row.startFen),
    statusCode: status,
    statusLabel: lessonExerciseStatusLabel(status),
    kindLabel: exerciseKindLabel(row.kind.code as ExerciseKindCode, row.mateIn),
    difficulty: row.difficulty,
    levelName: levelOfDifficulty(row.difficulty, levels)?.name ?? null,
    playerMoves: row.playerMoves,
    topicLabels: [...row.topics]
      .map(({ topic }) => topic)
      .sort((left, right) => left.order - right.order)
      .map((topic) => topic.label),
    allowed: lessonExerciseAllowed(status, row._count.attempts),
    lessonOrder: row.lessonOrder,
    attemptCount: row._count.attempts,
  };
}

/**
 * Whether a lesson is practice-only (D25): no game or PGN to read
 * (`lessonHasContent`), and a PUBLISHED exercise in play — what the student
 * sees and what `courseHasContent` counts (`coursePracticeLessonsWhere`); a
 * draft is the staff's alone and makes no lesson.
 */
export function isPracticeOnlyLesson(
  hasContent: boolean,
  exercises: readonly { lessonOrder: number | null; statusCode: ExerciseStatusCode }[],
): boolean {
  return (
    !hasContent &&
    exercises.some((exercise) => exercise.lessonOrder !== null && exercise.statusCode === EXERCISE_STATUS.PUBLISHED)
  );
}
