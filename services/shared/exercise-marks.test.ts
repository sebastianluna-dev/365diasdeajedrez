import { describe, expect, it } from "vitest";
import { exerciseMarksBy } from "./exercise-marks";

describe("exerciseMarksBy", () => {
  const passed = { code: "PASSED" };
  const failed = { code: "FAILED" };

  it("marca resuelto con un acierto en el contenedor, fallado con intentos sin acierto, y nada en otro sitio", () => {
    const marks = exerciseMarksBy([
      { containerId: "s1", exerciseId: "e1", result: failed },
      { containerId: "s1", exerciseId: "e1", result: passed },
      { containerId: "s1", exerciseId: "e2", result: failed },
      { containerId: "s2", exerciseId: "e1", result: failed },
      { containerId: null, exerciseId: "e3", result: passed },
      { containerId: "s1", exerciseId: null, result: passed },
    ]);
    expect(marks.get("s1")?.get("e1")).toBe("solved");
    expect(marks.get("s1")?.get("e2")).toBe("failed");
    expect(marks.get("s1")?.get("e3")).toBeUndefined();
    expect(marks.get("s2")?.get("e1")).toBe("failed");
  });

  it("lee cualquier fila guardada con el contenedor, también la de un bloque de clase sin puntuar (D49)", () => {
    // The writer stores a class attempt after a scored one that day with `scored: false`; the fold does not know, and must not.
    const marks = exerciseMarksBy([{ containerId: "b1", exerciseId: "e1", result: passed }]);
    expect(marks.get("b1")?.get("e1")).toBe("solved");
  });

  it("un fallo después del acierto no lo quita", () => {
    const marks = exerciseMarksBy([
      { containerId: "b1", exerciseId: "e1", result: passed },
      { containerId: "b1", exerciseId: "e1", result: failed },
    ]);
    expect(marks.get("b1")?.get("e1")).toBe("solved");
  });
});
