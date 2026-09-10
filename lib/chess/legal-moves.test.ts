import { describe, expect, it } from "vitest";
import { legalDests } from "./legal-moves";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("legalDests", () => {
  it("lista los destinos legales de cada pieza que puede mover", () => {
    const dests = legalDests(START);
    expect(dests.get("e2")).toEqual(expect.arrayContaining(["e3", "e4"]));
    expect(dests.get("g1")).toEqual(expect.arrayContaining(["f3", "h3"]));
    expect(dests.has("e1")).toBe(false); // the king has no free squares
    expect(dests.size).toBe(10); // eight pawns and two knights
  });

  it("en jaque sólo deja las jugadas que lo resuelven", () => {
    // White king on e1 in check from the black rook on e8; nothing else on the board.
    const dests = legalDests("4r2k/8/8/8/8/8/8/4K3 w - - 0 1");
    expect([...dests.keys()]).toEqual(["e1"]);
    expect(dests.get("e1")).not.toContain("e2");
  });

  it("devuelve un mapa vacío ante un FEN inválido", () => {
    expect(legalDests("esto no es un fen").size).toBe(0);
  });
});
