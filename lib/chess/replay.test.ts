import { describe, expect, it } from "vitest";
import { finalFenOf, moveSquaresOfSan, uciLineSteps, uciLineToSan } from "./replay";

describe("uciLineToSan", () => {
  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("traduce la línea del módulo a notación de partida", () => {
    expect(uciLineToSan(START, ["e2e4", "e7e5", "g1f3", "b8c6"])).toEqual(["e4", "e5", "Nf3", "Nc6"]);
  });

  it("desambigua según la posición, que es lo que obliga a reproducirla", () => {
    // Knights on c3 and f4: BOTH reach d5, so the SAN has to say which one goes.
    // With one on g3 there would be no ambiguity, because g3 does not reach d5.
    const twoKnights = "4k3/8/8/8/5N2/2N5/8/4K3 w - - 0 1";
    expect(uciLineToSan(twoKnights, ["c3d5"])).toEqual(["Ncd5"]);
  });

  it("corta en la primera jugada imposible en vez de devolverla a medias", () => {
    expect(uciLineToSan(START, ["e2e4", "e7e5", "e2e4"])).toEqual(["e4", "e5"]);
  });

  it("entiende la coronación", () => {
    // The black king goes on e6 and not on e8: from a8 the queen would give check
    // along the eighth, and the SAN's "+" would hide what is being checked here.
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
    expect(steps[0]?.fen).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    expect(steps[0]?.lastMove).toEqual(["e2", "e4"]);
    expect(steps[1]?.fen).toBe("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
  });

  it("corta donde corta la línea, sin posiciones inventadas", () => {
    expect(uciLineSteps(START, ["e2e4", "e2e4"]).map((step) => step.san)).toEqual(["e4"]);
  });
});

describe("finalFenOf", () => {
  it("is where the main line ends, variations aside", () => {
    expect(finalFenOf("1. e4 (1. d4 d5) 1... e5 2. Nf3 *")).toBe(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    );
  });

  it("is the starting position of a game with no moves, or of one that cannot be read", () => {
    expect(finalFenOf("")).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    expect(finalFenOf('[SetUp "1"]\n[FEN "8/8/4k3/8/4P3/4K3/8/8 w - - 0 1"]\n\n*')).toBe(
      "8/8/4k3/8/4P3/4K3/8/8 w - - 0 1",
    );
  });
});

describe("moveSquaresOfSan", () => {
  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const CASTLING = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";

  it("da las dos casillas de la jugada, como las dibuja el tablero", () => {
    expect(moveSquaresOfSan(START, "Nf3")).toEqual({ from: "g1", to: "f3" });
    expect(moveSquaresOfSan(START, "e4")).toEqual({ from: "e2", to: "e4" });
  });

  it("el enroque es el rey dando sus dos pasos, no el rey tomando la torre", () => {
    expect(moveSquaresOfSan(CASTLING, "O-O")).toEqual({ from: "e1", to: "g1" });
    expect(moveSquaresOfSan(CASTLING, "O-O-O")).toEqual({ from: "e1", to: "c1" });
  });

  it("nada para una jugada ilegal o un FEN que no se lee", () => {
    expect(moveSquaresOfSan(START, "Nf6")).toBeUndefined();
    expect(moveSquaresOfSan("not a fen", "e4")).toBeUndefined();
  });
});
