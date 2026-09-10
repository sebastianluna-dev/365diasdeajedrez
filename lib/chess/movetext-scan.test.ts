import { describe, expect, it } from "vitest";
import { findMalformedMoveTokens } from "./movetext-scan";

describe("findMalformedMoveTokens", () => {
  it("no se queja de una partida corriente", () => {
    const pgn = `[Event "Prueba"]
[White "Ana"]
[Black "Beto"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. O-O f6 6. d4 exd4 7. Nxd4 c5 1-0`;

    expect(findMalformedMoveTokens(pgn)).toEqual([]);
  });

  it("acepta lo que un movetext lleva además de las jugadas", () => {
    const pgn = `[Result "*"]

1. e4 {Avance central [%cal Ge2e4]} e5 $1 2. Nf3 (2. Nc3 Nf6) 2... Nc6!? 3. Bb5+ a6
4. O-O-O b5 5. e8=Q+ Kxe8 ; un comentario de línea
*`;

    expect(findMalformedMoveTokens(pgn)).toEqual([]);
  });

  it("caza el token que ni siquiera tiene forma de jugada", () => {
    // The case from point 11b: chessops discards it before validating it, so
    // without this the branch disappeared from the tree without a word.
    expect(findMalformedMoveTokens("1. e4 e5 2. Qz9")).toEqual(["Qz9"]);
    expect(findMalformedMoveTokens("1. e4 Bx99 2. Nf3")).toEqual(["Bx99"]);
  });

  it("avisa una vez por errata, aunque se repita", () => {
    expect(findMalformedMoveTokens("1. e4 Qz9 2. Nf3 Qz9")).toEqual(["Qz9"]);
  });

  it("distingue las desambiguaciones y las coronaciones de una errata", () => {
    expect(findMalformedMoveTokens("1. Nbd2 Ncxd4 2. R1e2 axb8=N#")).toEqual([]);
  });

  it("tolera la jugada nula de los módulos", () => {
    expect(findMalformedMoveTokens("1. e4 -- 2. Nf3")).toEqual([]);
  });

  it("no mira dentro de los comentarios, donde cabe cualquier cosa", () => {
    expect(findMalformedMoveTokens("1. e4 {Qz9 es imposible} e5")).toEqual([]);
  });
});
