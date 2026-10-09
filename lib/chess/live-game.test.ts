import { describe, expect, it } from "vitest";
import { currentFen, playSan, sideToMove, toPgn, uciMoves } from "./live-game";

describe("playSan", () => {
  it("adds a legal move in its canonical form, and refuses an illegal one", () => {
    expect(playSan({ initialFen: null, sans: ["e4"] }, "e5")).toEqual({ initialFen: null, sans: ["e4", "e5"] });
    expect(playSan({ initialFen: null, sans: [] }, "e5")).toBeNull();
    const promotion = playSan({ initialFen: "8/4P3/8/8/8/8/k7/4K3 w - - 0 1", sans: [] }, "e8=Q");
    expect(promotion?.sans).toEqual(["e8=Q"]);
  });
});

describe("the position after the moves", () => {
  it("knows the FEN and whose move it is", () => {
    const game = { initialFen: null, sans: ["e4"] };
    expect(currentFen(game)).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    expect(sideToMove(game)).toBe("black");
    expect(sideToMove({ initialFen: "8/8/8/4k3/8/8/8/R3K3 b - - 0 1", sans: [] })).toBe("black");
  });
});

describe("uciMoves", () => {
  it("writes castling the way the engine expects it, the king two squares", () => {
    const moves = uciMoves({ initialFen: null, sans: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "O-O"] });
    expect(moves).toEqual(["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "e1g1"]);
  });

  it("writes a promotion with its piece", () => {
    expect(uciMoves({ initialFen: "8/4P3/8/8/8/8/k7/4K3 w - - 0 1", sans: ["e8=N"] })).toEqual(["e7e8n"]);
  });
});

describe("toPgn", () => {
  it("writes the headers in their order, then the set-up, then the moves and the result", () => {
    const pgn = toPgn(
      { initialFen: "8/4P3/8/8/8/8/k7/4K3 w - - 0 1", sans: ["e8=Q"] },
      { White: "Ana Torres", Black: "Don Chuy", Result: "*" },
    );
    expect(pgn).toContain(
      '[White "Ana Torres"]\n[Black "Don Chuy"]\n[Result "*"]\n[SetUp "1"]\n[FEN "8/4P3/8/8/8/8/k7/4K3 w - - 0 1"]',
    );
    expect(pgn).toContain("1. e8=Q *");
  });
});
