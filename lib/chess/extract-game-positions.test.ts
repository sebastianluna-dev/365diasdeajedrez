import { describe, expect, it } from "vitest";

import { extractGamePositions } from "@/lib/chess/extract-game-positions";

describe("extractGamePositions", () => {
  it("devuelve una posición por ply, empezando por la inicial", () => {
    const { positions, warnings } = extractGamePositions("1. e4 e5 2. Nf3 Nc6 *");

    // 4 moves → 5 positions: the initial one plus one per half-move.
    expect(positions).toHaveLength(5);
    expect(positions.map((position) => position.ply)).toEqual([0, 1, 2, 3, 4]);
    expect(warnings).toEqual([]);
  });

  it("guarda en cada posición la jugada que se hizo desde ella, en SAN y UCI", () => {
    const { positions } = extractGamePositions("1. e4 e5 *");

    expect(positions[0]).toMatchObject({ nextMoveSan: "e4", nextMoveUci: "e2e4" });
    expect(positions[1]).toMatchObject({ nextMoveSan: "e5", nextMoveUci: "e7e5" });
  });

  it("deja sin continuación la última posición", () => {
    const { positions } = extractGamePositions("1. e4 e5 *");
    const last = positions[positions.length - 1];

    expect(last).toMatchObject({ ply: 2, nextMoveSan: null, nextMoveUci: null });
  });

  it("da el mismo hash a dos partidas que transponen", () => {
    // Same destination through different move orders: it is exactly what the
    // search by position has to recognise and the search by sequence does not.
    const directOrder = extractGamePositions("1. d4 Nf6 2. c4 e6 *").positions;
    const transposed = extractGamePositions("1. c4 Nf6 2. d4 e6 *").positions;

    expect(directOrder[4].positionHash).toBe(transposed[4].positionHash);
  });

  it("reconoce una posición repetida dentro de la misma partida", () => {
    // Knights out and back: ply 4 returns the board to the initial position.
    const { positions } = extractGamePositions("1. Nf3 Nf6 2. Ng1 Ng8 *");

    expect(positions[4].positionHash).toBe(positions[0].positionHash);
    // Two different rows, not one: each visit could have continued differently.
    expect(positions[4].ply).not.toBe(positions[0].ply);
  });

  it("indexa hasta donde se puede reproducir y avisa si el PGN trae una jugada ilegal", () => {
    const { positions, warnings } = extractGamePositions("1. e4 e5 2. Nf6 *");

    expect(positions).toHaveLength(3);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Nf6");
  });

  it("no lanza con un PGN vacío", () => {
    const { positions } = extractGamePositions("");

    expect(positions).toHaveLength(1);
    expect(positions[0]).toMatchObject({ ply: 0, nextMoveSan: null });
  });
});
