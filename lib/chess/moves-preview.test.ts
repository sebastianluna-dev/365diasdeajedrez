import { describe, expect, it } from "vitest";
import { movesPreview } from "./moves-preview";

const SICILIAN = "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bc4 e6 7. Bb3 b5 8. O-O Be7 *";

describe("movesPreview", () => {
  it("shows the first six moves, numbered and in Spanish, and says the game goes on", () => {
    expect(movesPreview(SICILIAN)).toBe("1.e4 c5 2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3 a6 6.Ac4 e6 …");
  });

  it("does not add the ellipsis to a game that fits whole", () => {
    expect(movesPreview("1. e4 e5 2. Qh5 Ke7 3. Qxe5# 1-0")).toBe("1.e4 e5 2.Dh5 Re7 3.Dxe5#");
  });

  it("shows as many moves as it is asked for", () => {
    expect(movesPreview(SICILIAN, 2)).toBe("1.e4 c5 2.Cf3 d6 …");
  });

  it("reads only the main line: neither the variations nor the comments", () => {
    expect(movesPreview("1. e4 { El peón de rey. } c5 (1... e5 2. Nf3) 2. Nf3 *")).toBe("1.e4 c5 2.Cf3");
  });

  it("numbers from the starting position, and opens with Black's move when it is Black's", () => {
    const pgn = `[FEN "r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R b KQkq - 4 12"]\n[SetUp "1"]\n\n12... Bb4 13. Nd5 Nxd5 *`;
    expect(movesPreview(pgn)).toBe("12…Ab4 13.Cd5 Cxd5");
  });

  it("answers nothing for a diagram without moves or for a text that is not a game", () => {
    expect(movesPreview(`[FEN "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1"]\n[SetUp "1"]\n\n*`)).toBeUndefined();
    expect(movesPreview("")).toBeUndefined();
  });
});
