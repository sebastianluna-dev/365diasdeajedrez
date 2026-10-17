import { describe, expect, it } from "vitest";
import { EXERCISE_BLOCK_LIMITS, exerciseBlockError, gameBlockSource } from "./block-rules";

describe("gameBlockSource", () => {
  it("la partida transcrita manda sobre la citada", () => {
    expect(gameBlockSource({ pgn: "1. e4 *", gameId: "g1" })).toEqual({ kind: "pgn", pgn: "1. e4 *" });
    expect(gameBlockSource({ pgn: "  ", gameId: "g1" })).toEqual({ kind: "game", gameId: "g1" });
    expect(gameBlockSource({ pgn: null, gameId: null })).toEqual({ error: "blockPgnEmpty" });
    expect(gameBlockSource({ pgn: undefined, gameId: "" })).toEqual({ error: "blockPgnEmpty" });
  });
});

describe("exerciseBlockError (D29, D30)", () => {
  const ids = (count: number) => Array.from({ length: count }, (_, index) => `ex${index}`);

  it("de uno a diez ejercicios, para preparar o para después de la clase", () => {
    expect(EXERCISE_BLOCK_LIMITS).toEqual({ min: 1, max: 10 });
    expect(exerciseBlockError({ exerciseIds: ids(1), visibility: "BEFORE" })).toBeNull();
    expect(exerciseBlockError({ exerciseIds: ids(10), visibility: "AFTER" })).toBeNull();
    expect(exerciseBlockError({ exerciseIds: [], visibility: "BEFORE" })).toBe("blockExercises");
    expect(exerciseBlockError({ exerciseIds: [" ", ""], visibility: "BEFORE" })).toBe("blockExercises");
    expect(exerciseBlockError({ exerciseIds: ids(11), visibility: "BEFORE" })).toBe("blockExercises");
  });

  it("nunca el mismo ejercicio dos veces", () => {
    expect(exerciseBlockError({ exerciseIds: ["ex1", "ex1"], visibility: "BEFORE" })).toBe("blockExercisesRepeated");
  });

  it("nunca el guion del profesor: el bloque es la tarea del alumno", () => {
    expect(exerciseBlockError({ exerciseIds: ids(2), visibility: "TEACHER" })).toBe("blockExerciseVisibility");
  });
});
