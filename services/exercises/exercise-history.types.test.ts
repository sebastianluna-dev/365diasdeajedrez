import { describe, expect, it } from "vitest";
import { sampleExerciseHistory } from "./exercise-history.samples";
import { EXERCISE_HISTORY_DEFAULT_FILTERS, filterExerciseHistory } from "./exercise-history.types";

const NOW = new Date("2026-10-17T18:00:00.000Z");

describe("filterExerciseHistory", () => {
  const rows = sampleExerciseHistory(NOW);

  it("sin filtros da todas las filas, la más reciente primero", () => {
    const all = filterExerciseHistory(rows, EXERCISE_HISTORY_DEFAULT_FILTERS, NOW);
    expect(all).toHaveLength(rows.length);
    expect(all.map((row) => row.atIso)).toEqual([...all.map((row) => row.atIso)].sort().reverse());
  });

  it("«Resueltos» son los aprobados con o sin pista; «Fallados», los fallados y los que vieron la solución", () => {
    const solved = filterExerciseHistory(rows, { ...EXERCISE_HISTORY_DEFAULT_FILTERS, result: "solved" }, NOW);
    const failed = filterExerciseHistory(rows, { ...EXERCISE_HISTORY_DEFAULT_FILTERS, result: "failed" }, NOW);
    expect(solved.every((row) => row.outcome === "solved" || row.outcome === "hinted")).toBe(true);
    expect(failed.every((row) => row.outcome === "failed" || row.outcome === "solutionShown")).toBe(true);
    expect(solved.length + failed.length).toBe(rows.length);
  });

  it("filtra por procedencia y por periodo", () => {
    const classes = filterExerciseHistory(rows, { ...EXERCISE_HISTORY_DEFAULT_FILTERS, source: "class" }, NOW);
    expect(classes.length).toBeGreaterThan(0);
    expect(classes.every((row) => row.source === "class")).toBe(true);
    const week = filterExerciseHistory(rows, { ...EXERCISE_HISTORY_DEFAULT_FILTERS, period: "7" }, NOW);
    const month = filterExerciseHistory(rows, { ...EXERCISE_HISTORY_DEFAULT_FILTERS, period: "30" }, NOW);
    expect(week.length).toBeGreaterThan(0);
    expect(week.length).toBeLessThan(month.length);
    expect(month.length).toBeLessThan(rows.length);
    expect(week.every((row) => NOW.getTime() - new Date(row.atIso).getTime() <= 7 * 24 * 60 * 60 * 1000)).toBe(true);
  });

  it("la muestra trae un fallo con su error dibujable", () => {
    const withMistake = rows.find((row) => row.mistake !== null);
    expect(withMistake?.mistake?.arrows).toHaveLength(2);
    expect(withMistake?.mistake?.fen).toMatch(/ [wb] /);
  });
});
