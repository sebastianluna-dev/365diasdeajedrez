// When a lesson is due for review again.
//
// A ladder of intervals that goes up with each consecutive PERFECT review and
// returns to the beginning on a failure. It was chosen over an SM-2 because it
// is explainable to the student — "two perfect reviews and it does not come
// back for a week" — and because it can be checked by reading a table, not by
// tuning an opaque factor.
//
// Pure module: no Prisma, no React, so it can be exercised whole in tests.

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
