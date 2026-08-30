import { describe, expect, it } from "vitest";

import { GAME_RESULT, GAME_RESULT_BY_PGN_TOKEN } from "@/constants/platform/study-codes.const";

describe("GAME_RESULT_BY_PGN_TOKEN", () => {
  it("mapea cada token PGN a su code de catálogo", () => {
    expect(GAME_RESULT_BY_PGN_TOKEN["1-0"]).toBe(GAME_RESULT.WHITE_WINS);
    expect(GAME_RESULT_BY_PGN_TOKEN["0-1"]).toBe(GAME_RESULT.BLACK_WINS);
    expect(GAME_RESULT_BY_PGN_TOKEN["1/2-1/2"]).toBe(GAME_RESULT.DRAW);
    expect(GAME_RESULT_BY_PGN_TOKEN["*"]).toBe(GAME_RESULT.ONGOING);
  });

  it("cubre los cuatro tokens y ningún otro", () => {
    expect(Object.keys(GAME_RESULT_BY_PGN_TOKEN).sort()).toEqual(["*", "0-1", "1-0", "1/2-1/2"]);
  });

  it("devuelve undefined para un token desconocido (el importador debe decidir)", () => {
    expect(GAME_RESULT_BY_PGN_TOKEN["?"]).toBeUndefined();
  });
});
