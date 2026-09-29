import { describe, expect, it } from "vitest";
import { gameMoves } from "./game-moves";

const SICILIAN = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bc4 e6 7. Bb3 b5 8. O-O Be7 *";

describe("gameMoves", () => {
  it("gives every move of the game, numbered and in Spanish", () => {
    expect(gameMoves(SICILIAN)?.moves).toBe(
      "1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6 6.Ac4 e6 7.Ab3 b5 8.O-O Ae7",
    );
  });

  it("reads only the main line: neither the variations nor the comments", () => {
    expect(gameMoves("1. e4 { El peón de rey. } c5 (1... e5 2. Nf3) 2. Nf3 *")?.moves).toBe("1.e4 c5 2.Cf3");
  });

  it("numbers from the starting position, and opens with Black's move when it is Black's", () => {
    const pgn = `[FEN "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 4 12"]\n[SetUp "1"]\n\n12... Bb4 13. Nd5 Nxd5 *`;
    expect(gameMoves(pgn)?.moves).toBe("12…Ab4 13.Cd5 Cxd5");
  });

  it("answers nothing for a diagram without moves or for a text that is not a game", () => {
    expect(gameMoves(`[FEN "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1"]\n[SetUp "1"]\n\n*`)).toBeUndefined();
    expect(gameMoves("")).toBeUndefined();
  });
});

describe("the result of the game", () => {
  it("is the one its header says", () => {
    expect(gameMoves(`[Result "0-1"]\n\n1. f3 e5 2. g4 Qh4# 0-1`)?.result).toBe("0-1");
  });

  it("is the mark that closes the moves when there is no header", () => {
    expect(gameMoves("1. e4 e5 2. Qh5 Ke7 3. Qxe5# 1-0")?.result).toBe("1-0");
  });

  it("is written with the half for a draw", () => {
    expect(gameMoves(`[Result "1/2-1/2"]\n\n1. e4 e5 1/2-1/2`)?.result).toBe("½-½");
  });

  it("is absent in a game still in play, or when the header says nothing", () => {
    expect(gameMoves(SICILIAN)?.result).toBeUndefined();
    expect(gameMoves(`[Result "?"]\n\n1. e4 e5 *`)?.result).toBeUndefined();
  });
});
