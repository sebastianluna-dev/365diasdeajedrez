import { describe, expect, it } from "vitest";
import {
  accuracyPercent,
  applyExerciseReview,
  applyReview,
  EXERCISE_REVIEW_INTERVALS_DAYS,
  isDueForReview,
  isExerciseDue,
  MAX_MASTERY_LEVEL,
  REVIEW_INTERVALS_DAYS,
  type ExerciseOutcome,
  type ReviewOutcome,
} from "./review-schedule";

const NOW = new Date("2026-09-01T10:00:00.000Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const START = { consecutivePerfect: 0, masteryLevel: 0 };

/** Days between `NOW` and the scheduled date. */
function daysUntil(date: Date): number {
  return Math.round((date.getTime() - NOW.getTime()) / DAY_MS);
}

describe("applyReview", () => {
  it("sube un peldaño con cada repaso perfecto", () => {
    let state: ReviewOutcome = applyReview(START, true, NOW);
    const intervals: number[] = [state.intervalDays];

    for (let review = 0; review < 4; review++) {
      state = applyReview(state, true, NOW);
      intervals.push(state.intervalDays);
    }

    expect(intervals).toEqual([1, 3, 7, 21, 60]);
    expect(state.consecutivePerfect).toBe(5);
  });

  it("no pasa del último peldaño", () => {
    let state: ReviewOutcome = applyReview(START, true, NOW);
    for (let review = 0; review < 19; review++) state = applyReview(state, true, NOW);

    expect(state.masteryLevel).toBe(MAX_MASTERY_LEVEL);
    expect(state.intervalDays).toBe(REVIEW_INTERVALS_DAYS[MAX_MASTERY_LEVEL]);
    // The streak does keep counting even when the interval is at its cap.
    expect(state.consecutivePerfect).toBe(20);
  });

  it("un fallo devuelve al principio, no baja un escalón", () => {
    let state: ReviewOutcome = applyReview(START, true, NOW);
    for (let review = 0; review < 3; review++) state = applyReview(state, true, NOW);
    expect(state.masteryLevel).toBe(4);

    const failed = applyReview(state, false, NOW);

    expect(failed.masteryLevel).toBe(0);
    expect(failed.consecutivePerfect).toBe(0);
    // And it is due again today.
    expect(failed.intervalDays).toBe(0);
    expect(daysUntil(failed.nextReviewAt)).toBe(0);
  });

  it("programa la fecha a partir del momento del repaso", () => {
    const first = applyReview(START, true, NOW);
    expect(daysUntil(first.nextReviewAt)).toBe(1);

    const second = applyReview(first, true, NOW);
    expect(daysUntil(second.nextReviewAt)).toBe(3);
  });

  it("repasar antes de tiempo no adelanta el siguiente repaso", () => {
    // The date is computed from NOW, not from the one that was scheduled: whoever
    // reviews early is not penalised by having their interval shortened.
    const state = applyReview(START, true, NOW);
    const early = new Date(NOW.getTime() + 2 * 60 * 60 * 1000);

    const next = applyReview(state, true, early);

    expect(next.intervalDays).toBe(3);
    expect(next.nextReviewAt.getTime()).toBe(early.getTime() + 3 * DAY_MS);
  });
});

describe("isDueForReview", () => {
  it("sin fecha, toca: nunca se ha entrenado", () => {
    expect(isDueForReview(null, NOW)).toBe(true);
    expect(isDueForReview(undefined, NOW)).toBe(true);
  });

  it("toca cuando la fecha ya pasó o es justo ahora", () => {
    expect(isDueForReview(new Date(NOW.getTime() - 1000), NOW)).toBe(true);
    expect(isDueForReview(NOW, NOW)).toBe(true);
  });

  it("no toca si la fecha es futura", () => {
    expect(isDueForReview(new Date(NOW.getTime() + DAY_MS), NOW)).toBe(false);
  });
});

describe("accuracyPercent", () => {
  it("mide sobre las jugadas acertadas a la primera", () => {
    // The example from the document: 12 required, 11 correct, 1 mistake.
    expect(accuracyPercent(11, 12)).toBe(92);
    expect(accuracyPercent(12, 12)).toBe(100);
    expect(accuracyPercent(0, 12)).toBe(0);
  });

  it("no se pasa del 100 % ni divide por cero", () => {
    expect(accuracyPercent(20, 12)).toBe(100);
    expect(accuracyPercent(5, 0)).toBe(0);
  });
});

describe("applyExerciseReview", () => {
  // 10:00 in Mexico City on 1 September 2026 (UTC-6, no daylight saving since 2022).
  const AT = new Date("2026-09-01T16:00:00.000Z");
  /** The start of a study day in Mexico City, in UTC. */
  const midnight = (day: string) => new Date(`${day}T06:00:00.000Z`);

  /** The table of `applyExerciseReview`, row by row: before, outcome, step after, first day due. */
  const TABLE: [number | null, ExerciseOutcome, number | null, string | null][] = [
    [null, "clean", null, null],
    [null, "hinted", 1, "2026-09-04"],
    [null, "failed", 0, "2026-09-02"],
    [0, "clean", 1, "2026-09-04"],
    [0, "hinted", 0, "2026-09-02"],
    [0, "failed", 0, "2026-09-02"],
    [1, "clean", 2, "2026-09-08"],
    [1, "hinted", 1, "2026-09-04"],
    [1, "failed", 0, "2026-09-02"],
    [2, "clean", 3, "2026-09-22"],
    [2, "hinted", 2, "2026-09-08"],
    [2, "failed", 0, "2026-09-02"],
    [3, "clean", 4, "2026-10-31"],
    [3, "hinted", 3, "2026-09-22"],
    [3, "failed", 0, "2026-09-02"],
    [4, "clean", null, null],
    [4, "hinted", 4, "2026-10-31"],
    [4, "failed", 0, "2026-09-02"],
  ];

  it.each(TABLE)("paso %s + %s → paso %s, vuelve el %s", (before, outcome, after, due) => {
    expect(applyExerciseReview({ reviewStep: before }, outcome, AT)).toEqual({
      reviewStep: after,
      nextReviewAt: due === null ? null : midnight(due),
    });
  });

  it("sube por los cinco intervalos y se gradúa", () => {
    expect(EXERCISE_REVIEW_INTERVALS_DAYS).toEqual([1, 3, 7, 21, 60]);
    let state = applyExerciseReview({ reviewStep: null }, "failed", AT);
    const steps: (number | null)[] = [state.reviewStep];
    for (let review = 0; review < 5; review++) {
      state = applyExerciseReview(state, "clean", AT);
      steps.push(state.reviewStep);
    }
    expect(steps).toEqual([0, 1, 2, 3, 4, null]);
  });

  it("un fallo a las 23:30 en Ciudad de México toca desde las 00:00 del día de estudio siguiente", () => {
    const lateNight = new Date("2026-09-02T05:30:00.000Z"); // 1 September, 23:30 in Mexico City.
    const { nextReviewAt } = applyExerciseReview({ reviewStep: null }, "failed", lateNight);

    expect(nextReviewAt).toEqual(midnight("2026-09-02"));
    expect(isExerciseDue(nextReviewAt, new Date("2026-09-02T05:59:59.000Z"))).toBe(false);
    expect(isExerciseDue(nextReviewAt, midnight("2026-09-02"))).toBe(true);
  });

  it("también a través de un cambio de horario", () => {
    // Mexico City last left daylight saving on 30 October 2022: midnight was 05:00 UTC before, 06:00 after.
    const beforeChange = new Date("2022-10-30T04:30:00.000Z"); // 29 October, 23:30 (UTC-5).
    expect(applyExerciseReview({ reviewStep: null }, "failed", beforeChange).nextReviewAt).toEqual(
      new Date("2022-10-30T05:00:00.000Z"),
    );
    expect(applyExerciseReview({ reviewStep: null }, "hinted", beforeChange).nextReviewAt).toEqual(
      new Date("2022-11-01T06:00:00.000Z"),
    );
    // And in a zone that still changes: New York leaves daylight saving on 1 November 2026.
    const newYork = new Date("2026-11-01T03:30:00.000Z"); // 31 October, 23:30 (UTC-4).
    expect(applyExerciseReview({ reviewStep: null }, "failed", newYork, "America/New_York").nextReviewAt).toEqual(
      new Date("2026-11-01T04:00:00.000Z"),
    );
    expect(applyExerciseReview({ reviewStep: null }, "hinted", newYork, "America/New_York").nextReviewAt).toEqual(
      new Date("2026-11-03T05:00:00.000Z"),
    );
  });
});

describe("isExerciseDue", () => {
  it("sin fecha no está en repaso, así que no toca", () => {
    expect(isExerciseDue(null, NOW)).toBe(false);
    expect(isExerciseDue(NOW, NOW)).toBe(true);
    expect(isExerciseDue(new Date(NOW.getTime() + 1000), NOW)).toBe(false);
  });
});
