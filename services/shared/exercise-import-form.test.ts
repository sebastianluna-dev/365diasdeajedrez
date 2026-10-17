import { describe, expect, it } from "vitest";
import { exercisesImportedNotice, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { readExerciseImportForm } from "./exercise-import-form";

function form(entries: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(entries)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(name, item);
  }
  return data;
}

const FILLED = {
  pgn: '[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n1. Rd8# *',
  difficulty: "1400",
  kind: "MATE_IN",
  mateIn: "2",
  topics: ["TACTICS", "FORK"],
  status: "ready",
  seriesId: "",
  dropMistakeVariants: "on",
  intent: "preview",
};

describe("readExerciseImportForm", () => {
  it("lee el formulario entero: el PGN, los valores por defecto, el estado, la serie y el paso", () => {
    const read = readExerciseImportForm(form(FILLED));
    expect(read).toEqual({
      ok: true,
      values: {
        pgn: FILLED.pgn,
        intent: "preview",
        status: "ready",
        seriesId: null,
        defaults: {
          difficulty: 1400,
          kind: "MATE_IN",
          mateIn: 2,
          topicCodes: ["TACTICS", "FORK"],
          dropMistakeVariants: true,
        },
      },
    });
  });

  it("una secuencia no lleva N; «Mate en N» sin N se rechaza; la casilla sin marcar es false", () => {
    const sequence = readExerciseImportForm(form({ ...FILLED, kind: "SEQUENCE", dropMistakeVariants: [] }));
    expect(sequence).toMatchObject({
      ok: true,
      values: { defaults: { kind: "SEQUENCE", mateIn: null, dropMistakeVariants: false } },
    });
    expect(readExerciseImportForm(form({ ...FILLED, mateIn: "9" }))).toEqual({
      ok: false,
      field: "mateIn",
      code: "invalid_value",
    });
  });

  it("rechaza un PGN vacío, una dificultad fuera de paso y un estado que no existe", () => {
    expect(readExerciseImportForm(form({ ...FILLED, pgn: "" }))).toMatchObject({ ok: false, field: "pgn" });
    expect(readExerciseImportForm(form({ ...FILLED, difficulty: "1425" }))).toEqual({
      ok: false,
      field: "difficulty",
      code: "step",
    });
    expect(readExerciseImportForm(form({ ...FILLED, status: "published" }))).toMatchObject({
      ok: false,
      field: "status",
    });
  });
});

describe("the import's notice", () => {
  it("cuenta lo importado y lo que entró como borrador", () => {
    expect(exercisesImportedNotice(12, 0)).toBe("Se importaron 12 ejercicios.");
    expect(exercisesImportedNotice(1, 0)).toBe("Se importó 1 ejercicio.");
    expect(exercisesImportedNotice(9, 3)).toBe("Se importaron 12 ejercicios (3 como borrador).");
    expect(exercisesImportedNotice(0, 1)).toBe("Se importó 1 ejercicio (como borrador).");
    expect(exercisesImportedNotice(0, 4)).toBe("Se importaron 4 ejercicios (todos como borrador).");
  });

  it("se lee de la dirección con sus dos cifras, y nada más pasa por notice", () => {
    expect(readExerciseNotice("exercisesImported.9.3")).toBe("Se importaron 12 ejercicios (3 como borrador).");
    expect(readExerciseNotice("exercisesImported.x.3")).toBeNull();
    expect(readExerciseNotice("exerciseSaved")).toBe("Ejercicio guardado.");
    expect(readExerciseNotice("nope")).toBeNull();
  });
});
