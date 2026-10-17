import "server-only";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import type { DifficultyLevel } from "@/services/shared/exercise-level";
import { buildLibraryExercisesWhere } from "@/services/shared/exercise-visibility-rules";
import { mapAuthoringExercise } from "@/services/teacher-exercises/teacher-exercises.mapper";
import { getExerciseCatalogs } from "@/services/teacher-exercises/teacher-exercises.service";
import {
  mapStaffExerciseCard,
  mapStaffReviewItem,
  staffExerciseOwner,
  staffExercisePermissions,
  staffExerciseReview,
  staffSaveButtons,
} from "./staff-exercises.mapper";
import type { StaffExerciseEditor, StaffExercisesTab, StaffExercisesView } from "./staff-exercises.types";

// The staff's exercise bank (PLAN.md §8; D07, D16, D32): the library, the
// teachers' proposals and one exercise with its review. Every function opens
// with requireStaff(). Only exercises of a bank — a teacher's or the
// academy's — are read: a lesson's (`lessonId` set) has its editor under the
// course and is not found here. The flag is the pages' and the actions' to
// check. The teacher's exercise services never reach this module
// (class-roles.test.ts, exercise-roles.test.ts).

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

/** A bank's exercise: never a lesson's. */
const ofABank = { lessonId: null } satisfies Prisma.ExerciseWhereInput;

/** The teachers' proposals, waiting. */
export function reviewQueueWhere(): Prisma.ExerciseWhereInput {
  return { ...ofABank, status: { code: EXERCISE_STATUS.IN_REVIEW } };
}

/**
 * `/administracion/ejercicios` («Biblioteca»: every exercise in the library,
 * the last published first) and `/administracion/ejercicios/revision» («En
 * revisión»: the proposals, the oldest first, with who and when).
 */
export async function getStaffExercises(tab: StaffExercisesTab): Promise<StaffExercisesView> {
  await requireStaff();
  const db = getPlatformDb();
  const library = buildLibraryExercisesWhere();
  const queue = reviewQueueWhere();
  const [libraryRows, reviewRows, levelRows, libraryCount, reviewCount, seriesCount] = await Promise.all([
    tab === "biblioteca"
      ? db.exercise.findMany({
          where: library,
          select: EXERCISE_SELECT,
          orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
        })
      : [],
    tab === "revision"
      ? db.exercise.findMany({
          where: queue,
          select: EXERCISE_SELECT,
          orderBy: [{ submittedAt: "asc" }, { id: "asc" }],
        })
      : [],
    levels(),
    db.exercise.count({ where: library }),
    db.exercise.count({ where: queue }),
    db.exerciseSeries.count({ where: { teacherId: null } }),
  ]);
  return {
    tab,
    library: libraryRows.map((row) => mapStaffExerciseCard(row, levelRows)),
    review: reviewRows.map((row) => mapStaffReviewItem(row, levelRows)),
    counts: { library: libraryCount, review: reviewCount, series: seriesCount },
  };
}

/**
 * The staff editor of a bank's exercise with its review bar, or null (the
 * page answers 404): a lesson's exercise, or a teacher's that was never
 * proposed — a draft, a ready one, an archived one — is not the staff's to
 * read. A proposal, an exercise in the library and a returned one (its
 * decision in words) are.
 */
export async function getStaffExerciseEditor(exerciseId: string): Promise<StaffExerciseEditor | null> {
  await requireStaff();
  const [row, catalogs] = await Promise.all([
    getPlatformDb().exercise.findFirst({
      where: {
        AND: [
          { id: exerciseId },
          ofABank,
          {
            OR: [
              { teacherId: null },
              { status: { code: { in: [EXERCISE_STATUS.IN_REVIEW, EXERCISE_STATUS.PUBLISHED] } } },
              { reviewedAt: { not: null } },
            ],
          },
        ],
      },
      select: EXERCISE_SELECT,
    }),
    getExerciseCatalogs(),
  ]);
  if (!row) return null;
  const owner = staffExerciseOwner(row);
  return {
    exercise: mapAuthoringExercise(row),
    version: row.updatedAt.toISOString(),
    catalogs,
    games: [],
    permissions: staffExercisePermissions(owner),
    buttons: staffSaveButtons(owner),
    review: staffExerciseReview(row),
  };
}
