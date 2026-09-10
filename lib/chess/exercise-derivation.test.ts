import { describe, expect, it } from "vitest";
import { deriveExerciseData, mainlinePath, positionAfter } from "./exercise-derivation";
import { makeFen } from "chessops/fen";

// The base cases are the REAL exercises of the seed (prisma/seed-data.ts): they
// are the ones already in the database and in the trainer, so they act as a net
// against any drift when sharing this derivation with the staff editor.

const NAJDORF_LINE = {
  initialFen: null,
  afterSans: ["e4"],
  lineSans: ["c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
};

const POISONED_PAWN = {
  initialFen: null,
  afterSans: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6", "Bg5", "e6", "f4", "Qb6", "Qd2"],
  lineSans: ["Qxb2"],
};

const LUCENA = {
  initialFen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
  afterSans: [],
  lineSans: ["Rd1+", "Ke7", "Rd4", "Ra1", "Kc7", "Rc1+", "Kb6", "Rb1+", "Kc6", "Rc1+", "Kb5", "Rb1+", "Rb4"],
};

describe("mainlinePath", () => {
  it("es una ruta de ceros con un nivel por ply", () => {
    expect(mainlinePath(1)).toBe("0");
    expect(mainlinePath(3)).toBe("0.0.0");
    expect(mainlinePath(16)).toBe(Array.from({ length: 16 }, () => "0").join("."));
  });

  it("devuelve cadena vacía en el ply 0 (la posición inicial es la raíz)", () => {
    expect(mainlinePath(0)).toBe("");
  });
});

describe("positionAfter", () => {
  it("parte de la posición inicial cuando no hay FEN", () => {
    expect(makeFen(positionAfter(null, []).toSetup())).toBe(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    );
  });

  it("parte del FEN dado cuando lo hay", () => {
    expect(makeFen(positionAfter(LUCENA.initialFen, []).toSetup())).toBe(LUCENA.initialFen);
  });

  it("señala la jugada ilegal y su posición dentro de la secuencia", () => {
    expect(() => positionAfter(null, ["e4", "e5", "Qh9"])).toThrow(/"Qh9"/);
    expect(() => positionAfter(null, ["e4", "e5", "Qh9"])).toThrow(/posición 3 de/);
    // Legal in notation but not in this position: it also has to fail.
    expect(() => positionAfter(null, ["e4", "e5", "Nf6"])).toThrow(/"Nf6"/);
  });
});

describe("deriveExerciseData", () => {
  it("deriva el ejercicio de la Najdorf igual que el seed", () => {
    const derived = deriveExerciseData(NAJDORF_LINE);

    expect(derived.startPly).toBe(2);
    expect(derived.endPly).toBe(10);
    expect(derived.path).toBe("0.0");
    expect(derived.line).toBe("c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6");
    // The frozen position is the one after 1.e4.
    expect(derived.startFen).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
  });

  it("deriva el peón envenenado (15 jugadas previas, línea de una)", () => {
    const derived = deriveExerciseData(POISONED_PAWN);

    expect(derived.startPly).toBe(16);
    expect(derived.endPly).toBe(16);
    expect(derived.path).toBe(mainlinePath(16));
    expect(derived.line).toBe("Qxb2");
    expect(derived.startFen).toContain(" b ");
  });

  it("respeta el FEN inicial de la lección (final de Lucena)", () => {
    const derived = deriveExerciseData(LUCENA);

    expect(derived.startFen).toBe(LUCENA.initialFen);
    expect(derived.startPly).toBe(1);
    expect(derived.path).toBe("0");
    expect(derived.endPly).toBe(13);
  });

  it("valida también la línea, no sólo las jugadas previas", () => {
    expect(() => deriveExerciseData({ initialFen: null, afterSans: ["e4"], lineSans: ["c5", "Ke2", "Qh4"] })).toThrow(
      /"Qh4"/,
    );
  });

  it("startPly y endPly coinciden cuando la línea es de una sola jugada", () => {
    const derived = deriveExerciseData({ initialFen: null, afterSans: ["e4", "e5"], lineSans: ["Nf3"] });
    expect(derived.startPly).toBe(3);
    expect(derived.endPly).toBe(3);
  });
});
