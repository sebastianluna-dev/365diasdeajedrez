import type { ExerciseSolverLink } from "@/components/platform/shared/exercise-solver/exercise-solver.types";
import type { ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { exerciseKindLabel, playerOfStart } from "@/lib/chess/exercise-labels";
import { platformRoutes } from "@/lib/platform-routes";
import { exerciseSolveKey, isSameStudyDay } from "@/services/shared/exercise-attempt.service";
import { levelOfDifficulty, type DifficultyLevel } from "@/services/shared/exercise-level";
import type { LessonPractice, LessonPracticeItem } from "./lesson-practice.types";

// From the rows the lesson reads to what its card and its list draw. Pure, so
// the counting by solve key and the one accent are tested here.

/** A lesson's exercise in play, as the service reads it. */
export interface LessonExerciseRow {
  id: string;
  copiedFromId: string | null;
  lessonId: string | null;
  title: string;
  kind: { code: string };
  mateIn: number | null;
  difficulty: number;
  startFen: string;
}

/** A state row of the student, as the counting reads it. */
export interface PracticeStateRow {
  exerciseId: string;
  firstSolvedAt: Date | null;
  lastAttemptAt: Date | null;
}

/** Where the lesson is: what its practice routes need. */
export interface LessonPlace {
  courseId: string;
  chapterOrder: number;
  lessonId: string;
}

/** The ids whose states speak for an exercise: itself and its solve key (a copy's library original). */
export function practiceFamilyOf(exercise: Pick<LessonExerciseRow, "id" | "copiedFromId" | "lessonId">): string[] {
  return [...new Set([exercise.id, exerciseSolveKey(exercise)])];
}

/** «Mate en 2 · 1400 · Intermedio». */
function factsOf(exercise: LessonExerciseRow, levels: readonly DifficultyLevel[]): string {
  const level = levelOfDifficulty(exercise.difficulty, levels)?.name;
  return [exerciseKindLabel(exercise.kind.code as ExerciseKindCode, exercise.mateIn), exercise.difficulty, level]
    .filter((part) => part !== undefined)
    .join(" · ");
}

/**
 * The lesson's exercises with the student's standing: «resuelto» when any
 * row of the exercise's family has `firstSolvedAt` (D22, D28: the original
 * and its lesson copy are one exercise), and the way on to the first not
 * solved yet that can still count today — one attempted this study day would
 * open unscored (§2.7), so the accent skips it. Null with no exercise in play.
 */
export function lessonPracticeOf(
  place: LessonPlace,
  rows: readonly LessonExerciseRow[],
  states: readonly PracticeStateRow[],
  levels: readonly DifficultyLevel[],
  now: Date,
): LessonPractice | null {
  if (rows.length === 0) return null;
  const byId = new Map(states.map((state) => [state.exerciseId, state]));
  const items: LessonPracticeItem[] = rows.map((exercise, index) => ({
    n: index + 1,
    href: platformRoutes.lessonPractice(place.courseId, place.chapterOrder, place.lessonId, index + 1),
    title: exercise.title,
    facts: factsOf(exercise, levels),
    startFen: exercise.startFen,
    orientation: playerOfStart(exercise.startFen),
    solved: practiceFamilyOf(exercise).some((id) => byId.get(id)?.firstSolvedAt != null),
  }));
  const triedToday = (exercise: LessonExerciseRow) =>
    practiceFamilyOf(exercise).some((id) => {
      const last = byId.get(id)?.lastAttemptAt;
      return last != null && isSameStudyDay(last, now);
    });
  const nextIndex = rows.findIndex((exercise, index) => !items[index]?.solved && !triedToday(exercise));
  const started = rows.some((exercise) => practiceFamilyOf(exercise).some((id) => byId.get(id)?.lastAttemptAt != null));
  const start: ExerciseSolverLink | null =
    nextIndex < 0
      ? null
      : {
          href: platformRoutes.lessonPractice(place.courseId, place.chapterOrder, place.lessonId, nextIndex + 1),
          label: started ? "Continuar" : "Empezar",
        };
  return { total: items.length, solved: items.filter((item) => item.solved).length, items, start };
}

/** «2 / 3». */
export function lessonPosition(n: number, total: number): string {
  return `${n} / ${total}`;
}

/** What comes after the n-th exercise of the lesson: the next one, or nothing at the last. */
export function nextInLesson(place: LessonPlace, n: number, total: number): ExerciseSolverLink | null {
  return n < total
    ? {
        href: platformRoutes.lessonPractice(place.courseId, place.chapterOrder, place.lessonId, n + 1),
        label: "Siguiente ejercicio",
      }
    : null;
}
