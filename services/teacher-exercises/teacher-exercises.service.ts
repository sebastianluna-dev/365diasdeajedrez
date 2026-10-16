import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringGame,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import { EXERCISE_STATUS, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { DifficultyLevel } from "@/services/shared/exercise-level";
import { buildOwnExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import {
  mapAuthoringExercise,
  mapExerciseCard,
  newExercisePrefill,
  teacherExercisePermissions,
  teacherSaveButtons,
} from "./teacher-exercises.mapper";
import type { TeacherExerciseEditor, TeacherExercisesTab, TeacherExercisesView } from "./teacher-exercises.types";

// The teacher's exercise bank (D06, D07, D08; PLAN.md §4): their own
// exercises, every status, and the editor's data. Every function opens with
// requireTeacher() and the owner travels inside the `where` — another
// teacher's exercise is not a row to discard afterwards, it is not found.
// The flag (`EXERCISES_ENABLED`) is the pages' and the actions' to check.

/** What the bank and the editor read of an exercise. */
const EXERCISE_SELECT = {
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

const LEVEL_SELECT = { slug: true, name: true, order: true, eloMin: true, eloMax: true, isActive: true } as const;

async function levels(): Promise<DifficultyLevel[]> {
  return getPlatformDb().level.findMany({ select: LEVEL_SELECT, orderBy: { order: "asc" } });
}

/** «Ejercicios»: the teacher's exercises in use, or the archived ones, the last changed first. */
export async function getTeacherExercises(tab: TeacherExercisesTab): Promise<TeacherExercisesView> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();
  const own = buildOwnExercisesWhere(teacher.id);
  const archived = { status: { code: EXERCISE_STATUS.ARCHIVED } };
  const inUse = { status: { code: { not: EXERCISE_STATUS.ARCHIVED } } };

  const [rows, levelRows, active, archivedCount] = await Promise.all([
    db.exercise.findMany({
      where: { AND: [own, tab === "archivados" ? archived : inUse] },
      select: EXERCISE_SELECT,
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    }),
    levels(),
    db.exercise.count({ where: { AND: [own, inUse] } }),
    db.exercise.count({ where: { AND: [own, archived] } }),
  ]);
  return {
    tab,
    exercises: rows.map((row) => mapExerciseCard(row, levelRows)),
    counts: { active, archived: archivedCount },
  };
}

/** The catalogs the editor draws from: the two kinds, the topics with their parents and the levels. */
export async function getExerciseCatalogs(): Promise<ExerciseAuthoringCatalogs> {
  const db = getPlatformDb();
  const [kinds, topics, levelRows] = await Promise.all([
    db.exerciseKind.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } }),
    db.topic.findMany({
      select: { code: true, label: true, parent: { select: { code: true } } },
      orderBy: { order: "asc" },
    }),
    levels(),
  ]);
  return {
    kinds: kinds.map((kind) => ({ code: kind.code as ExerciseKindCode, label: kind.label })),
    topics: topics.map((topic) => ({ code: topic.code, label: topic.label, parentCode: topic.parent?.code ?? null })),
    levels: levelRows,
  };
}

/** The games of the teacher's own studies, for «Desde una partida»: only ids and names travel. */
export async function listTeacherExerciseGames(): Promise<ExerciseAuthoringGame[]> {
  const { user } = await requireTeacher();
  const databases = await getPlatformDb().gameDatabase.findMany({
    where: { userId: user.id },
    select: {
      name: true,
      games: { select: { id: true, white: true, black: true }, orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }] },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
  return databases.flatMap((database) =>
    database.games.map((game) => ({ id: game.id, label: `${game.white} – ${game.black}`, studyName: database.name })),
  );
}

/** The PGN of a game of the teacher's own studies, or null: what «Desde una partida» reads. */
export async function getTeacherGamePgn(gameId: string): Promise<string | null> {
  const { user } = await requireTeacher();
  const game = await getPlatformDb().game.findFirst({
    where: { id: gameId, database: { userId: user.id } },
    select: { pgn: true },
  });
  return game?.pgn ?? null;
}

/** Whether a game is one of the teacher's own studies': what `sourceGameId` may point at. */
export async function isTeacherGame(userId: string, gameId: string): Promise<boolean> {
  const found = await getPlatformDb().game.count({ where: { id: gameId, database: { userId } } });
  return found > 0;
}

/** The editor of one of the teacher's exercises, or null when it is not theirs (the page answers 404). */
export async function getTeacherExerciseEditor(exerciseId: string): Promise<TeacherExerciseEditor | null> {
  const { teacher } = await requireTeacher();
  const [row, catalogs, games] = await Promise.all([
    getPlatformDb().exercise.findFirst({
      where: { id: exerciseId, ...buildOwnExercisesWhere(teacher.id) },
      select: EXERCISE_SELECT,
    }),
    getExerciseCatalogs(),
    listTeacherExerciseGames(),
  ]);
  if (!row) return null;
  const exercise = mapAuthoringExercise(row);
  return {
    exercise,
    version: row.updatedAt.toISOString(),
    statusLabel: row.status.label,
    catalogs,
    games,
    permissions: teacherExercisePermissions(exercise.statusCode),
    buttons: teacherSaveButtons(exercise.statusCode),
  };
}

/** The editor of a new exercise. */
export async function getNewTeacherExerciseEditor(): Promise<TeacherExerciseEditor> {
  await requireTeacher();
  const [catalogs, games] = await Promise.all([getExerciseCatalogs(), listTeacherExerciseGames()]);
  return {
    exercise: newExercisePrefill(),
    version: "new",
    statusLabel: null,
    catalogs,
    games,
    permissions: teacherExercisePermissions(null),
    buttons: teacherSaveButtons(null),
  };
}
