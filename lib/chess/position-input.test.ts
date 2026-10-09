import { describe, expect, it } from "vitest";
import { isOpenablePgn, pgnOfFen, readPositionInput } from "./position-input";

const LUCENA = "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1";

describe("pgnOfFen", () => {
  it("opens a position that can exist as a game with no moves", () => {
    expect(pgnOfFen(LUCENA)).toContain(`[FEN "${LUCENA}"]`);
  });

  it("refuses a board without kings, a broken FEN and one too long", () => {
    expect(pgnOfFen("8/8/8/8/8/8/8/8 w - - 0 1")).toBeNull();
    expect(pgnOfFen("not a fen")).toBeNull();
    expect(pgnOfFen(`${LUCENA} ${"x".repeat(200)}`)).toBeNull();
  });
});

describe("isOpenablePgn", () => {
  it("opens a game with moves or a starting position, not free text", () => {
    expect(isOpenablePgn("1. e4 e5 2. Nf3 *")).toBe(true);
    expect(isOpenablePgn(`[FEN "${LUCENA}"]\n[SetUp "1"]\n\n*`)).toBe(true);
    expect(isOpenablePgn("hola")).toBe(false);
  });
});

describe("readPositionInput", () => {
  it("prefers the PGN when both fields have text", () => {
    expect(readPositionInput({ fen: LUCENA, pgn: "1. d4 *" })).toEqual({ ok: true, pgn: "1. d4 *" });
  });

  it("names the field that failed", () => {
    expect(readPositionInput({ fen: "", pgn: "hola" })).toMatchObject({ ok: false, field: "pgn" });
    expect(readPositionInput({ fen: "8/8/8", pgn: "" })).toMatchObject({ ok: false, field: "fen" });
    expect(readPositionInput({ fen: " ", pgn: "" })).toMatchObject({ ok: false, field: null });
  });
});
