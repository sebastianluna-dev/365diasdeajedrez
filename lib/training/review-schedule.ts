// When a lesson is due for review again.
//
// A ladder of intervals that goes up with each consecutive PERFECT review and
// returns to the beginning on a failure. It was chosen over an SM-2 because it
// is explainable to the student — "two perfect reviews and it does not come
// back for a week" — and because it can be checked by reading a table, not by
// tuning an opaque factor.
//
// Pure module: no Prisma, no React, so it can be exercised whole in tests.
//
// Two ladders live here: the line trainer's (`applyReview`, from the moment of
// the review) and the exercises' (`applyExerciseReview`, D23), whose dates are
// the start of a study day.

import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { dayKey, startOfDay } from "@/lib/study-streak";

/**
 * Days until the next review, per rung.
 *
 * The first is 0: a failed review is due again TODAY, which is what whoever has
 * just got it wrong expects. From there it goes up.
 */
export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 21, 60] as const;

/** Last rung; once at the top, it does not keep climbing. */
export const MAX_MASTERY_LEVEL = REVIEW_INTERVALS_DAYS.length - 1;

export interface ReviewState {
  /** Consecutive perfect reviews BEFORE this attempt. */
  consecutivePerfect: number;
  masteryLevel: number;
}

export interface ReviewOutcome {
  consecutivePerfect: number;
  masteryLevel: number;
  intervalDays: number;
  nextReviewAt: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The review state after an attempt.
 *
 * Only a PERFECT attempt climbs a rung: getting it right with hints or after a
 * failure shows recognition, not memory, and that is exactly what the review
 * measures. A failure returns to the beginning instead of dropping one step,
 * because forgetting a line is not "knowing it a little less".
 */
export function applyReview(state: ReviewState, isPerfect: boolean, now: Date = new Date()): ReviewOutcome {
  const consecutivePerfect = isPerfect ? state.consecutivePerfect + 1 : 0;
  const masteryLevel = isPerfect ? Math.min(state.masteryLevel + 1, MAX_MASTERY_LEVEL) : 0;
  const intervalDays = REVIEW_INTERVALS_DAYS[masteryLevel];
  if (intervalDays === undefined) throw new Error(`Sin intervalo de repaso para el nivel ${masteryLevel}.`);

  return {
    consecutivePerfect,
    masteryLevel,
    intervalDays,
    nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS),
  };
}

/** Is it due yet? Without a scheduled date, yes: it has never been trained. */
export function isDueForReview(nextReviewAt: Date | null | undefined, now: Date = new Date()): boolean {
  return !nextReviewAt || nextReviewAt.getTime() <= now.getTime();
}

/**
 * Accuracy of the attempt, 0-100.
 *
 * It is measured over the moves got RIGHT FIRST TIME, not over the completed
 * ones: the session does not advance until the move is right, so counting the
 * completed ones would always give 100 %. It is a different metric from
 * "perfect", which additionally requires no hints having been used.
 */
export function accuracyPercent(correctMoves: number, requiredMoves: number): number {
  if (requiredMoves <= 0) return 0;
  return Math.round((Math.min(correctMoves, requiredMoves) / requiredMoves) * 100);
}

// --- Exercises (D23, D33) --------------------------------------------------------

/**
 * Days until a failed or hinted exercise comes back, per step. A failure
 * returns the next study day; each clean solve climbs a step, and a clean
 * solve on the last one graduates it out of review.
 */
export const EXERCISE_REVIEW_INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;

const LAST_EXERCISE_STEP = EXERCISE_REVIEW_INTERVALS_DAYS.length - 1;

/** The step a hinted first solve enters review at: three days, sooner than a clean one, which never returns. */
const HINTED_ENTRY_STEP = 1;

/**
 * How a scored attempt went, for the review: «clean» is PASSED with no hint,
 * «hinted» PASSED with a hint (D33: passed, not perfect), «failed» FAILED,
 * «Ver la solución» included.
 */
export type ExerciseOutcome = "clean" | "hinted" | "failed";

export interface ExerciseReviewState {
  /** Null: not in review. */
  reviewStep: number | null;
}

export interface ExerciseReviewOutcome {
  reviewStep: number | null;
  nextReviewAt: Date | null;
}

/** The start of the study day `days` days after the one `now` falls in. */
function studyDayStart(now: Date, days: number, timeZone: string): Date {
  const key = dayKey(now, timeZone);
  const target = new Date(Date.parse(`${key}T00:00:00.000Z`) + days * DAY_MS).toISOString().slice(0, 10);
  return startOfDay(target, timeZone);
}

/**
 * The review state after a scored attempt:
 *
 * | Before                 | clean             | hinted          | failed       |
 * | ---------------------- | ----------------- | --------------- | ------------ |
 * | not in review (`null`) | stays out         | step 1 (3 days) | step 0 (1 day) |
 * | step k < 4             | step k+1          | stays k         | step 0       |
 * | step 4 (60 days)       | graduates (`null`)| stays 4         | step 0       |
 *
 * The date is the START of a study day (STUDY_DAY_TIMEZONE), so an exercise
 * due «today» is due all day, whatever the hour it failed at.
 */
export function applyExerciseReview(
  state: ExerciseReviewState,
  outcome: ExerciseOutcome,
  now: Date,
  timeZone: string = STUDY_DAY_TIMEZONE,
): ExerciseReviewOutcome {
  const current = state.reviewStep === null ? null : Math.min(Math.max(state.reviewStep, 0), LAST_EXERCISE_STEP);

  let reviewStep: number | null;
  if (outcome === "failed") reviewStep = 0;
  else if (outcome === "hinted") reviewStep = current ?? HINTED_ENTRY_STEP;
  else if (current === null || current === LAST_EXERCISE_STEP) reviewStep = null;
  else reviewStep = current + 1;

  if (reviewStep === null) return { reviewStep: null, nextReviewAt: null };
  const days = EXERCISE_REVIEW_INTERVALS_DAYS[reviewStep];
  if (days === undefined) throw new Error(`Sin intervalo de repaso para el paso ${reviewStep}.`);
  return { reviewStep, nextReviewAt: studyDayStart(now, days, timeZone) };
}

/** Is the exercise due for review? Without a date it is not in review, so no. */
export function isExerciseDue(nextReviewAt: Date | null, now: Date): boolean {
  return nextReviewAt !== null && nextReviewAt.getTime() <= now.getTime();
}
