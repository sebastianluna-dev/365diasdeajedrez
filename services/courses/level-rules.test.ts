import { describe, expect, it } from "vitest";
import {
  audienceRange,
  compactEloRange,
  coursesOfLevel,
  formatEloRange,
  isLevelStretch,
  joinNames,
  labelEloRange,
  reachableLevels,
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

describe("compactEloRange", () => {
  it("says a range in the width of a tick", () => {
    expect(compactEloRange({ eloMin: 0, eloMax: 799 })).toBe("< 800");
    expect(compactEloRange({ eloMin: 1200, eloMax: 1599 })).toBe("1200–1599");
    expect(compactEloRange({ eloMin: 2200, eloMax: null })).toBe("2200+");
  });
});

describe("audienceRange", () => {
  it("goes from the floor of the easiest level to the ceiling of the hardest", () => {
    expect(
      audienceRange([
        { eloMin: 1200, eloMax: 1599 },
        { eloMin: 1600, eloMax: 1999 },
      ]),
    ).toEqual({ eloMin: 1200, eloMax: 1999 });
  });

  it("has no ceiling when one of its levels has none", () => {
    expect(
      audienceRange([
        { eloMin: 2000, eloMax: 2199 },
        { eloMin: 2200, eloMax: null },
      ]),
    ).toEqual({ eloMin: 2000, eloMax: null });
  });

  it("does not depend on the order the levels arrive in", () => {
    expect(
      audienceRange([
        { eloMin: 1600, eloMax: 1999 },
        { eloMin: 800, eloMax: 1199 },
      ]),
    ).toEqual({ eloMin: 800, eloMax: 1999 });
  });

  it("answers nothing for a course without levels", () => {
    expect(audienceRange([])).toBeUndefined();
  });
});

describe("joinNames", () => {
  it("joins the last one with «y»", () => {
    expect(joinNames(["intermedio"])).toBe("intermedio");
    expect(joinNames(["intermedio", "avanzado"])).toBe("intermedio y avanzado");
    expect(joinNames(["principiante", "intermedio", "avanzado"])).toBe("principiante, intermedio y avanzado");
    expect(joinNames([])).toBe("");
  });
});

describe("isLevelStretch", () => {
  const ALL = ["iniciacion", "principiante", "intermedio", "avanzado", "experto", "maestro"];

  it("takes one level, and none at all", () => {
    expect(isLevelStretch(ALL, [])).toBe(true);
    expect(isLevelStretch(ALL, ["intermedio"])).toBe(true);
  });

  it("takes neighbours, in any order", () => {
    expect(isLevelStretch(ALL, ["intermedio", "avanzado"])).toBe(true);
    expect(isLevelStretch(ALL, ["avanzado", "intermedio"])).toBe(true);
    expect(isLevelStretch(ALL, ["maestro", "experto", "avanzado"])).toBe(true);
  });

  it("refuses a hole in the middle", () => {
    expect(isLevelStretch(ALL, ["iniciacion", "maestro"])).toBe(false);
    expect(isLevelStretch(ALL, ["iniciacion", "principiante", "avanzado"])).toBe(false);
  });

  it("refuses a level the catalog does not have", () => {
    expect(isLevelStretch(ALL, ["intermedio", "inventado"])).toBe(false);
  });
});

describe("reachableLevels", () => {
  const ALL = ["iniciacion", "principiante", "intermedio", "avanzado", "experto", "maestro"];

  it("offers them all while nothing is chosen", () => {
    expect(reachableLevels(ALL, [])).toEqual(new Set(ALL));
  });

  it("offers the two the stretch grows into, and its own two ends", () => {
    expect(reachableLevels(ALL, ["intermedio", "avanzado"])).toEqual(
      new Set(["principiante", "intermedio", "avanzado", "experto"]),
    );
  });

  it("leaves out what would make a hole or a gap", () => {
    const reachable = reachableLevels(ALL, ["principiante", "intermedio", "avanzado"]);
    // The middle one cannot be removed, and the far end cannot be added.
    expect(reachable.has("intermedio")).toBe(false);
    expect(reachable.has("maestro")).toBe(false);
  });

  it("at an end of the scale, offers only the side there is", () => {
    expect(reachableLevels(ALL, ["iniciacion"])).toEqual(new Set(["iniciacion", "principiante"]));
    expect(reachableLevels(ALL, ["maestro"])).toEqual(new Set(["experto", "maestro"]));
  });
});
