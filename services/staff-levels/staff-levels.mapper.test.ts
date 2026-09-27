import { describe, expect, it } from "vitest";
import { mapLevelAdmin, mapLevelOption } from "./staff-levels.mapper";

describe("mapLevelAdmin", () => {
  it("redacta el rango y cuenta los cursos del nivel", () => {
    expect(
      mapLevelAdmin({
        id: 5,
        slug: "experto",
        name: "Experto",
        description: "Análisis profundo.",
        order: 5,
        eloMin: 2000,
        eloMax: 2199,
        isActive: true,
        _count: { courseLevels: 3 },
      }),
    ).toEqual({
      id: 5,
      slug: "experto",
      name: "Experto",
      description: "Análisis profundo.",
      order: 5,
      eloMin: 2000,
      eloMax: 2199,
      eloRange: "2000–2199",
      isActive: true,
      courseCount: 3,
    });
  });

  it("un máximo nulo es un rango abierto, no un Elo de cero", () => {
    const mapped = mapLevelAdmin({
      id: 6,
      slug: "maestro",
      name: "Maestro",
      description: "Preparación especializada.",
      order: 6,
      eloMin: 2200,
      eloMax: null,
      isActive: false,
      _count: { courseLevels: 0 },
    });

    expect(mapped.eloMax).toBeUndefined();
    expect(mapped.eloRange).toBe("2200 o más");
    expect(mapped.isActive).toBe(false);
  });
});

describe("mapLevelOption", () => {
  it("lleva al editor del curso el nombre, el rango y si sigue en uso", () => {
    expect(
      mapLevelOption({
        slug: "iniciacion",
        name: "Iniciación",
        eloMin: 0,
        eloMax: 799,
        isActive: true,
      }),
    ).toEqual({
      slug: "iniciacion",
      name: "Iniciación",
      eloRange: "Menos de 800",
      isActive: true,
    });
  });
});
