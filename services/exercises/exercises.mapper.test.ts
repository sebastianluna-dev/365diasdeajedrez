import { describe, expect, it } from "vitest";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import {
  attemptedToday,
  continueWithOf,
  mapSeriesSummary,
  mapStudentSeriesView,
  nextInSeries,
  seriesMarks,
  seriesPosition,
  solvableItems,
  triedTodayOf,
  type SeriesExerciseRow,
  type StudentSeriesRow,
} from "./exercises.mapper";

const TEACHER = "t-1";
const OTHER = "t-2";

function exercise(id: string, overrides: Partial<SeriesExerciseRow> = {}): SeriesExerciseRow {
  return {
    id,
    title: `Ejercicio ${id}`,
    teacherId: TEACHER,
    status: { code: EXERCISE_STATUS.READY },
    kind: { code: "MATE_IN" },
    mateIn: 2,
    difficulty: 1400,
    startFen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
    ...overrides,
  };
}

function series(items: SeriesExerciseRow[], overrides: Partial<StudentSeriesRow> = {}): StudentSeriesRow {
  return {
    id: "s-1",
    title: "Táctica de la semana",
    description: null,
    teacherId: TEACHER,
    teacher: { displayName: "Profesor Demo" },
    items: items.map((row) => ({ exercise: row })),
    ...overrides,
  };
}

const LEVELS = [{ slug: "intermedio", name: "Intermedio", order: 2, eloMin: 1200, eloMax: 1599, isActive: true }];

describe("the student's series", () => {
  it("list only what the student may solve there: the owner's usable exercises and the library's", () => {
    const row = series([
      exercise("a"),
      exercise("b", { status: { code: EXERCISE_STATUS.DRAFT } }),
      exercise("c", { status: { code: EXERCISE_STATUS.ARCHIVED } }),
      exercise("d", { teacherId: OTHER, status: { code: EXERCISE_STATUS.READY } }),
      exercise("e", { teacherId: OTHER, status: { code: EXERCISE_STATUS.PUBLISHED } }),
      exercise("f", { status: { code: EXERCISE_STATUS.IN_REVIEW } }),
    ]);
    expect(solvableItems(row).map((item) => item.id)).toEqual(["a", "e", "f"]);
  });

  it("mark an exercise solved with a pass there, failed with attempts and no pass, and nothing elsewhere", () => {
    const marks = seriesMarks([
      { seriesId: "s-1", exerciseId: "a", result: { code: "FAILED" } },
      { seriesId: "s-1", exerciseId: "a", result: { code: "PASSED" } },
      { seriesId: "s-1", exerciseId: "b", result: { code: "FAILED" } },
      { seriesId: "s-2", exerciseId: "c", result: { code: "PASSED" } },
      { seriesId: null, exerciseId: "d", result: { code: "PASSED" } },
    ]);
    expect(marks.get("s-1")?.get("a")).toBe("solved");
    expect(marks.get("s-1")?.get("b")).toBe("failed");
    expect(marks.get("s-1")?.has("c")).toBe(false);
    // A pass, then a failure: still solved.
    expect(
      seriesMarks([
        { seriesId: "s-1", exerciseId: "a", result: { code: "PASSED" } },
        { seriesId: "s-1", exerciseId: "a", result: { code: "FAILED" } },
      ])
        .get("s-1")
        ?.get("a"),
    ).toBe("solved");
  });

  it("count what was solved out of what is listed, and go on at the first one not solved", () => {
    const row = series([exercise("a"), exercise("b"), exercise("c", { status: { code: EXERCISE_STATUS.DRAFT } })]);
    const fresh = mapSeriesSummary(row);
    expect(fresh).toMatchObject({ total: 2, solved: 0, started: false, nextHref: "/ejercicios/series/s-1/1" });

    const marks = new Map([["a", "solved" as const]]);
    expect(mapSeriesSummary(row, marks)).toMatchObject({
      solved: 1,
      started: true,
      nextHref: "/ejercicios/series/s-1/2",
    });

    const done = new Map([
      ["a", "solved" as const],
      ["b", "solved" as const],
    ]);
    expect(mapSeriesSummary(row, done).nextHref).toBeNull();
  });

  it("skip what was tried today: it would open unscored, so «Continuar» never loops back to it", () => {
    // The phase's check: 1 clean, 2 failed, 3 hinted, 4 the solution shown — all today.
    const row = series([exercise("a"), exercise("b"), exercise("c"), exercise("d"), exercise("e")]);
    const marks = new Map([
      ["a", "solved" as const],
      ["b", "failed" as const],
      ["c", "solved" as const],
      ["d", "failed" as const],
    ]);
    const today = new Set(["a", "b", "c", "d"]);
    expect(mapSeriesSummary(row, marks, today).nextHref).toBe("/ejercicios/series/s-1/5");
    expect(mapStudentSeriesView(row, marks, LEVELS, today).start).toEqual({
      href: "/ejercicios/series/s-1/5",
      label: "Continuar",
    });

    // Nothing left that can count today: no accent, on the series or the home.
    const allToday = new Set(["a", "b", "c", "d", "e"]);
    const summary = mapSeriesSummary(row, marks, allToday);
    expect(summary.nextHref).toBeNull();
    expect(mapStudentSeriesView(row, marks, LEVELS, allToday).start).toBeNull();
    expect(continueWithOf([summary])).toBeNull();

    // The next day the failed one is where it goes on.
    expect(mapSeriesSummary(row, marks).nextHref).toBe("/ejercicios/series/s-1/2");
  });

  it("give the home its one accent: the newest series with something left", () => {
    const done = { ...mapSeriesSummary(series([exercise("a")])), nextHref: null };
    const open = { ...mapSeriesSummary(series([exercise("b")], { id: "s-2", title: "Finales" })) };
    expect(continueWithOf([done, open])).toEqual({ title: "Finales", href: "/ejercicios/series/s-2/1" });
    expect(continueWithOf([done])).toBeNull();
  });

  it("draw a series' rows with their facts, their marks and the page's way on", () => {
    const row = series([exercise("a"), exercise("b", { kind: { code: "SEQUENCE" }, mateIn: null, difficulty: 900 })]);
    const fresh = mapStudentSeriesView(row, new Map(), LEVELS);
    expect(fresh.items.map((item) => item.facts)).toEqual(["Mate en 2 · 1400 · Intermedio", "Secuencia · 900"]);
    expect(fresh.start).toEqual({ href: "/ejercicios/series/s-1/1", label: "Empezar" });
    expect(fresh.items[0]?.orientation).toBe("white");

    const tried = mapStudentSeriesView(row, new Map([["a", "failed" as const]]), LEVELS);
    expect(tried.items.map((item) => item.mark)).toEqual(["failed", null]);
    expect(tried.start).toEqual({ href: "/ejercicios/series/s-1/1", label: "Continuar" });
  });
});

describe("the solve page's data", () => {
  it("says where it stands and what comes next", () => {
    expect(seriesPosition(3, 10)).toBe("3 / 10");
    expect(nextInSeries("s-1", 3, 10)).toEqual({ href: "/ejercicios/series/s-1/4", label: "Siguiente ejercicio" });
    expect(nextInSeries("s-1", 10, 10)).toBeNull();
  });

  it("opens unscored when the exercise was attempted this study day, never for an earlier one", () => {
    const now = new Date("2026-10-16T18:00:00Z");
    expect(attemptedToday([{ lastAttemptAt: new Date("2026-10-16T15:00:00Z") }], now)).toBe(true);
    expect(attemptedToday([{ lastAttemptAt: new Date("2026-10-15T18:00:00Z") }], now)).toBe(false);
    // A row created only to hold the family's lock has no attempt.
    expect(attemptedToday([{ lastAttemptAt: null }], now)).toBe(false);
  });

  it("knows which exercises were tried this study day, by id", () => {
    const now = new Date("2026-10-16T18:00:00Z");
    const tried = triedTodayOf(
      [
        { exerciseId: "a", lastAttemptAt: new Date("2026-10-16T15:00:00Z") },
        { exerciseId: "b", lastAttemptAt: new Date("2026-10-15T18:00:00Z") },
        { exerciseId: "c", lastAttemptAt: null },
      ],
      now,
    );
    expect([...tried]).toEqual(["a"]);
  });
});
