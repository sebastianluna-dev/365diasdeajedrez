import { describe, expect, it } from "vitest";
import { LEVEL_VALUES } from "@/prisma/seed-data";
import { levelContains, levelOfDifficulty, type DifficultyLevel } from "./exercise-level";

const LEVELS: DifficultyLevel[] = LEVEL_VALUES.map((level, order) => ({ ...level, order, isActive: true }));

describe("levelOfDifficulty", () => {
  it("da el nivel cuyo rango contiene la dificultad, con los dos extremos dentro", () => {
    expect(levelOfDifficulty(1200, LEVELS)?.name).toBe("Intermedio");
    expect(levelOfDifficulty(1599, LEVELS)?.name).toBe("Intermedio");
    expect(levelOfDifficulty(1600, LEVELS)?.name).toBe("Avanzado");
    expect(levelOfDifficulty(400, LEVELS)?.name).toBe("Iniciación");
  });

  it("el último nivel no tiene techo", () => {
    expect(levelOfDifficulty(3000, LEVELS)?.name).toBe("Maestro");
  });

  it("salta un nivel inactivo", () => {
    const levels = LEVELS.map((level) => (level.name === "Intermedio" ? { ...level, isActive: false } : level));
    expect(levelOfDifficulty(1400, levels)).toBeNull();
  });

  it("con dos rangos que se pisan, da el más fácil", () => {
    const levels: DifficultyLevel[] = [
      { slug: "b", name: "B", order: 1, eloMin: 1000, eloMax: 1500, isActive: true },
      { slug: "a", name: "A", order: 0, eloMin: 1200, eloMax: 1300, isActive: true },
    ];
    expect(levelOfDifficulty(1250, levels)?.slug).toBe("a");
    expect(levelOfDifficulty(1400, levels)?.slug).toBe("b");
  });

  it("levelContains es inclusivo y sin techo con eloMax nulo", () => {
    expect(levelContains({ eloMin: 800, eloMax: 1199 }, 1199)).toBe(true);
    expect(levelContains({ eloMin: 800, eloMax: 1199 }, 1200)).toBe(false);
    expect(levelContains({ eloMin: 2200, eloMax: null }, 2900)).toBe(true);
  });
});
