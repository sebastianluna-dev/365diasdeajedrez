import { describe, expect, it } from "vitest";
import { extractMainline } from "./mainline";

describe("extractMainline", () => {
  it("sigue la línea principal e ignora las variantes", () => {
    // El ejemplo del documento: dos variantes que NO deben entrenarse.
    const pgn = "1. e4 c6 2. d4 d5 3. e5 ( 3. exd5 cxd5 4. Bd3 ) 3... Bf5 4. Nf3 e6 5. Be2 ( 5. Bd3 Bxd3 ) *";

    const result = extractMainline(pgn)!;

    expect(result.sans).toEqual(["e4", "c6", "d4", "d5", "e5", "Bf5", "Nf3", "e6", "Be2"]);
    expect(result.initialFen).toBeNull();
  });

  it("no se mete en las subvariantes", () => {
    const pgn = "1. e4 e5 ( 1... c5 2. Nf3 ( 2. Nc3 d6 ) 2... d6 ) 2. Nf3 *";
    expect(extractMainline(pgn)!.sans).toEqual(["e4", "e5", "Nf3"]);
  });

  it("conserva el FEN de partida cuando la lección arranca de un diagrama", () => {
    const fen = "3b1kn1/6p1/3q1p2/4pPP1/pP2P1N1/3P1NQ1/1rr5/5RRK w - - 0 48";
    const result = extractMainline(`[FEN "${fen}"]\n[SetUp "1"]\n\n48. gxf6 Bxf6 49. Qh3 *`)!;

    expect(result.sans).toEqual(["gxf6", "Bxf6", "Qh3"]);
    expect(result.initialFen).toBe(fen);
  });

  it("devuelve null si no hay nada entrenable", () => {
    // Un diagrama suelto: sin jugadas no hay línea que memorizar.
    expect(extractMainline('[FEN "4k3/8/8/8/8/8/8/4K3 w - - 0 1"]\n*')).toBeNull();
    expect(extractMainline("*")).toBeNull();
    expect(extractMainline("")).toBeNull();
  });

  it("descarta una rama con jugadas ilegales sin romperse", () => {
    // parsePgnTree corta la rama mala y avisa; la línea principal sobrevive.
    const result = extractMainline("1. e4 e5 ( 1... Nf3 ) 2. Nf3 *")!;
    expect(result.sans).toEqual(["e4", "e5", "Nf3"]);
  });
});
