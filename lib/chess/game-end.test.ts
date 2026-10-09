import { describe, expect, it } from "vitest";
import { closedEnd, gameEnd, resignationEnd } from "./game-end";

describe("gameEnd", () => {
  it("reads the fool's mate as Black's win by checkmate", () => {
    expect(gameEnd(null, ["f3", "e5", "g4", "Qh4#"])).toEqual({
      kind: "checkmate",
      winner: "black",
      resultCode: "BLACK_WINS",
      terminationCode: "CHECKMATE",
    });
  });

  it("is null while the game goes on", () => {
    expect(gameEnd(null, [])).toBeNull();
    expect(gameEnd(null, ["e4", "e5", "Nf3"])).toBeNull();
  });

  it("draws a stalemate", () => {
    expect(gameEnd("k7/8/8/2Q5/8/8/8/7K w - - 0 1", ["Qb6"])).toMatchObject({
      kind: "stalemate",
      winner: null,
      resultCode: "DRAW",
      terminationCode: "STALEMATE",
    });
  });

  it("draws bare kings", () => {
    expect(gameEnd("8/8/8/4k3/8/8/3n4/4K3 w - - 0 1", ["Kxd2"])).toMatchObject({
      kind: "insufficient-material",
      terminationCode: "INSUFFICIENT_MATERIAL",
    });
  });

  it("draws the third time a position comes back, not the second", () => {
    const twice = ["Nf3", "Nf6", "Ng1", "Ng8"];
    expect(gameEnd(null, twice)).toBeNull();
    expect(gameEnd(null, [...twice, ...twice])).toMatchObject({
      kind: "threefold",
      terminationCode: "THREEFOLD_REPETITION",
    });
  });

  it("draws after fifty moves without a capture or a pawn move", () => {
    expect(gameEnd("8/8/8/4k3/8/8/8/R3K3 w - - 100 80", [])).toMatchObject({ kind: "fifty-moves" });
    expect(gameEnd("8/8/8/4k3/8/8/8/R3K3 w - - 99 80", ["Ra2"])).toMatchObject({ kind: "fifty-moves" });
    expect(gameEnd("8/8/8/4k3/8/8/8/R3K3 w - - 98 80", ["Ra2"])).toBeNull();
  });

  it("lets a mate stand on the fiftieth move", () => {
    expect(gameEnd("7k/8/6K1/8/8/8/8/R7 w - - 99 80", ["Ra8#"])).toMatchObject({ kind: "checkmate", winner: "white" });
  });

  it("is null for a record that does not replay", () => {
    expect(gameEnd(null, ["e5"])).toBeNull();
  });
});

describe("the endings a person decides", () => {
  it("gives the game to the other side when one resigns", () => {
    expect(resignationEnd("white")).toEqual({
      kind: "resignation",
      winner: "black",
      resultCode: "BLACK_WINS",
      terminationCode: "RESIGNATION",
    });
  });

  it("loses an abandoned game, and leaves an aborted one without a result", () => {
    expect(closedEnd("abandoned", "black")).toMatchObject({
      winner: "white",
      resultCode: "WHITE_WINS",
      terminationCode: "ABANDONED",
    });
    expect(closedEnd("aborted", null)).toEqual({
      kind: "aborted",
      winner: null,
      resultCode: "ONGOING",
      terminationCode: "ABORTED",
    });
  });
});
