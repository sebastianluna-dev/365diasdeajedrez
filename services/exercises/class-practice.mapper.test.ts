import { describe, expect, it } from "vitest";
import { classBlockPosition, nextInClassBlock, solvableBlockItems } from "./class-practice.mapper";

describe("solvableBlockItems", () => {
  const item = (id: string, teacherId: string | null, status: string) => ({
    exercise: { id, teacherId, status: { code: status } },
  });

  it("keeps the class teacher's usable exercises and the library's, in order, and drops the rest", () => {
    const items = [
      item("e1", "t-1", "READY"),
      item("e2", "t-1", "ARCHIVED"),
      item("e3", "t-2", "PUBLISHED"),
      item("e4", "t-2", "READY"),
      item("e5", "t-1", "IN_REVIEW"),
      item("e6", "t-1", "DRAFT"),
    ];
    expect(solvableBlockItems(items, "t-1").map((exercise) => exercise.id)).toEqual(["e1", "e3", "e5"]);
  });
});

describe("the solve page's data", () => {
  it("says where it stands and what comes next", () => {
    expect(classBlockPosition(2, 3)).toBe("2 / 3");
    expect(nextInClassBlock("c2", "b6", 2, 3)).toEqual({
      href: "/clases/c2/ejercicios/b6/3",
      label: "Siguiente ejercicio",
    });
    expect(nextInClassBlock("c2", "b6", 3, 3)).toBeNull();
  });
});
