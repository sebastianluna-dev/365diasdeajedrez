import { ACTIVITY_TYPE, SUBJECT_TYPE } from "@/constants/platform/activity-codes.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import {
  ATTEMPT_CONTEXT,
  ATTEMPT_RESULT,
  type AttemptContextCode,
  type AttemptResultCode,
} from "@/constants/platform/training-codes.const";
import type { AttemptOutcome } from "@/lib/chess/exercise-solver";
import { createPositionHash } from "@/lib/chess/position-hash";
import { dayKey } from "@/lib/study-streak";
import { applyExerciseReview, type ExerciseOutcome } from "@/lib/training/review-schedule";
import { exerciseActivityTopic, type TopicNode } from "./exercise-activity-topic";
import { recordUserActivity, type ActivityWriter } from "./user-activity.service";

// The ONLY writer of an exercise's attempts (`TrainingAttempt` rows with
// `exerciseId`), of their first mistake (`TrainingMistake`), of the student's
// standing with each exercise (`UserExerciseState`) and of the
// EXERCISE_PASSED activity that feeds the streak and «Ejercicios superados»
// (docs → Platform → Data model, «Exercises»). The dormant line trainer keeps
// writing its own `trainingExerciseId` rows (services/trainer).
//
// The rules it holds, all inside the caller's transaction:
//
// - The first wrong move decides (D19): the attempt arrives decided by the
//   server's replay (`replayAttempt`), and stores at most one mistake.
// - Scored once per study day (D19, D20, D23): an exercise attempted today —
//   any row of its family, the solve key's — stores nothing and answers
//   `scored: false`, so a failure never turns into a pass the same day. Two
//   contexts still store their row, with its mistake, and nothing else: a
//   «Contrarreloj» attempt, for the run's score, and a class block's (D49),
//   so the block's mark and the teacher's «2 de 3 lo resolvieron» count a
//   solve made from the class after a scored attempt elsewhere that day.
//   Neither moves the state, the ladder, the streak or «Ejercicios
//   superados»; the rebuild folds them as the gate did (skipped), and a
//   stored row is scored exactly when it is the family's first of its study
//   day. No column says it: the order does.
// - Counted once (D22): EXERCISE_PASSED is written only on the student's
//   first pass of the family, keyed on the solve key.
// - The review ladder (D23, D33) moves with every scored attempt but a
//   «Contrarreloj» one.
//
// The gate is atomic: the first statement is `lockExerciseFamily`, a row lock
// on the family's key that every submit of the family takes first, so two
// submits that race (the wrong-move auto-submit and «Ver la solución», two
// tabs) are serialised and the second reads the first's `lastAttemptAt`.
//
// No "server-only": the seed drives `rebuildUserExerciseState`, and the tests
// drive both with a fake client (lib/testing/fake-exercise-db.ts).

/** The contexts an exercise is solved in; CHAPTER_QUIZ and TRAINER are the line trainer's. */
export type ExerciseAttemptContextCode = Exclude<AttemptContextCode, "CHAPTER_QUIZ" | "TRAINER">;

/** What the solve key reads of an exercise. */
export interface SolveKeyExercise {
  id: string;
  copiedFromId: string | null;
  /** Phase 2 (lesson exercises): set on a lesson's exercise. */
  lessonId?: string | null;
}

/**
 * The exercise «as the student solves it» (D22, D28): a lesson's copy of a
 * library exercise is the same exercise as its original, so its key is the
 * original's id; anything else — a teacher's «Duplicar» included — is its own.
 */
export function exerciseSolveKey(exercise: SolveKeyExercise): string {
  return exercise.lessonId && exercise.copiedFromId ? exercise.copiedFromId : exercise.id;
}

/** Whether two instants fall in the same study day (STUDY_DAY_TIMEZONE, lib/study-streak). */
export function isSameStudyDay(left: Date, right: Date, timeZone: string = STUDY_DAY_TIMEZONE): boolean {
  return dayKey(left, timeZone) === dayKey(right, timeZone);
}

/** The columns of `UserExerciseState` the rule derives. */
export interface ExerciseStateColumns {
  attemptCount: number;
  firstAttemptAt: Date | null;
  firstSolvedAt: Date | null;
  lastAttemptAt: Date | null;
  lastResultId: number | null;
  reviewStep: number | null;
  nextReviewAt: Date | null;
  lastReviewedAt: Date | null;
}

export const EMPTY_EXERCISE_STATE: ExerciseStateColumns = {
  attemptCount: 0,
  firstAttemptAt: null,
  firstSolvedAt: null,
  lastAttemptAt: null,
  lastResultId: null,
  reviewStep: null,
  nextReviewAt: null,
  lastReviewedAt: null,
};

/** A scored attempt, as the state hears it. */
export interface FoldedAttempt {
  at: Date;
  resultCode: AttemptResultCode;
  resultId: number;
  contextCode: ExerciseAttemptContextCode;
  review: ExerciseOutcome;
}

/** What every attempt, legacy or not, tells the state. */
export type LegacyFoldedAttempt = Pick<FoldedAttempt, "at" | "resultCode" | "resultId">;

/**
 * The facts of one attempt: one more, its dates and result, the first pass
 * if it is one. What the phase 2 migration (`20261016130000_lesson_exercises`)
 * computed in SQL for the attempts it moved from the hand-made
 * `TrainingExercise` rows (`count`, `min`, `min … FILTER PASSED`, `max`, the
 * last result): they were recorded under the trainer's rules, where PASSED
 * allowed mistakes and nothing gated the day, so the review ladder never hears
 * them. The rebuild folds an `isLegacy` row with this alone, so running it on a
 * migrated database never rewrites what the migration chose.
 */
export function foldLegacyAttempt(state: ExerciseStateColumns, attempt: LegacyFoldedAttempt): ExerciseStateColumns {
  return {
    ...state,
    attemptCount: state.attemptCount + 1,
    firstAttemptAt: state.firstAttemptAt ?? attempt.at,
    firstSolvedAt: state.firstSolvedAt ?? (attempt.resultCode === ATTEMPT_RESULT.PASSED ? attempt.at : null),
    lastAttemptAt: attempt.at,
    lastResultId: attempt.resultId,
  };
}

/**
 * The state after one scored attempt: its facts (`foldLegacyAttempt`) and
 * the review ladder (`applyExerciseReview`), which a «Contrarreloj» attempt
 * never moves (time pressure is not what the review measures).
 * `lastReviewedAt` is the last attempt made in «Para repasar hoy». Shared by
 * the writer and the rebuild, so the two cannot drift.
 */
export function foldExerciseAttempt(state: ExerciseStateColumns, attempt: FoldedAttempt): ExerciseStateColumns {
  const next = foldLegacyAttempt(state, attempt);
  if (attempt.contextCode === ATTEMPT_CONTEXT.STORM) return next;
  const review = applyExerciseReview({ reviewStep: state.reviewStep }, attempt.review, attempt.at);
  return {
    ...next,
    ...review,
    lastReviewedAt: attempt.contextCode === ATTEMPT_CONTEXT.REVIEW ? attempt.at : state.lastReviewedAt,
  };
}

/** A state row as the writer reads it. */
interface StateRow extends ExerciseStateColumns {
  exerciseId: string;
}

/** The minimum of Prisma that reads a key's lesson copies. */
export interface ExerciseFamilyReader {
  exercise: { findMany(args: unknown): Promise<{ id: string; copiedFromId: string | null }[]> };
}

/**
 * The family of each of several exercises (D22, D28), by the exercise's id:
 * its solve key, itself, and every lesson copy of the key — so solving a
 * library exercise and then its copy in a lesson is one exercise for the day
 * gate and for «Ejercicios superados», whichever of the two was solved first.
 * The copies of every key are read in ONE query: the lesson's page asks for
 * its whole list at once. The one definition of «family»: the writer and the
 * pages read it here and nowhere else.
 */
export async function exerciseFamiliesOf(
  db: ExerciseFamilyReader,
  exercises: readonly SolveKeyExercise[],
): Promise<Map<string, string[]>> {
  const keys = [...new Set(exercises.map(exerciseSolveKey))];
  const copies =
    keys.length === 0
      ? []
      : await db.exercise.findMany({
          where: { copiedFromId: { in: keys }, lessonId: { not: null } },
          select: { id: true, copiedFromId: true },
        });
  const copiesOf = new Map<string, string[]>();
  for (const copy of copies) {
    if (copy.copiedFromId === null) continue;
    copiesOf.set(copy.copiedFromId, [...(copiesOf.get(copy.copiedFromId) ?? []), copy.id]);
  }
  return new Map(
    exercises.map((exercise) => {
      const solveKey = exerciseSolveKey(exercise);
      return [exercise.id, [...new Set([solveKey, exercise.id, ...(copiesOf.get(solveKey) ?? [])])]];
    }),
  );
}

/**
 * The ids whose states make up ONE exercise's family (`exerciseFamiliesOf` of
 * it alone). The writer reads it under the family's lock; the solve pages
 * read it to say whether the exercise was attempted today.
 */
export async function exerciseFamilyIds(db: ExerciseFamilyReader, exercise: SolveKeyExercise): Promise<string[]> {
  return (await exerciseFamiliesOf(db, [exercise])).get(exercise.id) ?? [exercise.id];
}

/** The minimum of Prisma the lock needs. */
export interface ExerciseFamilyLocker {
  $executeRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  $queryRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
}

/**
 * Locks a student's family of an exercise: creates the key's state row if it
 * is missing (`ON CONFLICT DO NOTHING`, so a first attempt never throws
 * P2002) and takes its row lock (`SELECT … FOR UPDATE`), held until the
 * transaction ends. Every submit of the family takes this one lock first. A
 * row created only to hold it has `attemptCount` 0 and no dates, which no
 * reader takes for an attempt.
 */
export async function lockExerciseFamily(
  db: ExerciseFamilyLocker,
  userId: string,
  solveKey: string,
  now: Date,
): Promise<void> {
  await ensureExerciseState(db, userId, solveKey, now);
  await db.$queryRaw`SELECT "userId" FROM "UserExerciseState" WHERE "userId" = ${userId} AND "exerciseId" = ${solveKey} FOR UPDATE`;
}

/** Creates a student's state row with an exercise when it is missing; never throws on one that exists. */
async function ensureExerciseState(db: ExerciseFamilyLocker, userId: string, exerciseId: string, now: Date) {
  await db.$executeRaw`INSERT INTO "UserExerciseState" ("userId", "exerciseId", "updatedAt") VALUES (${userId}, ${exerciseId}, ${now}) ON CONFLICT DO NOTHING`;
}

export interface ExerciseAttemptWriter extends ActivityWriter, ExerciseFamilyLocker, ExerciseFamilyReader {
  attemptResult: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  attemptContext: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  trainingAttempt: { create(args: unknown): Promise<{ id: string }> };
  trainingMistake: { create(args: unknown): Promise<unknown> };
  userExerciseState: {
    findMany(args: unknown): Promise<StateRow[]>;
    updateMany(args: unknown): Promise<{ count: number }>;
  };
  exerciseTopic: { findMany(args: unknown): Promise<{ topicId: number }[]> };
  topic: { findMany(args: unknown): Promise<TopicNode[]> };
}

async function catalogIds(rows: Promise<{ id: number; code: string }[]>): Promise<Map<string, number>> {
  return new Map((await rows).map((row) => [row.code, row.id]));
}

function idOf(ids: ReadonlyMap<string, number>, code: string, catalog: string): number {
  const id = ids.get(code);
  if (id === undefined) throw new Error(`${catalog} ${code} is not seeded`);
  return id;
}

export interface RecordExerciseAttemptInput {
  userId: string;
  exercise: SolveKeyExercise;
  contextCode: ExerciseAttemptContextCode;
  /** With SERIES: the series it was solved in (D24 per series). */
  seriesId?: string | null;
  /** With CLASS: the class block it was solved from (D29). */
  classBlockId?: string | null;
  /** The server's replay of the submitted moves (`replayAttempt`), never the client's word. */
  outcome: AttemptOutcome;
  durationMs: number | null;
  now: Date;
}

export type RecordExerciseAttemptResult =
  /** Stored and scored; `firstSolve` when it was the family's first pass, which wrote the activity. */
  | { scored: true; attemptId: string; firstSolve: boolean }
  /** Attempted earlier this study day: nothing stored, but a «Contrarreloj» attempt's row for the run, or a class block's for its mark (D49). */
  | { scored: false; attemptId: string | null };

/**
 * Records a decided attempt at an exercise (PLAN.md §5.4): the family's lock
 * first, then the study-day gate read under it, then the attempt, its first
 * mistake, the state with its review, the first pass and its activity.
 */
export async function recordExerciseAttempt(
  db: ExerciseAttemptWriter,
  input: RecordExerciseAttemptInput,
): Promise<RecordExerciseAttemptResult> {
  const { userId, exercise, outcome, now } = input;
  const solveKey = exerciseSolveKey(exercise);
  await lockExerciseFamily(db, userId, solveKey, now);
  if (exercise.id !== solveKey) await ensureExerciseState(db, userId, exercise.id, now);

  // The family as it stands under the lock: the key, this exercise and the key's lesson copies.
  const family = await db.userExerciseState.findMany({
    where: { userId, exerciseId: { in: await exerciseFamilyIds(db, exercise) } },
  });
  const [resultIds, contextIds] = await Promise.all([
    catalogIds(db.attemptResult.findMany({ select: { id: true, code: true } })),
    catalogIds(db.attemptContext.findMany({ select: { id: true, code: true } })),
  ]);
  const resultId = idOf(resultIds, outcome.result, "AttemptResult");
  const contextId = idOf(contextIds, input.contextCode, "AttemptContext");
  // The run's tally (STORM) and the class block's mark (CLASS, D49) read the row even on a day already scored.
  const keepsRow = input.contextCode === ATTEMPT_CONTEXT.STORM || input.contextCode === ATTEMPT_CONTEXT.CLASS;
  const takenToday = family.some((row) => row.lastAttemptAt !== null && isSameStudyDay(row.lastAttemptAt, now));
  if (takenToday && !keepsRow) return { scored: false, attemptId: null };

  const attempt = await db.trainingAttempt.create({
    data: {
      userId,
      exerciseId: exercise.id,
      seriesId: input.contextCode === ATTEMPT_CONTEXT.SERIES ? (input.seriesId ?? null) : null,
      classBlockId: input.contextCode === ATTEMPT_CONTEXT.CLASS ? (input.classBlockId ?? null) : null,
      resultId,
      contextId,
      mistakes: outcome.mistake ? 1 : 0,
      durationMs: input.durationMs,
      requiredMoves: outcome.requiredMoves,
      correctMoves: outcome.correctMoves,
      reachedPly: outcome.reachedPly,
      hintsUsed: outcome.hintsUsed,
      solutionShown: outcome.solutionShown,
      isPerfect: outcome.isPerfect,
      createdAt: now,
    },
    select: { id: true },
  });
  if (outcome.mistake) {
    await db.trainingMistake.create({
      data: {
        attemptId: attempt.id,
        positionHash: createPositionHash(outcome.mistake.fen),
        fen: outcome.mistake.fen,
        expectedSan: outcome.mistake.expectedSan,
        playedSan: outcome.mistake.playedSan,
        ply: outcome.mistake.ply,
        usedHint: outcome.mistake.hintShownBefore,
        createdAt: now,
      },
    });
  }
  // The row and its mistake are what the run's tally or the block's mark read; the day was already scored, so nothing else moves.
  if (takenToday) return { scored: false, attemptId: attempt.id };

  const current = family.find((row) => row.exerciseId === exercise.id) ?? { ...EMPTY_EXERCISE_STATE };
  const next = foldExerciseAttempt(current, {
    at: now,
    resultCode: outcome.result,
    resultId,
    contextCode: input.contextCode,
    review: outcome.review,
  });
  await db.userExerciseState.updateMany({
    where: { userId, exerciseId: exercise.id },
    data: {
      attemptCount: next.attemptCount,
      firstAttemptAt: next.firstAttemptAt,
      lastAttemptAt: next.lastAttemptAt,
      lastResultId: next.lastResultId,
      reviewStep: next.reviewStep,
      nextReviewAt: next.nextReviewAt,
      lastReviewedAt: next.lastReviewedAt,
    },
  });

  if (outcome.result !== ATTEMPT_RESULT.PASSED) return { scored: true, attemptId: attempt.id, firstSolve: false };

  const won = await db.userExerciseState.updateMany({
    where: { userId, exerciseId: exercise.id, firstSolvedAt: null },
    data: { firstSolvedAt: now },
  });
  const solvedElsewhere = family.some((row) => row.exerciseId !== exercise.id && row.firstSolvedAt !== null);
  const firstSolve = won.count === 1 && !solvedElsewhere;
  if (firstSolve) {
    const [topics, catalog] = await Promise.all([
      db.exerciseTopic.findMany({ where: { exerciseId: exercise.id }, select: { topicId: true } }),
      db.topic.findMany({ select: { id: true, parentId: true, order: true } }),
    ]);
    await recordUserActivity(db, {
      userId,
      typeCode: ACTIVITY_TYPE.EXERCISE_PASSED,
      subjectTypeCode: SUBJECT_TYPE.EXERCISE,
      subjectId: solveKey,
      topicId: exerciseActivityTopic(
        topics.map((topic) => topic.topicId),
        catalog,
      ),
      occurredAt: now,
    });
  }
  return { scored: true, attemptId: attempt.id, firstSolve };
}

/** An attempt as the rebuild reads it. */
interface AttemptRow {
  exerciseId: string | null;
  createdAt: Date;
  resultId: number;
  contextId: number;
  hintsUsed: number;
  /** Moved by the phase 2 migration from a hand-made `TrainingExercise`: folded as it did (`foldLegacyAttempt`). */
  isLegacy: boolean;
}

export interface ExerciseStateRebuilder {
  attemptResult: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  attemptContext: { findMany(args: unknown): Promise<{ id: number; code: string }[]> };
  trainingAttempt: { findMany(args: unknown): Promise<AttemptRow[]> };
  exercise: { findMany(args: unknown): Promise<{ id: string; copiedFromId: string | null }[]> };
  userExerciseState: {
    deleteMany(args: unknown): Promise<unknown>;
    createMany(args: unknown): Promise<unknown>;
  };
}

/** How a stored attempt went, for the review: the stored columns say it (D33). */
function reviewOf(resultCode: AttemptResultCode, hintsUsed: number): ExerciseOutcome {
  if (resultCode !== ATTEMPT_RESULT.PASSED) return "failed";
  return hintsUsed > 0 ? "hinted" : "clean";
}

/**
 * Folds a student's exercise attempts, oldest first, into their states with
 * exactly the writer's rules — the family's study-day gate, the ladder, the
 * first pass — and rewrites them (the seed; the drift fixer of IMPROVEMENTS).
 * An attempt the gate would have refused (a «Contrarreloj» row stored on a
 * day already taken) moves nothing. A legacy row (`isLegacy`, the phase 2
 * migration's) is folded as the migration folded it: its facts, never the
 * ladder, and never refused by the gate — several the same day all count —,
 * though, like any attempt, it is the family's last for the gate that
 * follows. Activities are not written here: they are the append-only log the
 * writer kept. Run it inside a transaction, or on a database nobody else
 * writes (the seed). Returns how many states it wrote.
 */
export async function rebuildUserExerciseState(db: ExerciseStateRebuilder, userId: string): Promise<number> {
  const [results, contexts, attempts] = await Promise.all([
    db.attemptResult.findMany({ select: { id: true, code: true } }),
    db.attemptContext.findMany({ select: { id: true, code: true } }),
    db.trainingAttempt.findMany({
      where: { userId, exerciseId: { not: null } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: { exerciseId: true, createdAt: true, resultId: true, contextId: true, hintsUsed: true, isLegacy: true },
    }),
  ]);
  const exerciseIds = [...new Set(attempts.map((attempt) => attempt.exerciseId).filter((id) => id !== null))];
  const exercises =
    exerciseIds.length > 0
      ? await db.exercise.findMany({ where: { id: { in: exerciseIds } }, select: { id: true, copiedFromId: true } })
      : [];
  const resultCode = new Map(results.map((row) => [row.id, row.code as AttemptResultCode]));
  const contextCode = new Map(contexts.map((row) => [row.id, row.code as ExerciseAttemptContextCode]));
  const keyOf = new Map(exercises.map((row) => [row.id, exerciseSolveKey(row)]));

  const states = new Map<string, ExerciseStateColumns>();
  /** The family's last scored attempt, for the day gate. */
  const familyLast = new Map<string, Date>();
  for (const attempt of attempts) {
    const exerciseId = attempt.exerciseId;
    const result = resultCode.get(attempt.resultId);
    const context = contextCode.get(attempt.contextId);
    if (exerciseId === null || !result || !context) continue;
    const key = keyOf.get(exerciseId) ?? exerciseId;
    if (attempt.isLegacy) {
      states.set(
        exerciseId,
        foldLegacyAttempt(states.get(exerciseId) ?? EMPTY_EXERCISE_STATE, {
          at: attempt.createdAt,
          resultCode: result,
          resultId: attempt.resultId,
        }),
      );
      familyLast.set(key, attempt.createdAt);
      continue;
    }
    const last = familyLast.get(key);
    if (last && isSameStudyDay(last, attempt.createdAt)) continue;
    states.set(
      exerciseId,
      foldExerciseAttempt(states.get(exerciseId) ?? EMPTY_EXERCISE_STATE, {
        at: attempt.createdAt,
        resultCode: result,
        resultId: attempt.resultId,
        contextCode: context,
        review: reviewOf(result, attempt.hintsUsed),
      }),
    );
    familyLast.set(key, attempt.createdAt);
  }

  await db.userExerciseState.deleteMany({ where: { userId } });
  if (states.size > 0) {
    await db.userExerciseState.createMany({
      data: [...states].map(([exerciseId, state]) => ({ userId, exerciseId, ...state })),
    });
  }
  return states.size;
}
