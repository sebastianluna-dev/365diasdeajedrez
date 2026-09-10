import { describe, expect, it } from "vitest";

import { createPositionHash, normalizePositionFen } from "@/lib/chess/position-hash";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("normalizePositionFen", () => {
  it("se queda con piezas, turno, enroques y al paso", () => {
    expect(normalizePositionFen(START)).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -");
  });

  it("tolera un FEN de cuatro campos y espacios de sobra", () => {
    expect(normalizePositionFen("  8/8/8/8/8/8/8/K6k   w  -  -  ")).toBe("8/8/8/8/8/8/8/K6k w - -");
  });
});

describe("createPositionHash", () => {
  it("ignora el reloj de medias jugadas y el número de jugada", () => {
    // The same position reached by paths of different lengths: the clocks tell the
    // history of the game, not the position.
    const early = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const late = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 12 30";

    expect(createPositionHash(early)).toBe(createPositionHash(late));
  });

  it("distingue el turno", () => {
    const white = "8/8/8/4k3/8/8/4P3/4K3 w - - 0 1";
    const black = "8/8/8/4k3/8/8/4P3/4K3 b - - 0 1";

    expect(createPositionHash(white)).not.toBe(createPositionHash(black));
  });

  it("distingue los derechos de enroque", () => {
    const withRights = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
    const withoutRights = "r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1";

    expect(createPositionHash(withRights)).not.toBe(createPositionHash(withoutRights));
  });

  it("distingue la casilla al paso", () => {
    const withEnPassant = "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2";
    const withoutEnPassant = "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

    expect(createPositionHash(withEnPassant)).not.toBe(createPositionHash(withoutEnPassant));
  });

  it("es determinista y devuelve sha-256 en hexadecimal", () => {
    const hash = createPositionHash(START);

    expect(hash).toBe(createPositionHash(START));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
