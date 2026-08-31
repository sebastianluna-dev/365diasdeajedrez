import { describe, expect, it } from "vitest";
import { planAssignment } from "./assignment-rules";

describe("planAssignment", () => {
  it("crea la primera asignación sin cerrar nada", () => {
    expect(planAssignment([], "t1")).toEqual({ closeIds: [], create: true, alreadyAssigned: false });
  });

  it("cierra la activa y crea la nueva al reasignar", () => {
    const plan = planAssignment([{ id: "a1", teacherId: "t1" }], "t2");
    expect(plan).toEqual({ closeIds: ["a1"], create: true, alreadyAssigned: false });
  });

  it("no toca nada si ya está con ese profesor", () => {
    const plan = planAssignment([{ id: "a1", teacherId: "t1" }], "t1");
    expect(plan).toEqual({ closeIds: [], create: false, alreadyAssigned: true });
  });

  it("cierra todas las activas si el índice llegara a permitir varias", () => {
    const plan = planAssignment(
      [
        { id: "a1", teacherId: "t1" },
        { id: "a2", teacherId: "t3" },
      ],
      "t2",
    );
    expect(plan.closeIds).toEqual(["a1", "a2"]);
    expect(plan.create).toBe(true);
  });

  it("nunca propone borrar: sólo cerrar y crear", () => {
    const plan = planAssignment([{ id: "a1", teacherId: "t1" }], "t2");
    expect(Object.keys(plan)).toEqual(["closeIds", "create", "alreadyAssigned"]);
  });
});
