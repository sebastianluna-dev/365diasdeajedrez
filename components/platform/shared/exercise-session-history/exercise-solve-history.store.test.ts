import { describe, expect, it } from "vitest";
import { isSolvePath } from "./exercise-solve-history.store";

describe("the pages a visit's history lives on", () => {
  it("are «Ejercicios» itself, practice, a library exercise again and a series' exercise", () => {
    for (const path of [
      "/ejercicios",
      "/ejercicios/practica",
      "/ejercicios/biblioteca/abc123",
      "/ejercicios/series/s1/3",
    ]) {
      expect(isSolvePath(path)).toBe(true);
    }
  });

  it("are not the overview, a series' page, the history or the storm", () => {
    for (const path of [
      "/ejercicios/series",
      "/ejercicios/series/s1",
      "/ejercicios/historial",
      "/ejercicios/contrarreloj",
    ]) {
      expect(isSolvePath(path)).toBe(false);
    }
  });
});
