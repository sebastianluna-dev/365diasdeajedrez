import { cache } from "react";
import type {
  ExerciseAuthoringCatalogs,
  ExerciseAuthoringExercise,
  ExerciseAuthoringGame,
} from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import { EXERCISE_STATUS, type ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { DifficultyLevel } from "@/services/shared/exercise-level";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { buildOwnExercisesWhere, buildPickableExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { exerciseSeedFromGame } from "@/lib/chess/exercise-format";
import {
  exercisePrefillFromGame,
  mapAuthoringExercise,
  mapExerciseCard,
  mapSeriesCard,
  mapSeriesItem,
  mapSeriesPickOption,
  mapSeriesShare,
  newExercisePrefill,
  teacherExercisePermissions,
  teacherSaveButtons,
} from "./teacher-exercises.mapper";
import type {
  ExerciseGameSeed,
  TeacherExerciseEditor,
  TeacherExercisesTab,
  TeacherExercisesView,
  TeacherSeriesEditor,
} from "./teacher-exercises.types";

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

/**
 * The shares of a teacher's series that reach a student now: to one still
 * assigned to that teacher (D07). A share outlives a reassignment — the
 * series comes back if the student is assigned again — but reaches nobody
 * meanwhile, so the teacher's screens do not count it.
 */
export function activeSeriesSharesWhere(teacherId: string): Prisma.ExerciseSeriesShareWhereInput {
  return { user: { studentAssignments: { some: { teacherId, endedAt: null } } } };
}

/**
 * «Ejercicios»: the teacher's exercises in use, or the archived ones, the
 * last changed first; or, on the «Series» view, their series.
 */
export async function getTeacherExercises(tab: TeacherExercisesTab): Promise<TeacherExercisesView> {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();
  const own = buildOwnExercisesWhere(teacher.id);
  const archived = { status: { code: EXERCISE_STATUS.ARCHIVED } };
  const inUse = { status: { code: { not: EXERCISE_STATUS.ARCHIVED } } };

  const [rows, seriesRows, levelRows, active, archivedCount, seriesCount] = await Promise.all([
    tab === "series"
      ? []
      : db.exercise.findMany({
          where: { AND: [own, tab === "archivados" ? archived : inUse] },
          select: EXERCISE_SELECT,
          orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        }),
    tab === "series"
      ? db.exerciseSeries.findMany({
          where: { teacherId: teacher.id },
          select: {
            id: true,
            title: true,
            description: true,
            items: { select: { exercise: { select: { teacherId: true, status: { select: { code: true } } } } } },
            _count: { select: { shares: { where: activeSeriesSharesWhere(teacher.id) } } },
          },
          orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        })
      : [],
    levels(),
    db.exercise.count({ where: { AND: [own, inUse] } }),
    db.exercise.count({ where: { AND: [own, archived] } }),
    db.exerciseSeries.count({ where: { teacherId: teacher.id } }),
  ]);
  return {
    tab,
    exercises: rows.map((row) => mapExerciseCard(row, levelRows)),
    series: seriesRows.map((row) =>
      mapSeriesCard(
        { ...row, items: row.items.map((item) => item.exercise), shareCount: row._count.shares },
        teacher.id,
      ),
    ),
    counts: { active, archived: archivedCount, series: seriesCount },
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

/**
 * «Crear ejercicio desde aquí» (D11): the prefill of a new exercise from a
 * move of one of the teacher's OWN study games — the position after the move
 * as the start, what follows as the solution, the game's players and date as
 * the source. The ownership travels in the `where` (`database.userId`): a
 * game of someone else's study, a broken path or a game that does not read
 * all answer null, and the editor opens as a plain new exercise.
 */
export async function getExercisePrefillFromGame(
  teacher: { userId: string },
  from: ExerciseGameSeed,
): Promise<ExerciseAuthoringExercise | null> {
  const game = await getPlatformDb().game.findFirst({
    where: { id: from.gameId, databaseId: from.studyId, database: { userId: teacher.userId } },
    select: { id: true, title: true, white: true, black: true, event: true, playedAt: true, pgn: true },
  });
  if (!game) return null;
  const seed = exerciseSeedFromGame(game.pgn, from.path);
  return seed ? exercisePrefillFromGame(game, seed) : null;
}

/** The editor of a new exercise; with `from`, seeded from a move of one of the teacher's games, open on «Solución». */
export async function getNewTeacherExerciseEditor(from?: ExerciseGameSeed): Promise<TeacherExerciseEditor> {
  const { user } = await requireTeacher();
  const [catalogs, games, prefill] = await Promise.all([
    getExerciseCatalogs(),
    listTeacherExerciseGames(),
    from ? getExercisePrefillFromGame({ userId: user.id }, from) : null,
  ]);
  return {
    exercise: prefill ?? newExercisePrefill(),
    version: "new",
    statusLabel: null,
    catalogs,
    games,
    permissions: teacherExercisePermissions(null),
    buttons: teacherSaveButtons(null),
    initialTab: prefill ? "solution" : undefined,
  };
}

// --- Series (D18, D31; PLAN.md §6.2) ---------------------------------------

/** The teacher's students now: who a series may be given to. */
async function assignedStudents(teacherId: string) {
  const assignments = await getPlatformDb().teacherStudent.findMany({
    where: { teacherId, endedAt: null },
    select: { student: { select: { id: true, displayName: true, email: true } } },
    orderBy: { student: { displayName: "asc" } },
  });
  return assignments.map((assignment) => assignment.student);
}

/**
 * The editor of one of the teacher's series, or null when it is not theirs
 * (the page answers 404): its items in order with whether the students still
 * see each, what «Agregar ejercicios» may add (their usable exercises and the
 * library's, D08, not in it yet), and who has it. Memoised per request:
 * the page's metadata reads it too.
 */
export const getTeacherSeriesEditor = cache(async (seriesId: string): Promise<TeacherSeriesEditor | null> => {
  const { teacher } = await requireTeacher();
  const db = getPlatformDb();
  const [series, pickable, students, levelRows] = await Promise.all([
    db.exerciseSeries.findFirst({
      where: { id: seriesId, teacherId: teacher.id },
      select: {
        id: true,
        title: true,
        description: true,
        updatedAt: true,
        items: {
          select: {
            order: true,
            exercise: {
              select: {
                id: true,
                title: true,
                teacherId: true,
                difficulty: true,
                mateIn: true,
                kind: { select: { code: true } },
                status: { select: { code: true } },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        shares: {
          where: activeSeriesSharesWhere(teacher.id),
          select: { createdAt: true, user: { select: { id: true, displayName: true, email: true } } },
          orderBy: { user: { displayName: "asc" } },
        },
      },
    }),
    db.exercise.findMany({
      where: {
        AND: [buildPickableExercisesWhere({ teacherId: teacher.id }), { seriesItems: { none: { seriesId } } }],
      },
      select: {
        id: true,
        title: true,
        difficulty: true,
        mateIn: true,
        kind: { select: { code: true } },
        topics: { select: { topic: { select: { code: true, label: true, order: true } } } },
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    }),
    assignedStudents(teacher.id),
    levels(),
  ]);
  if (!series) return null;
  return {
    series: {
      id: series.id,
      title: series.title,
      description: series.description,
      version: series.updatedAt.toISOString(),
    },
    items: series.items.map((item) => mapSeriesItem(item, teacher.id, levelRows)),
    pickable: pickable.map(mapSeriesPickOption),
    shares: series.shares.map(mapSeriesShare),
    students,
  };
});
