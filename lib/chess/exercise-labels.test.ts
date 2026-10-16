import { describe, expect, it } from "vitest";
import { EXERCISE_KIND } from "@/constants/platform/exercise-codes.const";
import { defaultExercisePrompt, exerciseKindLabel, playerOfStart } from "./exercise-labels";

describe("exercise labels", () => {
  it("nombran el tipo: una secuencia como tal, un mate con su número", () => {
    expect(exerciseKindLabel(EXERCISE_KIND.SEQUENCE, null)).toBe("Secuencia");
    expect(exerciseKindLabel(EXERCISE_KIND.MATE_IN, 2)).toBe("Mate en 2");
  });

  it("leen quién juega del turno de la posición de partida", () => {
    expect(playerOfStart("8/8/8/8/8/8/8/8 w - - 0 1")).toBe("white");
    expect(playerOfStart("6k1/5ppp/8/8/8/8/5PPP/3R2K1 b - - 0 1")).toBe("black");
  });

  it("dicen el enunciado por defecto: el bando, y el mate en cuántas", () => {
    expect(defaultExercisePrompt("white", EXERCISE_KIND.SEQUENCE, null)).toBe("Juegan blancas");
    expect(defaultExercisePrompt("black", EXERCISE_KIND.MATE_IN, 2)).toBe("Juegan negras y dan mate en 2");
    expect(defaultExercisePrompt("white", EXERCISE_KIND.MATE_IN, null)).toBe("Juegan blancas");
  });
});
