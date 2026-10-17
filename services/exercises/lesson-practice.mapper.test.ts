import { describe, expect, it } from "vitest";
import { lessonPosition, lessonPracticeOf, nextInLesson, practiceFamilyOf } from "./lesson-practice.mapper";

// The lesson's «K de N resueltos» and its way on (D25, D26), counted by solve
// key (§2.7): a lesson copy of a library exercise is solved when the original
// was, and an exercise tried today is skipped by the accent.

const PLACE = { courseId: "10000001", chapterOrder: 2, lessonId: "20000004" };
const LEVELS = [{ slug: "intermedio", name: "Intermedio", order: 2, eloMin: 1200, eloMax: 1599, isActive: true }];
const NOW = new Date("2026-10-16T18:00:00.000Z");
const TODAY_EARLIER = new Date("2026-10-16T15:00:00.000Z");
const YESTERDAY = new Date("2026-10-15T18:00:00.000Z");

const row = (id: string, copiedFromId: string | null = null) => ({
  id,
  copiedFromId,
  lessonId: PLACE.lessonId,
  title: `Ejercicio ${id}`,
  kind: { code: "SEQUENCE" },
  mateIn: null,
  difficulty: 1400,
  startFen: "4k3/8/8/4PK2/8/8/r7/4R3 b - - 0 1",
});
const ROWS = [row("own"), row("copy", "orig"), row("other")];

describe("practiceFamilyOf", () => {
  it("un ejercicio propio es su familia; una copia de lección suma su original", () => {
    expect(practiceFamilyOf(row("own"))).toEqual(["own"]);
    expect(practiceFamilyOf(row("copy", "orig"))).toEqual(["copy", "orig"]);
  });
});

describe("lessonPracticeOf", () => {
  it("sin ejercicios en juego no hay práctica", () => {
    expect(lessonPracticeOf(PLACE, [], [], LEVELS, NOW)).toBeNull();
  });

  it("cuenta por clave de resolución: la copia está resuelta si su original lo está, y empieza por la primera sin resolver", () => {
    const practice = lessonPracticeOf(
      PLACE,
      ROWS,
      [{ exerciseId: "orig", firstSolvedAt: YESTERDAY, lastAttemptAt: YESTERDAY }],
      LEVELS,
      NOW,
    );
    expect(practice).toMatchObject({ total: 3, solved: 1 });
    expect(practice?.items.map((item) => item.solved)).toEqual([false, true, false]);
    expect(practice?.items[0]).toMatchObject({
      n: 1,
      href: "/cursos/10000001/2/20000004/practica/1",
      facts: "Secuencia · 1400 · Intermedio",
      orientation: "black",
    });
    expect(practice?.start).toEqual({ href: "/cursos/10000001/2/20000004/practica/1", label: "Continuar" });
  });

  it("«Empezar» sin intentos; salta lo intentado hoy, que abriría sin puntuar; y nada cuando no queda", () => {
    expect(lessonPracticeOf(PLACE, ROWS, [], LEVELS, NOW)?.start).toMatchObject({ label: "Empezar" });
    const skipped = lessonPracticeOf(
      PLACE,
      ROWS,
      [{ exerciseId: "own", firstSolvedAt: null, lastAttemptAt: TODAY_EARLIER }],
      LEVELS,
      NOW,
    );
    expect(skipped?.start).toEqual({ href: "/cursos/10000001/2/20000004/practica/2", label: "Continuar" });
    const done = lessonPracticeOf(
      PLACE,
      ROWS,
      [
        { exerciseId: "own", firstSolvedAt: YESTERDAY, lastAttemptAt: YESTERDAY },
        { exerciseId: "copy", firstSolvedAt: YESTERDAY, lastAttemptAt: YESTERDAY },
        { exerciseId: "other", firstSolvedAt: null, lastAttemptAt: TODAY_EARLIER },
      ],
      LEVELS,
      NOW,
    );
    expect(done).toMatchObject({ solved: 2, start: null });
  });
});

describe("the way through a lesson's exercises", () => {
  it("dice el lugar y lleva al siguiente hasta el último", () => {
    expect(lessonPosition(2, 3)).toBe("2 / 3");
    expect(nextInLesson(PLACE, 2, 3)).toEqual({
      href: "/cursos/10000001/2/20000004/practica/3",
      label: "Siguiente ejercicio",
    });
    expect(nextInLesson(PLACE, 3, 3)).toBeNull();
  });
});
