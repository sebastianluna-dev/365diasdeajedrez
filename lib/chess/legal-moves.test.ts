import { describe, expect, it } from "vitest";
import { legalDests } from "./legal-moves";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("legalDests", () => {
  it("lista los destinos legales de cada pieza que puede mover", () => {
    const dests = legalDests(START);
    expect(dests.get("e2")).toEqual(expect.arrayContaining(["e3", "e4"]));
    expect(dests.get("g1")).toEqual(expect.arrayContaining(["f3", "h3"]));
    expect(dests.has("e1")).toBe(false); // el rey no tiene casillas libres
    expect(dests.size).toBe(10); // ocho peones y dos caballos
  });

  it("en jaque sólo deja las jugadas que lo resuelven", () => {
    // Rey blanco en e1 con jaque de la torre negra en e8; nada más en el tablero.
    const dests = legalDests("4r2k/8/8/8/8/8/8/4K3 w - - 0 1");
    expect([...dests.keys()]).toEqual(["e1"]);
    expect(dests.get("e1")).not.toContain("e2");
  });

  it("devuelve un mapa vacío ante un FEN inválido", () => {
    expect(legalDests("esto no es un fen").size).toBe(0);
  });
});
