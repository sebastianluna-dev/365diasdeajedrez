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

/** Días entre `NOW` y la fecha programada. */
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
    // La racha sí sigue contando aunque el intervalo esté tope.
    expect(state.consecutivePerfect).toBe(20);
  });

  it("un fallo devuelve al principio, no baja un escalón", () => {
    let state: ReviewOutcome = applyReview(START, true, NOW);
    for (let review = 0; review < 3; review++) state = applyReview(state, true, NOW);
    expect(state.masteryLevel).toBe(4);

    const failed = applyReview(state, false, NOW);

    expect(failed.masteryLevel).toBe(0);
    expect(failed.consecutivePerfect).toBe(0);
    // Y vuelve a estar pendiente hoy mismo.
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
    // La fecha se calcula desde AHORA, no desde la que estaba programada: quien
    // repasa de más no se penaliza acortando su intervalo.
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
    // El ejemplo del documento: 12 requeridas, 11 correctas, 1 error.
    expect(accuracyPercent(11, 12)).toBe(92);
    expect(accuracyPercent(12, 12)).toBe(100);
    expect(accuracyPercent(0, 12)).toBe(0);
  });

  it("no se pasa del 100 % ni divide por cero", () => {
    expect(accuracyPercent(20, 12)).toBe(100);
    expect(accuracyPercent(5, 0)).toBe(0);
  });
});
