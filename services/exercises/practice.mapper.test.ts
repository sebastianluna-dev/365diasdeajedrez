import { describe, expect, it } from "vitest";
import { buildPracticeWhere, pickPracticeExercise, practiceTopicCodes } from "./practice.mapper";

const TOPICS = [
  { code: "TACTICS", label: "Táctica", parentCode: null },
  { code: "FORK", label: "Horquilla", parentCode: "TACTICS" },
  { code: "SKEWER", label: "Enfilada", parentCode: "TACTICS" },
  { code: "ENDGAME", label: "Finales", parentCode: null },
];

const NOW = new Date("2026-10-16T20:00:00.000Z");
const TODAY = new Date("2026-10-16T15:00:00.000Z");
const YESTERDAY = new Date("2026-10-15T15:00:00.000Z");
const ids = (candidates: { id: string }[]) => candidates;

describe("practiceTopicCodes", () => {
  it("da el tema y sus hijos; un hijo, sólo él; un código desconocido, nada", () => {
    expect(practiceTopicCodes(TOPICS, "TACTICS")).toEqual(["TACTICS", "FORK", "SKEWER"]);
    expect(practiceTopicCodes(TOPICS, "FORK")).toEqual(["FORK"]);
    expect(practiceTopicCodes(TOPICS, "NOPE")).toEqual([]);
  });
});

describe("buildPracticeWhere", () => {
  it("pide la biblioteca, los temas y el rango del nivel; sin tope cuando el nivel no lo tiene", () => {
    const where = buildPracticeWhere(["FORK"], { eloMin: 1200, eloMax: 1599 });
    expect(JSON.stringify(where)).toContain('"PUBLISHED"');
    expect(JSON.stringify(where)).toContain('"lessonId":null');
    expect(where).toMatchObject({
      AND: [{}, { topics: { some: { topic: { code: { in: ["FORK"] } } } } }, { difficulty: { gte: 1200, lte: 1599 } }],
    });
    expect(buildPracticeWhere(["FORK"], { eloMin: 2000, eloMax: null })).toMatchObject({
      AND: [{}, {}, { difficulty: { gte: 2000 } }],
    });
  });

  it("sin tema no encuentra nada", () => {
    expect(buildPracticeWhere([], { eloMin: 800, eloMax: 1199 })).toEqual({ id: { in: [] } });
  });

  it("with no topic and no level, reads the whole library («Ejercicios» itself)", () => {
    const where = buildPracticeWhere(null, null);
    expect(where).toEqual({ AND: [expect.anything()] });
  });
});

describe("pickPracticeExercise", () => {
  const candidates = ids([{ id: "a" }, { id: "b" }, { id: "c" }]);

  it("prefiere lo no resuelto y no intentado hoy, luego lo no resuelto, luego lo no intentado hoy, luego cualquiera", () => {
    const states = [
      { exerciseId: "a", firstSolvedAt: YESTERDAY, lastAttemptAt: YESTERDAY },
      { exerciseId: "b", firstSolvedAt: null, lastAttemptAt: TODAY },
    ];
    // c: never solved, not tried today — the only one of the best tier, whatever the random number.
    expect(pickPracticeExercise(candidates, states, null, NOW, 0.99)).toMatchObject({
      exercise: { id: "c" },
      exhausted: false,
      triedToday: false,
    });
    // Without c: b is unsolved but tried today, a solved: the unsolved tier wins, and it opens unscored.
    expect(pickPracticeExercise(candidates.slice(0, 2), states, null, NOW, 0)).toMatchObject({
      exercise: { id: "b" },
      triedToday: true,
      exhausted: false,
    });
    // Only a: solved and tried yesterday — any, and the pool is exhausted.
    expect(pickPracticeExercise(candidates.slice(0, 1), states, null, NOW, 0.5)).toMatchObject({
      exercise: { id: "a" },
      exhausted: true,
    });
  });

  it("no repite el que acaba de salir mientras quede otro; con uno solo, lo repite", () => {
    expect(pickPracticeExercise(candidates, [], "c", NOW, 0.99)?.exercise.id).not.toBe("c");
    expect(pickPracticeExercise(ids([{ id: "a" }]), [], "a", NOW, 0.5)?.exercise.id).toBe("a");
  });

  it("elige al azar dentro del mejor grupo y nunca se sale de él", () => {
    expect(pickPracticeExercise(candidates, [], null, NOW, 0)?.exercise.id).toBe("a");
    expect(pickPracticeExercise(candidates, [], null, NOW, 0.5)?.exercise.id).toBe("b");
    expect(pickPracticeExercise(candidates, [], null, NOW, 0.999)?.exercise.id).toBe("c");
  });

  it("sin candidatos no hay nada que servir", () => {
    expect(pickPracticeExercise([], [], null, NOW, 0.3)).toBeNull();
  });
});
