import "server-only";
import { cache } from "react";
import type { ExerciseAuthoringGame } from "@/components/platform/shared/exercise-authoring/exercise-authoring.types";
import { EXERCISE_STATUS, type ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { DifficultyLevel } from "@/services/shared/exercise-level";
import { buildLibraryExercisesWhere, buildPickableExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import {
  mapAuthoringExercise,
  mapSeriesPickOption,
  newExercisePrefill,
} from "@/services/teacher-exercises/teacher-exercises.mapper";
import {
  getExerciseCatalogs,
  getExercisePrefillFromGame,
} from "@/services/teacher-exercises/teacher-exercises.service";
import type { ExerciseGameSeed } from "@/services/teacher-exercises/teacher-exercises.types";
import {
  mapStaffExerciseCard,
  mapStaffReviewItem,
  mapStaffSeriesCard,
  mapStaffSeriesItem,
  ofABank,
  staffExerciseOwner,
  staffExercisePermissions,
  staffExerciseReview,
  staffReadableExerciseWhere,
  staffSaveButtons,
} from "./staff-exercises.mapper";
import type {
  StaffExerciseEditor,
  StaffExercisesTab,
  StaffExercisesView,
  StaffSeriesEditor,
} from "./staff-exercises.types";

// The staff's exercise bank (PLAN.md §8; D07, D16, D32): the library, the
// teachers' proposals, the academy's own exercises and series, and one
// exercise with its review. Every function opens with requireStaff(). Only
// exercises of a bank — a teacher's or the academy's — are read: a lesson's
// (`lessonId` set) has its editor under the course and is not found here. The
// flag is the pages' and the actions' to check. The teacher's exercise
// services never reach this module (class-roles.test.ts,
// exercise-roles.test.ts).

/** What the staff editor and the review bar read of an exercise. */
const EXERCISE_SELECT = {
  id: true,
  teacherId: true,
  teacher: { select: { displayName: true } },
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
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: { select: { displayName: true } },
  reviewNote: true,
  publishedAt: true,
  updatedAt: true,
  _count: { select: { attempts: true } },
} as const;

const LEVEL_SELECT = { slug: true, name: true, order: true, eloMin: true, eloMax: true, isActive: true } as const;

async function levels(): Promise<DifficultyLevel[]> {
  return getPlatformDb().level.findMany({ select: LEVEL_SELECT, orderBy: { order: "asc" } });
}

/** The teachers' proposals, waiting. A bank's exercise is never a lesson's (`ofABank`, the mapper's). */
export function reviewQueueWhere(): Prisma.ExerciseWhereInput {
  return { ...ofABank, status: { code: EXERCISE_STATUS.IN_REVIEW } };
}

/** The academy's own exercises not in the library: its drafts and its archived ones, listed after the library. */
const academyAside = {
  ...ofABank,
  teacherId: null,
  status: { code: { in: [EXERCISE_STATUS.DRAFT, EXERCISE_STATUS.ARCHIVED] } },
} satisfies Prisma.ExerciseWhereInput;

/** What a series row reads: its items with what decides whether the students still see each. */
const SERIES_CARD_SELECT = {
  id: true,
  title: true,
  description: true,
  publishedAt: true,
  items: { select: { exercise: { select: { teacherId: true, status: { select: { code: true } } } } } },
} as const;

/**
 * `/administracion/ejercicios` («Biblioteca»: every exercise in the library,
 * the last published first, then the academy's drafts and archived ones),
 * `/administracion/ejercicios/revision` («En revisión»: the proposals, the
 * oldest first, with who and when) and `/administracion/ejercicios/series`
 * («Series»: the academy's series, the last changed first).
 */
export async function getStaffExercises(tab: StaffExercisesTab): Promise<StaffExercisesView> {
  await requireStaff();
  const db = getPlatformDb();
  const library = buildLibraryExercisesWhere();
  const queue = reviewQueueWhere();
  const [libraryRows, asideRows, reviewRows, seriesRows, levelRows, libraryCount, reviewCount, seriesCount] =
    await Promise.all([
      tab === "biblioteca"
        ? db.exercise.findMany({
            where: library,
            select: EXERCISE_SELECT,
            orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
          })
        : [],
      tab === "biblioteca"
        ? db.exercise.findMany({
            where: academyAside,
            select: EXERCISE_SELECT,
            orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
          })
        : [],
      tab === "revision"
        ? db.exercise.findMany({
            where: queue,
            select: EXERCISE_SELECT,
            orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
          })
        : [],
      tab === "series"
        ? db.exerciseSeries.findMany({
            where: { teacherId: null },
            select: SERIES_CARD_SELECT,
            orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
          })
        : [],
      levels(),
      db.exercise.count({ where: library }),
      db.exercise.count({ where: queue }),
      db.exerciseSeries.count({ where: { teacherId: null } }),
    ]);
  return {
    tab,
    library: [...libraryRows, ...asideRows].map((row) => mapStaffExerciseCard(row, levelRows)),
    review: reviewRows.map((row) => mapStaffReviewItem(row, levelRows)),
    series: seriesRows.map(mapStaffSeriesCard),
    counts: { library: libraryCount, review: reviewCount, series: seriesCount },
  };
}

/** The games of the staff member's own studies, for «Desde una partida»: only ids and names travel. */
export async function listStaffExerciseGames(): Promise<ExerciseAuthoringGame[]> {
  const { user } = await requireStaff();
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

/** The PGN of a game of the staff member's own studies, or null: what «Desde una partida» reads. */
export async function getStaffGamePgn(gameId: string): Promise<string | null> {
  const { user } = await requireStaff();
  const game = await getPlatformDb().game.findFirst({
    where: { id: gameId, database: { userId: user.id } },
    select: { pgn: true },
  });
  return game?.pgn ?? null;
}

/** Whether a game is one of the staff member's own studies': what `sourceGameId` may point at. */
export async function isStaffGame(userId: string, gameId: string): Promise<boolean> {
  const found = await getPlatformDb().game.count({ where: { id: gameId, database: { userId } } });
  return found > 0;
}

/**
 * The editor of a new academy exercise: the standard start, nothing written,
 * the staff's own games to pick from; with `from`, seeded from a move of one
 * of those games («Crear ejercicio desde aquí», D11), open on «Solución».
 */
export async function getNewStaffExerciseEditor(from?: ExerciseGameSeed): Promise<StaffExerciseEditor> {
  const { user } = await requireStaff();
  const [catalogs, games, prefill] = await Promise.all([
    getExerciseCatalogs(),
    listStaffExerciseGames(),
    from ? getExercisePrefillFromGame({ userId: user.id }, from) : null,
  ]);
  return {
    exercise: prefill ?? newExercisePrefill(),
    version: "new",
    catalogs,
    games,
    permissions: staffExercisePermissions("academy", null),
    buttons: staffSaveButtons("academy", null),
    review: null,
    initialTab: prefill ? "solution" : "position",
  };
}

/**
 * The staff editor of a bank's exercise with its review bar, or null (the
 * page answers 404): a lesson's exercise, or a teacher's that was never
 * proposed — a draft, a ready one, an archived one — is not the staff's to
 * read. The academy's own, a proposal, an exercise in the library and a
 * returned one (its decision in words) are. Memoised per request: the page's
 * metadata reads it too.
 */
export const getStaffExerciseEditor = cache(async (exerciseId: string): Promise<StaffExerciseEditor | null> => {
  await requireStaff();
  const [row, catalogs, games] = await Promise.all([
    getPlatformDb().exercise.findFirst({ where: staffReadableExerciseWhere(exerciseId), select: EXERCISE_SELECT }),
    getExerciseCatalogs(),
    listStaffExerciseGames(),
  ]);
  if (!row) return null;
  const owner = staffExerciseOwner(row);
  const status = row.status.code as ExerciseStatusCode;
  return {
    exercise: mapAuthoringExercise(row),
    version: row.updatedAt.toISOString(),
    catalogs,
    games,
    permissions: staffExercisePermissions(owner, status),
    buttons: staffSaveButtons(owner, status),
    review: staffExerciseReview(row),
    initialTab: owner === "teacher" && status !== EXERCISE_STATUS.PUBLISHED ? "try" : "solution",
  };
});

// --- The academy's series (PLAN.md §8, D32) ---------------------------------

/**
 * The editor of an academy series, or null when there is no such series of
 * the academy's (the page answers 404): its items in order with whether the
 * students still see each (only the library's are available, D32), what
 * «Agregar ejercicios» may add (the library's, not in it yet), and whether
 * it is published. Memoised per request: the page's metadata reads it too.
 */
export const getStaffSeriesEditor = cache(async (seriesId: string): Promise<StaffSeriesEditor | null> => {
  await requireStaff();
  const db = getPlatformDb();
  const [series, pickable, levelRows] = await Promise.all([
    db.exerciseSeries.findFirst({
      where: { id: seriesId, teacherId: null },
      select: {
        id: true,
        title: true,
        description: true,
        publishedAt: true,
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
      },
    }),
    db.exercise.findMany({
      where: { AND: [buildPickableExercisesWhere({ teacherId: null }), { seriesItems: { none: { seriesId } } }] },
      select: {
        id: true,
        title: true,
        difficulty: true,
        mateIn: true,
        kind: { select: { code: true } },
        topics: { select: { topic: { select: { code: true, label: true, order: true } } } },
      },
      orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
    }),
    levels(),
  ]);
  if (!series) return null;
  return {
    series: {
      id: series.id,
      title: series.title,
      description: series.description,
      version: series.updatedAt.toISOString(),
      isPublished: series.publishedAt !== null,
      publishedLabel: series.publishedAt ? `Publicada el ${formatSpanishDate(series.publishedAt)}` : null,
    },
    items: series.items.map((item) => mapStaffSeriesItem(item, levelRows)),
    pickable: pickable.map(mapSeriesPickOption),
  };
});
