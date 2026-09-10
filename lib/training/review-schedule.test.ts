import { describe, expect, it } from "vitest";
import {
  accuracyPercent,
  applyReview,
  isDueForReview,
  MAX_MASTERY_LEVEL,
  REVIEW_INTERVALS_DAYS,
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
