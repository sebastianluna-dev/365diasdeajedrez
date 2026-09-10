import { describe, expect, it } from "vitest";
import { parseFenPlacement } from "./parse-fen-placement";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("parseFenPlacement", () => {
  it("devuelve 64 casillas de a8 a h1 y sólo mira la colocación", () => {
    const squares = parseFenPlacement(START);
    expect(squares).toHaveLength(64);
    expect(squares[0]).toBe("b-rook"); // a8
    expect(squares[4]).toBe("b-king"); // e8
    expect(squares[60]).toBe("w-king"); // e1
    expect(squares[63]).toBe("w-rook"); // h1
  });

  it("expande los números como casillas vacías", () => {
    const squares = parseFenPlacement("8/8/8/8/8/8/8/8");
    expect(squares).toHaveLength(64);
    expect(squares.every((square) => square === null)).toBe(true);
    expect(parseFenPlacement("4k3/8/8/8/8/8/8/4K3 w - - 0 1")[4]).toBe("b-king");
  });
});
