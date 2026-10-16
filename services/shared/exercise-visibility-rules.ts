import { ATTEMPT_CONTEXT } from "@/constants/platform/training-codes.const";
import { EXERCISE_STATUS, type ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";

// Who may solve, pick, list or watch which exercises: the ONE where-builder of
// the exercises (D07, D08, D16, D31, D32; docs → Platform → Data model,
// «Exercises»). Pure module (only Prisma types, no DAL and no server-only),
// so its test reads every branch with explicit ids; the wrapper that resolves
// the viewer per request lives in exercise-visibility.ts.
//
// What a student may solve is the OR of the paths an exercise reaches them by:
//
// 1. the library — PUBLISHED, whoever owns it (from phase 4 free practice
//    serves it; nothing is PUBLISHED before the staff's review exists);
// 2. a series given to them — a teacher's series reaches a student only while
//    that teacher is assigned to them (D07), and an academy series once it is
//    published — AND the exercise is still the series owner's to give: their
//    own usable one, or one in the library now. Prisma cannot compare two
//    columns, so the owner is a value: the viewer's active teacher, resolved
//    per request (at most one, `teacher_student_one_active`). Another
//    teacher's exercise taken out of the library leaves the series at once;
// 3. a class block (phase 3) and 4. a published lesson (phase 2) join here.
//
// ARCHIVED and DRAFT are never solvable by a student.

/** The statuses in which an exercise is its owner's to give: their students see it. */
export const USABLE_STATUS_CODES = [
  EXERCISE_STATUS.READY,
  EXERCISE_STATUS.IN_REVIEW,
  EXERCISE_STATUS.PUBLISHED,
] as const satisfies readonly ExerciseStatusCode[];

/** The contexts whose attempts belong to no teacher: whatever the exercise, it was not put there by one. */
export const NEUTRAL_ATTEMPT_CONTEXTS = [
  ATTEMPT_CONTEXT.PRACTICE,
  ATTEMPT_CONTEXT.REVIEW,
  ATTEMPT_CONTEXT.LESSON,
  ATTEMPT_CONTEXT.STORM,
] as const;

/** Who is solving: their id, and the teacher they are assigned to now, if any. */
export interface ExerciseViewer {
  userId: string;
  activeTeacherId: string | null;
}

/** The path an attempt claims (PLAN.md §5.4). Phases 2, 3 and 7 add the lesson, the class block and the run. */
export type AttemptContextInput =
  | { kind: typeof ATTEMPT_CONTEXT.SERIES; seriesId: string }
  | { kind: typeof ATTEMPT_CONTEXT.PRACTICE }
  | { kind: typeof ATTEMPT_CONTEXT.REVIEW };

const usable = { code: { in: [...USABLE_STATUS_CODES] } } satisfies Prisma.ExerciseStatusWhereInput;
const published = { code: EXERCISE_STATUS.PUBLISHED } satisfies Prisma.ExerciseStatusWhereInput;

/** In the library now. Phase 2 adds `lessonId: null`: a lesson's exercise is never the library's. */
const inLibrary = { status: published } satisfies Prisma.ExerciseWhereInput;

/** The series a student may open: a teacher's they were given while assigned to that teacher, or the academy's published. */
export function studentVisibleSeriesWhere(userId: string): Prisma.ExerciseSeriesWhereInput {
  return {
    OR: [
      { shares: { some: { userId } }, teacher: { students: { some: { studentId: userId, endedAt: null } } } },
      { teacherId: null, publishedAt: { not: null } },
    ],
  };
}

/** The series branch (2), for one series or for any: the series owner's usable exercise, or the library's. */
function seriesBranch(viewer: ExerciseViewer, series: Prisma.ExerciseSeriesWhereInput): Prisma.ExerciseWhereInput[] {
  const branches: Prisma.ExerciseWhereInput[] = [
    { ...inLibrary, seriesItems: { some: { series: { AND: [studentVisibleSeriesWhere(viewer.userId), series] } } } },
  ];
  if (viewer.activeTeacherId !== null) {
    branches.unshift({
      teacherId: viewer.activeTeacherId,
      status: usable,
      seriesItems: {
        some: {
          series: {
            AND: [{ teacherId: viewer.activeTeacherId, shares: { some: { userId: viewer.userId } } }, series],
          },
        },
      },
    });
  }
  return branches;
}

/** What a student may solve, by any path: the library and the series given to them (phases 2–3 add lessons and classes). */
export function buildSolvableExercisesWhere(viewer: ExerciseViewer): Prisma.ExerciseWhereInput {
  return { OR: [inLibrary, ...seriesBranch(viewer, {})] };
}

/** The same, narrowed to the path the attempt claims: one series, free practice (the library), or the review (any path). */
export function solvableInContextWhere(
  context: AttemptContextInput,
  viewer: ExerciseViewer,
): Prisma.ExerciseWhereInput {
  switch (context.kind) {
    case ATTEMPT_CONTEXT.SERIES:
      return { OR: seriesBranch(viewer, { id: context.seriesId }) };
    case ATTEMPT_CONTEXT.PRACTICE:
      return inLibrary;
    case ATTEMPT_CONTEXT.REVIEW:
      return buildSolvableExercisesWhere(viewer);
  }
}

/**
 * What an author may pick for a series or a class block (D08): a teacher,
 * their own usable exercises and the library; the staff (no teacher), the
 * library only — an academy series never shows a student something
 * unreviewed (D32).
 */
export function buildPickableExercisesWhere(author: { teacherId: string | null }): Prisma.ExerciseWhereInput {
  if (author.teacherId === null) return inLibrary;
  return { OR: [{ teacherId: author.teacherId, status: usable }, inLibrary] };
}

/** What a teacher lists in «Mis ejercicios»: their own, every status. */
export function buildOwnExercisesWhere(teacherId: string): Prisma.ExerciseWhereInput {
  return { teacherId };
}

/**
 * The attempts of a student that a teacher may see (D24, bounded by D08): in
 * their own context — a series of theirs, whatever the exercise (they put it
 * there when they could pick it; phase 3 adds their class blocks) — or in a
 * neutral context at an exercise that is theirs (any status), was ever in the
 * library (`publishedAt` is kept when it leaves) or is a lesson's (phase 2).
 * Never by current status: archiving an exercise hides none of its history.
 */
export function teacherVisibleAttemptsWhere(teacherId: string, studentId: string): Prisma.TrainingAttemptWhereInput {
  return {
    userId: studentId,
    exerciseId: { not: null },
    OR: [
      { series: { teacherId } },
      {
        context: { code: { in: [...NEUTRAL_ATTEMPT_CONTEXTS] } },
        exercise: { OR: [{ teacherId }, { publishedAt: { not: null } }] },
      },
    ],
  };
}

/** What a series' item is to its students now (the series editor's warning, PLAN.md §6.2). */
export type SeriesItemAvailability = "available" | "archived" | "unavailable";

/**
 * The same condition as the series branch, on one item's values: the series
 * owner's usable exercise, or one in the library now, reaches the students;
 * the owner's archived one says «Archivado», anything else «Ya no está
 * disponible».
 */
export function seriesItemAvailability(
  exercise: { teacherId: string | null; statusCode: ExerciseStatusCode },
  seriesTeacherId: string | null,
): SeriesItemAvailability {
  if (exercise.statusCode === EXERCISE_STATUS.PUBLISHED) return "available";
  const own = seriesTeacherId !== null && exercise.teacherId === seriesTeacherId;
  if (own && (USABLE_STATUS_CODES as readonly ExerciseStatusCode[]).includes(exercise.statusCode)) return "available";
  if (own && exercise.statusCode === EXERCISE_STATUS.ARCHIVED) return "archived";
  return "unavailable";
}
