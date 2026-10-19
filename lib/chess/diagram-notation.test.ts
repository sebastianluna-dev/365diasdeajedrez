import { describe, expect, it } from "vitest";
import { readDiagramPgn, writeDiagramPgn, type Diagram } from "./diagram-notation";

const LUCENA: Diagram = {
  fen: "1K1k4/1P6/8/8/2R5/8/r7/8 w - - 0 1",
  orientation: "white",
  caption: "El rey sale por c7.",
  circles: [{ square: "d8", color: "red" }],
  arrows: [
    { from: "b8", to: "c7", color: "green" },
    { from: "c4", to: "b4", color: "blue" },
  ],
};

describe("writeDiagramPgn", () => {
  it("writes the position, the caption and the shapes as PGN", () => {
    expect(writeDiagramPgn(LUCENA)).toBe(
      '[SetUp "1"]\n[FEN "1K1k4/1P6/8/8/2R5/8/r7/8 w - - 0 1"]\n\n{El rey sale por c7. [%csl Rd8] [%cal Gb8c7,Bc4b4]} *',
    );
  });

  it("writes an [Orientation] tag only when the bottom is not the side to move", () => {
    expect(writeDiagramPgn({ ...LUCENA, orientation: "black" })).toContain('[Orientation "black"]');
    expect(writeDiagramPgn(LUCENA)).not.toContain("Orientation");
  });

  it("writes no comment for a bare position", () => {
    expect(writeDiagramPgn({ ...LUCENA, caption: "", circles: [], arrows: [] })).toMatch(/"\]\n\n\*$/);
  });

  it("keeps braces and commands out of the caption", () => {
    expect(writeDiagramPgn({ ...LUCENA, caption: "Mira {esto} [%cal Ga1a2]", circles: [], arrows: [] })).toContain(
      "{Mira esto}",
    );
  });
});

describe("readDiagramPgn", () => {
  it("reads back what it writes", () => {
    expect(readDiagramPgn(writeDiagramPgn(LUCENA))).toEqual(LUCENA);
    expect(readDiagramPgn(writeDiagramPgn({ ...LUCENA, orientation: "black" }))).toEqual({
      ...LUCENA,
      orientation: "black",
    });
  });

  it("turns the board to the side to move", () => {
    expect(readDiagramPgn('[FEN "8/8/8/8/8/8/8/K6k b - - 0 1"] *')?.orientation).toBe("black");
  });

  it("drops a shape it cannot draw, and keeps the rest", () => {
    const diagram = readDiagramPgn('[FEN "8/8/8/8/8/8/8/K6k w - - 0 1"] {[%csl Xd4,Gz9,Re4] [%cal Ga1a1,Rb1b2]} *');
    expect(diagram?.circles).toEqual([{ square: "e4", color: "red" }]);
    expect(diagram?.arrows).toEqual([{ from: "b1", to: "b2", color: "red" }]);
  });

  it("is null without a valid position", () => {
    expect(readDiagramPgn("{Sin posición} *")).toBeNull();
    expect(readDiagramPgn('[FEN "esto no es un FEN"] *')).toBeNull();
  });
});
