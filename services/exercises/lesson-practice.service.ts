import "server-only";
import { cache } from "react";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { exerciseFamilyIds } from "@/services/shared/exercise-attempt.service";
import { getExerciseViewer } from "@/services/shared/exercise-visibility";
import { solvableInContextWhere } from "@/services/shared/exercise-visibility-rules";
import { publishedLessonWhere } from "@/services/shared/published-content";
import { attemptedToday, mapSolverExercise } from "./exercises.mapper";
import { lessonPosition, lessonPracticeOf, nextInLesson, practiceFamilyOf } from "./lesson-practice.mapper";
import type { LessonPractice, LessonPracticeExercise } from "./lesson-practice.types";

// The student's side of a lesson's exercises (D25, D26; PLAN.md §7.1): what the
// lesson's page draws after the game — or instead of it — and the n-th
// exercise to solve, with the context LESSON. Every reader resolves the
// student in the DAL and reads only published lessons' exercises in play;
// the solve page reads the exercise again through the visibility rule for the
// path the attempt will claim, the same `where` the submit checks. Behind
// `EXERCISES_ENABLED`: off, the lesson has no practice and the page answers
// 404 (its caller).

/** What a lesson's exercise in play reads. */
const PRACTICE_SELECT = {
  id: true,
  copiedFromId: true,
  lessonId: true,
  title: true,
  kind: { select: { code: true } },
  mateIn: true,
  difficulty: true,
  startFen: true,
} as const;

const LEVEL_SELECT = { slug: true, name: true, order: true, eloMin: true, eloMax: true, isActive: true } as const;

/** The lesson's exercises in play: PUBLISHED and with a place in the lesson. */
const inPlay = { status: { code: EXERCISE_STATUS.PUBLISHED }, lessonOrder: { not: null } } as const;

/** The published lesson with its exercises in play, in order; null when it is not there or not published. */
const lessonWithExercises = cache(async (lessonId: string) =>
  getPlatformDb().lesson.findFirst({
    where: { id: lessonId, ...publishedLessonWhere },
    select: {
      id: true,
      name: true,
      chapter: { select: { courseId: true, order: true } },
      lessonExercises: { where: inPlay, select: PRACTICE_SELECT, orderBy: { lessonOrder: "asc" } },
    },
  }),
);

/**
 * The lesson's exercises and the student's standing with them (by solve key),
 * or null: with the flag off, with no exercise in play, or when the lesson is
 * not published. Memoised per request: the lesson's page and its metadata
 * read it.
 */
export const getLessonPractice = cache(async (lessonId: string): Promise<LessonPractice | null> => {
  if (!EXERCISES_ENABLED) return null;
  const user = await getCurrentUser();
  const lesson = await lessonWithExercises(lessonId);
  if (!lesson || lesson.lessonExercises.length === 0) return null;
  const db = getPlatformDb();
  const familyIds = [...new Set(lesson.lessonExercises.flatMap(practiceFamilyOf))];
  const [states, levels] = await Promise.all([
    db.userExerciseState.findMany({
      where: { userId: user.id, exerciseId: { in: familyIds } },
      select: { exerciseId: true, firstSolvedAt: true, lastAttemptAt: true },
    }),
    db.level.findMany({ select: LEVEL_SELECT, orderBy: { order: "asc" } }),
  ]);
  const place = { courseId: lesson.chapter.courseId, chapterOrder: lesson.chapter.order, lessonId: lesson.id };
  return lessonPracticeOf(place, lesson.lessonExercises, states, levels, new Date());
});

/**
 * The n-th exercise of a lesson (1-based, among the ones in play), or null.
 * The exercise is read again through the rule for the path the attempt will
 * claim (`solvableInContextWhere`, LESSON), and it opens unscored when its
 * family was attempted today.
 */
export async function getLessonPracticeExercise(lessonId: string, n: number): Promise<LessonPracticeExercise | null> {
  if (!EXERCISES_ENABLED) return null;
  if (!Number.isInteger(n) || n < 1) return null;
  const viewer = await getExerciseViewer();
  const lesson = await lessonWithExercises(lessonId);
  const item = lesson?.lessonExercises[n - 1];
  if (!lesson || !item) return null;

  const attempt = { kind: ATTEMPT_CONTEXT.LESSON } as const;
  const db = getPlatformDb();
  const exercise = await db.exercise.findFirst({
    where: { AND: [{ id: item.id }, solvableInContextWhere(attempt, viewer)] },
    select: {
      id: true,
      title: true,
      prompt: true,
      kind: { select: { code: true } },
      mateIn: true,
      solutionPgn: true,
      hints: true,
      explanation: true,
      difficulty: true,
      copiedFromId: true,
      lessonId: true,
    },
  });
  if (!exercise) return null;

  const states = await db.userExerciseState.findMany({
    where: { userId: viewer.userId, exerciseId: { in: await exerciseFamilyIds(db, exercise) } },
    select: { lastAttemptAt: true },
  });
  const place = { courseId: lesson.chapter.courseId, chapterOrder: lesson.chapter.order, lessonId: lesson.id };
  const href = platformRoutes.lessonDetail(place.courseId, place.chapterOrder, lesson.id);
  return {
    lesson: { id: lesson.id, name: lesson.name, href },
    exercise: mapSolverExercise(exercise),
    mode: attemptedToday(states, new Date()) ? "unscored" : "solve",
    context: { attempt, position: lessonPosition(n, lesson.lessonExercises.length) },
    next: nextInLesson(place, n, lesson.lessonExercises.length),
    back: { href, label: "Volver a la lección" },
  };
}
