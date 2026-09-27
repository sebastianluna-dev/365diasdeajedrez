import { describe, expect, it } from "vitest";
import {
  coursesOfLevel,
  formatEloRange,
  isValidEloRange,
  labelEloRange,
  resolveLevelFilter,
  shortEloRange,
} from "./level-rules";

describe("formatEloRange", () => {
  it("dice el rango cerrado con sus dos extremos", () => {
    expect(formatEloRange({ eloMin: 800, eloMax: 1199 })).toBe("800–1199");
    expect(formatEloRange({ eloMin: 2000, eloMax: 2199 })).toBe("2000–2199");
  });

  it("un rango que empieza en cero se dice por el primer Elo que ya no entra", () => {
    expect(formatEloRange({ eloMin: 0, eloMax: 799 })).toBe("Menos de 800");
  });

  it("sin máximo, el rango queda abierto por arriba", () => {
    expect(formatEloRange({ eloMin: 2200, eloMax: null })).toBe("2200 o más");
    expect(formatEloRange({ eloMin: 2200 })).toBe("2200 o más");
  });

  it("de cero y sin máximo no es un rango", () => {
    expect(formatEloRange({ eloMin: 0, eloMax: null })).toBe("Cualquier Elo");
  });
});

describe("labelEloRange", () => {
  it("nombra el rango y lo deja en minúscula tras los dos puntos", () => {
    expect(labelEloRange("800–1199")).toBe("Elo orientativo: 800–1199");
    expect(labelEloRange("Menos de 800")).toBe("Elo orientativo: menos de 800");
    expect(labelEloRange("2200 o más")).toBe("Elo orientativo: 2200 o más");
  });
});

describe("shortEloRange", () => {
  it("lo dice en lo que cabe en una tarjeta", () => {
    expect(shortEloRange("800–1199")).toBe("Elo 800–1199");
    expect(shortEloRange("Menos de 800")).toBe("Elo menos de 800");
  });
});

describe("isValidEloRange", () => {
  it("acepta los límites inclusivos y el máximo abierto", () => {
    expect(isValidEloRange({ eloMin: 0, eloMax: 799 }, 4000)).toBe(true);
    expect(isValidEloRange({ eloMin: 2200, eloMax: null }, 4000)).toBe(true);
    expect(isValidEloRange({ eloMin: 1500, eloMax: 1500 }, 4000)).toBe(true);
  });

  it("rechaza el rango invertido, el negativo y el que se sale del límite", () => {
    expect(isValidEloRange({ eloMin: 1200, eloMax: 1199 }, 4000)).toBe(false);
    expect(isValidEloRange({ eloMin: -1, eloMax: 100 }, 4000)).toBe(false);
    expect(isValidEloRange({ eloMin: 100, eloMax: 4001 }, 4000)).toBe(false);
    expect(isValidEloRange({ eloMin: 4001 }, 4000)).toBe(false);
    expect(isValidEloRange({ eloMin: 10.5, eloMax: 20 }, 4000)).toBe(false);
  });
});

const LEVELS = [{ slug: "principiante" }, { slug: "intermedio" }];
const COURSES = [
  { id: "a", levels: [{ slug: "principiante" }, { slug: "intermedio" }] },
  { id: "b", levels: [{ slug: "intermedio" }] },
  { id: "c", levels: [] },
];

describe("resolveLevelFilter", () => {
  it("encuentra el nivel del catálogo que nombra la URL", () => {
    expect(resolveLevelFilter(LEVELS, "intermedio")).toEqual({ slug: "intermedio" });
  });

  it("ignora un nivel que el catálogo no tiene, y la ausencia de nivel", () => {
    expect(resolveLevelFilter(LEVELS, "gran-maestro")).toBeUndefined();
    expect(resolveLevelFilter(LEVELS, undefined)).toBeUndefined();
    expect(resolveLevelFilter(LEVELS, "")).toBeUndefined();
  });
});

describe("coursesOfLevel", () => {
  it("deja los cursos dirigidos a ese nivel, tengan o no otros", () => {
    expect(coursesOfLevel(COURSES, "principiante").map((course) => course.id)).toEqual(["a"]);
    expect(coursesOfLevel(COURSES, "intermedio").map((course) => course.id)).toEqual(["a", "b"]);
  });

  it("sin nivel los devuelve todos, también los que no tienen ninguno", () => {
    expect(coursesOfLevel(COURSES, undefined)).toHaveLength(3);
  });
});
