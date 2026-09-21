import { describe, expect, it } from "vitest";
import { EXERCISE_MODE } from "@/constants/platform/training-codes.const";
import { isExerciseStale, mapTrainerChapter, mapTrainerExercise, type TrainerExerciseRow } from "./trainer.mapper";

const frozen = new Date(Date.UTC(2026, 8, 1));

describe("isExerciseStale", () => {
  it("sin fecha de edición del PGN nunca está desactualizado", () => {
    expect(isExerciseStale(null, null)).toBe(false);
    expect(isExerciseStale(frozen, null)).toBe(false);
  });

  it("sin fecha de congelado se asume desactualizado: son ejercicios anteriores al campo", () => {
    expect(isExerciseStale(null, frozen)).toBe(true);
  });

  it("está desactualizado sólo si el PGN se editó después de congelarlo", () => {
    expect(isExerciseStale(frozen, new Date(frozen.getTime() + 1))).toBe(true);
    expect(isExerciseStale(frozen, new Date(frozen.getTime() - 1))).toBe(false);
  });
});

describe("mapTrainerExercise", () => {
  it("parte la línea en SAN, saca el color del FEN y arrastra la lección y el capítulo", () => {
    const row = {
      id: "ex1",
      promptText: null,
      startFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      line: "c5 Nf3  d6",
      frozenAt: frozen,
      mode: { code: EXERCISE_MODE.REPRODUCE_LINE },
      lesson: { name: "La Najdorf", pgnUpdatedAt: null, chapter: { name: "Siciliana" } },
    } as unknown as TrainerExerciseRow;

    expect(mapTrainerExercise(row)).toEqual({
      id: "ex1",
      modeCode: EXERCISE_MODE.REPRODUCE_LINE,
      promptText: undefined,
      startFen: row.startFen,
      lineSans: ["c5", "Nf3", "d6"],
      lessonName: "La Najdorf",
      chapterName: "Siciliana",
      userColor: "black",
      isStale: false,
    });
  });
});

describe("mapTrainerChapter", () => {
  it("enlaza al capítulo por su número de orden dentro del curso", () => {
    const item = mapTrainerChapter(
      { id: "ch1", name: "Posiciones", order: 3, courseId: "00020212", course: { name: "Finales" }, exerciseCount: 2 },
      true,
    );
    expect(item).toEqual({
      chapterId: "ch1",
      chapterName: "Posiciones",
      courseName: "Finales",
      exerciseCount: 2,
      inTrainer: true,
      chapterHref: "/cursos/00020212/3",
    });
  });
});
