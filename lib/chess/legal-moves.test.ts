import { describe, expect, it } from "vitest";
import { legalDests, legalUciMoves, positionOutcome } from "./legal-moves";

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

describe("positionOutcome", () => {
  it("una posición con jugadas no ha terminado", () => {
    expect(positionOutcome(START)).toBeNull();
    // In check, but the king can step aside.
    expect(positionOutcome("4r2k/8/8/8/8/8/8/4K3 w - - 0 1")).toBeNull();
  });

  it("sin jugadas y en jaque es mate", () => {
    // 1. f3 e5 2. g4 Qh4#: White to move and nothing saves the king.
    expect(positionOutcome("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3")).toBe("checkmate");
  });

  it("sin jugadas y sin jaque es ahogado", () => {
    expect(positionOutcome("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1")).toBe("stalemate");
  });

  it("con material insuficiente todavía se juega: no es una posición terminada", () => {
    // Two bare kings is a draw by rule, but there are moves and the engine still answers.
    expect(positionOutcome("8/8/4k3/8/8/4K3/8/8 w - - 0 1")).toBeNull();
  });

  it("un FEN inválido no dice nada", () => {
    expect(positionOutcome("esto no es un fen")).toBeNull();
  });
});

describe("legalUciMoves", () => {
  it("lists every promotion of a pawn on the seventh rank", () => {
    const moves = legalUciMoves("8/4P3/8/8/8/8/k7/4K3 w - - 0 1");
    expect(moves).toEqual(expect.arrayContaining(["e7e8q", "e7e8r", "e7e8b", "e7e8n"]));
    expect(moves).not.toContain("e7e8");
  });

  it("writes castling as the king's two squares, never onto its rook", () => {
    const moves = legalUciMoves("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    expect(moves).toEqual(expect.arrayContaining(["e1g1", "e1c1"]));
    expect(moves).not.toContain("e1h1");
    expect(moves).not.toContain("e1a1");
  });

  it("is twenty moves at the start, and none for an invalid FEN", () => {
    expect(legalUciMoves("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")).toHaveLength(20);
    expect(legalUciMoves("not a fen")).toEqual([]);
  });
});
