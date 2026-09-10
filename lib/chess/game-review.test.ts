import { describe, expect, it } from "vitest";
import { moveAccuracy, reviewGame, winPercent, type ReviewedPosition } from "./game-review";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
/** A rook endgame: non-pawn material well below the cutoff. */
const ENDGAME = "4k3/8/8/8/8/8/4P3/R3K3 w - - 0 40";

/** Positions with the given evaluation, all with the same FEN unless stated. */
function positions(scores: number[], fen = START): ReviewedPosition[] {
  return scores.map((score) => ({ fen, evaluation: { score, mateIn: null } }));
}

describe("winPercent", () => {
  it("una posición igualada es la mitad", () => {
    expect(winPercent(0)).toBe(50);
  });

  it("crece con la ventaja de las blancas y se satura", () => {
    expect(winPercent(1)).toBeGreaterThan(winPercent(0));
    expect(winPercent(9)).toBeGreaterThan(winPercent(3));
    // Between +9 and +30 there is hardly any difference: the game is won either way.
    expect(winPercent(30) - winPercent(9)).toBeLessThan(5);
  });

  it("es simétrica", () => {
    expect(winPercent(-2)).toBeCloseTo(100 - winPercent(2), 6);
  });
});

describe("moveAccuracy", () => {
  it("no perder nada es jugar perfecto", () => {
    // Lichess's formula gives 99.9999 at its ceiling: that is a hundred per cent.
    expect(moveAccuracy(0)).toBeCloseTo(100, 3);
  });

  it("cuanto más se pierde, menos precisión", () => {
    expect(moveAccuracy(10)).toBeLessThan(moveAccuracy(2));
    expect(moveAccuracy(50)).toBeLessThan(moveAccuracy(10));
    expect(moveAccuracy(200)).toBe(0);
  });
});

describe("reviewGame", () => {
  it("mide cada jugada desde el punto de vista de quien la hizo", () => {
    // 1. e4 (White improves a little) 1... ?? (the position goes to +5: for
    // Black that is collapsing, even though the number goes up).
    const review = reviewGame(positions([0.2, 0.3, 5]))!;

    expect(review.moves).toHaveLength(2);
    expect(review.moves[0]).toMatchObject({ ply: 1, color: "white", quality: "good" });
    expect(review.moves[1]).toMatchObject({ ply: 2, color: "black", quality: "blunder" });
    // White lost nothing: their position improved.
    expect(review.moves[0].centipawnLoss).toBe(0);
    expect(review.moves[1].centipawnLoss).toBe(470);
  });

  it("reparte los errores entre los dos jugadores", () => {
    // White drops a serious mistake — from +0.2 to −5 is a 38-point fall — and
    // Black gives part of it back with an inaccuracy.
    const review = reviewGame(positions([0.2, -5, -4, -5.5]))!;

    expect(review.white.blunders).toBe(1);
    expect(review.white.mistakes).toBe(0);
    expect(review.black.blunders).toBe(0);
    expect(review.black.mistakes).toBe(0);
    expect(review.white.accuracy).toBeLessThan(review.black.accuracy);
  });

  it("una partida sin fallos ronda el cien por cien", () => {
    const review = reviewGame(positions([0.2, 0.22, 0.2, 0.21, 0.2]))!;

    expect(review.white.accuracy).toBeGreaterThan(95);
    expect(review.black.accuracy).toBeGreaterThan(95);
    expect(review.white.averageLoss).toBeLessThan(5);
  });

  it("salta las jugadas que no tienen evaluación en vez de inventarlas", () => {
    const partial: ReviewedPosition[] = [
      { fen: START, evaluation: { score: 0, mateIn: null } },
      { fen: START },
      { fen: START, evaluation: { score: 0, mateIn: null } },
    ];

    expect(reviewGame(partial)).toBeNull();
  });

  it("sin ninguna jugada evaluada no devuelve nada", () => {
    expect(reviewGame([{ fen: START }])).toBeNull();
  });

  it("reconoce el final por el material que queda", () => {
    const middle = positions([0.1, 0.1, 0.1]);
    const end = positions([0.1, 0.1], ENDGAME);
    const review = reviewGame([...middle, ...end])!;

    expect(review.phases.endgame).toBe(3);
    // The middlegame cannot start after the endgame.
    expect(review.phases.middlegame).toBeLessThanOrEqual(review.phases.endgame);
  });
});
