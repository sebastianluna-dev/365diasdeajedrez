import { describe, expect, it } from "vitest";
import { classExerciseSolvedCounts, classSolvedLabels, solvedCountLabel } from "./class-exercise-progress";

const passed = { code: "PASSED" };
const failed = { code: "FAILED" };
const attempt = (userId: string, classBlockId: string | null, exerciseId: string | null, result = passed) => ({
  userId,
  classBlockId,
  exerciseId,
  result,
});

describe("classExerciseSolvedCounts", () => {
  it("cuenta a cada alumno con plaza una vez por ejercicio, sólo con un acierto desde ese bloque", () => {
    const counts = classExerciseSolvedCounts(
      [
        attempt("a", "b1", "e1"),
        attempt("a", "b1", "e1"),
        attempt("b", "b1", "e1", failed),
        attempt("c", "b1", "e1"),
        attempt("a", "b1", "e2", failed),
        attempt("a", "b2", "e1"),
        attempt("moved", "b1", "e1"),
        attempt("a", null, "e1"),
        attempt("a", "b1", null),
      ],
      ["a", "b", "c"],
    );
    expect(counts.get("b1")?.get("e1")).toBe(2);
    expect(counts.get("b1")?.get("e2")).toBeUndefined();
    expect(counts.get("b2")?.get("e1")).toBe(1);
  });
});

describe("solvedCountLabel y classSolvedLabels", () => {
  it("escribe «2 de 3 lo resolvieron», en singular con uno, y «Sin alumnos» sin plazas", () => {
    expect(solvedCountLabel(2, 3)).toBe("2 de 3 lo resolvieron");
    expect(solvedCountLabel(1, 3)).toBe("1 de 3 lo resolvió");
    expect(solvedCountLabel(0, 3)).toBe("0 de 3 lo resolvieron");
    expect(solvedCountLabel(0, 0)).toBe("Sin alumnos");
  });

  it("da la etiqueta de cada ejercicio de cada bloque, también sin intentos", () => {
    const labels = classSolvedLabels(
      [{ id: "b1", exerciseIds: ["e1", "e2"] }],
      [attempt("a", "b1", "e1"), attempt("b", "b1", "e1")],
      ["a", "b", "c"],
    );
    expect(labels.get("b1")?.get("e1")).toBe("2 de 3 lo resolvieron");
    expect(labels.get("b1")?.get("e2")).toBe("0 de 3 lo resolvieron");
  });
});
