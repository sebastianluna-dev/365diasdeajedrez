import { describe, expect, it } from "vitest";
import { EXERCISE_FORM_FIELDS, exerciseErrorTab, readExerciseForm } from "./exercise-form";

const PGN = '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n1. Rd8# *';

function form(fields: Record<string, string | string[]>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(name, item);
  }
  return data;
}

const BASE = {
  title: "  Mate del pasillo ",
  prompt: "",
  kind: "SEQUENCE",
  difficulty: "1200",
  topics: ["BACK_RANK_MATE", "TACTICS", "BACK_RANK_MATE"],
  hints: ["Mira la última fila.", "  ", ""],
  explanation: "",
  sourceWhite: "",
  sourceBlack: "",
  sourceEvent: "",
  sourceYear: "",
  solutionPgn: PGN,
};

describe("readExerciseForm", () => {
  it("lee el formulario del editor: recorta, quita las pistas vacías y los temas repetidos", () => {
    const read = readExerciseForm(form(BASE));
    expect(read).toEqual({
      ok: true,
      values: {
        solution: { solutionPgn: PGN, kind: "SEQUENCE", mateIn: null },
        content: {
          title: "Mate del pasillo",
          prompt: null,
          difficulty: 1200,
          hints: ["Mira la última fila."],
          explanation: null,
          sourceWhite: null,
          sourceBlack: null,
          sourceEvent: null,
          sourceYear: null,
          topicCodes: ["BACK_RANK_MATE", "TACTICS"],
        },
      },
    });
  });

  it("un borrador puede no tener temas", () => {
    const read = readExerciseForm(form({ ...BASE, topics: [] }));
    expect(read.ok && read.values.content.topicCodes).toEqual([]);
  });

  it("«Mate en N» pide su N, de 1 a 5; una secuencia lo ignora", () => {
    expect(readExerciseForm(form({ ...BASE, kind: "MATE_IN", mateIn: "" }))).toMatchObject({
      ok: false,
      field: "mateIn",
    });
    expect(readExerciseForm(form({ ...BASE, kind: "MATE_IN", mateIn: "6" }))).toMatchObject({
      ok: false,
      field: "mateIn",
    });
    const mate = readExerciseForm(form({ ...BASE, kind: "MATE_IN", mateIn: "2" }));
    expect(mate.ok && mate.values.solution).toMatchObject({ kind: "MATE_IN", mateIn: 2 });
    const sequence = readExerciseForm(form({ ...BASE, mateIn: "3" }));
    expect(sequence.ok && sequence.values.solution.mateIn).toBeNull();
  });

  it("rechaza lo que la base no aceptaría, nombrando el campo", () => {
    expect(readExerciseForm(form({ ...BASE, title: " " }))).toMatchObject({ ok: false, field: "title" });
    expect(readExerciseForm(form({ ...BASE, difficulty: "3050" }))).toMatchObject({ ok: false, field: "difficulty" });
    expect(readExerciseForm(form({ ...BASE, difficulty: "399" }))).toMatchObject({ ok: false, field: "difficulty" });
    expect(readExerciseForm(form({ ...BASE, sourceYear: "1399" }))).toMatchObject({ ok: false, field: "sourceYear" });
    expect(readExerciseForm(form({ ...BASE, sourceYear: "mil" }))).toMatchObject({ ok: false, field: "sourceYear" });
    expect(readExerciseForm(form({ ...BASE, topics: ["NOPE"] }))).toMatchObject({ ok: false, field: "topics" });
    expect(readExerciseForm(form({ ...BASE, hints: ["a", "b", "c", "d"] }))).toMatchObject({
      ok: false,
      field: "hints",
    });
    expect(readExerciseForm(form({ ...BASE, solutionPgn: "" }))).toMatchObject({ ok: false, field: "solutionPgn" });
    expect(readExerciseForm(form({ ...BASE, kind: "MULTIPLE_CHOICE" }))).toMatchObject({ ok: false, field: "kind" });
  });

  it("lee el año de la fuente", () => {
    const read = readExerciseForm(form({ ...BASE, sourceYear: "1858" }));
    expect(read.ok && read.values.content.sourceYear).toBe(1858);
  });

  it("los campos que devuelve un guardado rechazado son los del esquema", () => {
    expect(EXERCISE_FORM_FIELDS).toEqual(expect.arrayContaining(["title", "topics", "hints", "solutionPgn", "mateIn"]));
  });
});

describe("exerciseErrorTab", () => {
  it("lleva cada error a su pestaña", () => {
    expect(exerciseErrorTab({ field: "title" })).toBe("data");
    expect(exerciseErrorTab({ field: "solutionPgn" })).toBe("solution");
    expect(exerciseErrorTab({ problem: "badPosition" })).toBe("position");
    expect(exerciseErrorTab({ problem: "unsupportedVariant" })).toBe("position");
    expect(exerciseErrorTab({ problem: "mateInMissing" })).toBe("data");
    expect(exerciseErrorTab({ problem: "notMate" })).toBe("solution");
    expect(exerciseErrorTab({ problem: "mistakeVariant" })).toBe("solution");
    expect(exerciseErrorTab({ problem: "unreadable" })).toBe("solution");
  });
});
