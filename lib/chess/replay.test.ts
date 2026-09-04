import { describe, expect, it } from "vitest";
import { uciLineSteps, uciLineToSan } from "./replay";

describe("uciLineToSan", () => {
  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("traduce la línea del módulo a notación de partida", () => {
    expect(uciLineToSan(START, ["e2e4", "e7e5", "g1f3", "b8c6"])).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });

  it("desambigua según la posición, que es lo que obliga a reproducirla", () => {
    // Caballos en c3 y f4: a d5 llegan LOS DOS, así que el SAN tiene que decir
    // cuál va. Con uno en g3 no habría ambigüedad, porque g3 no alcanza d5.
    const twoKnights = "4k3/8/8/8/5N2/2N5/8/4K3 w - - 0 1";
    expect(uciLineToSan(twoKnights, ["c3d5"])).toEqual(["Ncd5"]);
  });

  it("corta en la primera jugada imposible en vez de devolverla a medias", () => {
    expect(uciLineToSan(START, ["e2e4", "e7e5", "e2e4"])).toEqual(["e4", "e5"]);
  });

  it("entiende la coronación", () => {
    // El rey negro va en e6 y no en e8: desde a8 la dama daría jaque por la
    // octava, y el «+» del SAN taparía lo que se quiere comprobar aquí.
    const promoting = "8/P7/4k3/8/8/8/8/4K3 w - - 0 1";
    expect(uciLineToSan(promoting, ["a7a8q"])).toEqual(["a8=Q"]);
    expect(uciLineToSan(promoting, ["a7a8n"])).toEqual(["a8=N"]);
  });

  it("con una línea vacía no devuelve nada", () => {
    expect(uciLineToSan(START, [])).toEqual([]);
  });
});

describe("uciLineSteps", () => {
  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("da la posición a la que lleva cada jugada, que es lo que se previsualiza", () => {
    const steps = uciLineSteps(START, ["e2e4", "e7e5"]);

    expect(steps.map((step) => step.san)).toEqual(["e4", "e5"]);
    expect(steps[0].fen).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    expect(steps[0].lastMove).toEqual(["e2", "e4"]);
    expect(steps[1].fen).toBe("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
  });

  it("corta donde corta la línea, sin posiciones inventadas", () => {
    expect(uciLineSteps(START, ["e2e4", "e2e4"]).map((step) => step.san)).toEqual(["e4"]);
  });
});
