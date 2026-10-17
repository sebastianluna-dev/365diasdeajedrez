import "server-only";
import type { ExerciseAuthoringGame } from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import type { ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { staffRoutes } from "@/lib/platform-routes";
import { mapAuthoringExercise, newExercisePrefill } from "@/services/teacher-exercises/teacher-exercises.mapper";
import { getExerciseCatalogs } from "@/services/teacher-exercises/teacher-exercises.service";
import { LESSON_EXERCISE_PERMISSIONS, lessonExerciseStatusLabel, lessonSaveButtons } from "./lesson-exercises.mapper";
import type { LessonExerciseEditor } from "./staff-courses.types";

// The editor of a lesson's exercise, for the staff (D04, D05; PLAN.md §7.1):
// the same `ExerciseAuthoring` the teacher's bank uses, over an `Exercise`
// whose owner is the lesson. Every function opens with requireStaff(), and the
// lesson travels inside the `where` — an exercise of another lesson, or of a
// bank, is not found. Not behind `EXERCISES_ENABLED`: this replaces the
// lesson's panel that was live before phase 2, over data its migration moved.

/** What the editor reads of a lesson's exercise. */
const EDITOR_SELECT = {
  id: true,
  title: true,
  prompt: true,
  difficulty: true,
  hints: true,
  explanation: true,
  mateIn: true,
  solutionPgn: true,
  startFen: true,
  playerMoves: true,
  sourceWhite: true,
  sourceBlack: true,
  sourceEvent: true,
  sourceYear: true,
  sourceGameId: true,
  kind: { select: { code: true } },
  status: { select: { code: true, label: true } },
  topics: { select: { topic: { select: { code: true, label: true, order: true } } } },
  updatedAt: true,
  _count: { select: { attempts: true } },
} as const;

/** The lesson, with the ids the URL claims checked against it: a made-up pair is not found. */
async function lessonOf(courseId: string, chapterId: string, lessonId: string) {
  return getPlatformDb().lesson.findFirst({
    where: { id: lessonId, chapterId, chapter: { courseId } },
    select: { id: true, name: true, chapter: { select: { name: true } } },
  });
}

/** The chapter's collection, for «Desde una partida»: the games the lesson's content comes from. */
async function chapterGames(chapterId: string, chapterName: string): Promise<ExerciseAuthoringGame[]> {
  const games = await getPlatformDb().game.findMany({
    where: { database: { chapterId } },
    select: { id: true, title: true, white: true, black: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return games.map((game) => ({
    id: game.id,
    label: game.title ?? `${game.white} – ${game.black}`,
    studyName: chapterName,
  }));
}

/** The editor of one of the lesson's exercises, or null when the lesson or the exercise is not there (the page answers 404). */
export async function getLessonExerciseEditor(
  courseId: string,
  chapterId: string,
  lessonId: string,
  exerciseId: string,
): Promise<LessonExerciseEditor | null> {
  await requireStaff();
  const lesson = await lessonOf(courseId, chapterId, lessonId);
  if (!lesson) return null;
  const [row, catalogs, games] = await Promise.all([
    getPlatformDb().exercise.findFirst({ where: { id: exerciseId, lessonId }, select: EDITOR_SELECT }),
    getExerciseCatalogs(),
    chapterGames(chapterId, lesson.chapter.name),
  ]);
  if (!row) return null;
  const exercise = mapAuthoringExercise(row);
  const status = exercise.statusCode as ExerciseStatusCode;
  return {
    courseId,
    chapterId,
    lessonId,
    lessonName: lesson.name,
    lessonHref: staffRoutes.lessonDetail(courseId, chapterId, lessonId),
    exercise,
    version: row.updatedAt.toISOString(),
    statusLabel: lessonExerciseStatusLabel(status),
    catalogs,
    games,
    permissions: LESSON_EXERCISE_PERMISSIONS,
    buttons: lessonSaveButtons(status),
  };
}

/** The editor of a new exercise of the lesson, or null when the lesson is not there. */
export async function getNewLessonExerciseEditor(
  courseId: string,
  chapterId: string,
  lessonId: string,
): Promise<LessonExerciseEditor | null> {
  await requireStaff();
  const lesson = await lessonOf(courseId, chapterId, lessonId);
  if (!lesson) return null;
  const [catalogs, games] = await Promise.all([getExerciseCatalogs(), chapterGames(chapterId, lesson.chapter.name)]);
  return {
    courseId,
    chapterId,
    lessonId,
    lessonName: lesson.name,
    lessonHref: staffRoutes.lessonDetail(courseId, chapterId, lessonId),
    exercise: newExercisePrefill(),
    version: "new",
    statusLabel: null,
    catalogs,
    games,
    permissions: LESSON_EXERCISE_PERMISSIONS,
    buttons: lessonSaveButtons(null),
  };
}

/** The PGN of a game of the chapter's collection, or null: what the staff editor's «Desde una partida» reads. */
export async function getChapterGamePgn(courseId: string, chapterId: string, gameId: string): Promise<string | null> {
  await requireStaff();
  const game = await getPlatformDb().game.findFirst({
    where: { id: gameId, database: { chapterId, chapter: { courseId } } },
    select: { pgn: true },
  });
  return game?.pgn ?? null;
}

/** The minimum of Prisma the attempts check needs, so it also accepts a transaction. */
export type LessonAttemptsReader = Pick<Prisma.TransactionClient, "trainingAttempt">;

/**
 * Whether any exercise of these lessons was ever tried. `deleteLesson` and
 * `deleteChapter` refuse on it: the lesson's exercises cascade, but an attempt
 * is RESTRICT (a tried exercise is archived, never deleted), so the cascade
 * would otherwise end in an unhandled P2003. Lesson exercises are optional
 * (D26), so attempts can exist without any `LessonProgress`.
 */
export async function lessonHasAttempts(db: LessonAttemptsReader, lessonIds: readonly string[]): Promise<boolean> {
  if (lessonIds.length === 0) return false;
  const found = await db.trainingAttempt.findFirst({
    where: { exercise: { lessonId: { in: [...lessonIds] } } },
    select: { id: true },
  });
  return found !== null;
}
