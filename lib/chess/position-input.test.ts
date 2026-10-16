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

  it("refuses an impossible check and impossible material, like an exercise's start", () => {
    expect(pgnOfFen("4k3/8/8/8/8/3n1n2/8/4K3 w - - 0 1")).toBeNull();
    expect(pgnOfFen("4k3/8/8/P7/8/8/PPPPPPPP/4K3 w - - 0 1")).toBeNull();
  });
});

describe("isOpenablePgn", () => {
  it("opens a game with moves or a starting position, not free text", () => {
    expect(isOpenablePgn("1. e4 e5 2. Nf3 *")).toBe(true);
    expect(isOpenablePgn(`[FEN "${LUCENA}"]\n[SetUp "1"]\n\n*`)).toBe(true);
    expect(isOpenablePgn("hola")).toBe(false);
  });

  it("refuses a broken [FEN] instead of opening the standard start, and another variant", () => {
    expect(isOpenablePgn(`[FEN "P3k3/8/8/8/8/8/8/4K3 w - - 0 1"]\n[SetUp "1"]\n\n1. Kf2 *`)).toBe(false);
    expect(isOpenablePgn(`[Variant "Atomic"]\n\n1. e4 *`)).toBe(false);
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
