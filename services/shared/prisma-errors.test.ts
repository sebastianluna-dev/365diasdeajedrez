import { describe, expect, it } from "vitest";
import { isUniqueConstraintError } from "./prisma-errors";

// The two real shapes of the P2002. The driver adapter's is copied from an error
// observed against the database: it is the only one that carries the name of a
// hand-made partial index.
const driverAdapterError = {
  code: "P2002",
  meta: {
    driverAdapterError: {
      name: "DriverAdapterError",
      cause: {
        originalCode: "23505",
        kind: "UniqueConstraintViolation",
        constraint: { index: "teacher_student_one_active" },
        table: "TeacherStudent",
      },
    },
    modelName: "TeacherStudent",
  },
};

const classicError = { code: "P2002", meta: { target: ["email"] } };

describe("isUniqueConstraintError", () => {
  it("reconoce el índice por el camino del driver adapter", () => {
    expect(isUniqueConstraintError(driverAdapterError, "teacher_student_one_active")).toBe(true);
  });

  it("reconoce las columnas por el camino clásico", () => {
    expect(isUniqueConstraintError(classicError, "email")).toBe(true);
  });

  it("acepta varias grafías del mismo conflicto", () => {
    expect(isUniqueConstraintError(driverAdapterError, "studentId", "teacher_student_one_active")).toBe(true);
  });

  it("no confunde conflictos distintos", () => {
    expect(isUniqueConstraintError(driverAdapterError, "email")).toBe(false);
    expect(isUniqueConstraintError(classicError, "teacher_student_one_active")).toBe(false);
  });

  it("ignora lo que no sea un P2002", () => {
    expect(isUniqueConstraintError({ code: "P2025" }, "email")).toBe(false);
    expect(isUniqueConstraintError(new Error("boom"), "email")).toBe(false);
    expect(isUniqueConstraintError(null, "email")).toBe(false);
    expect(isUniqueConstraintError(undefined, "email")).toBe(false);
  });
});
