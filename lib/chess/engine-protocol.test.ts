import { describe, expect, it } from "vitest";
import {
  evaluationBarFill,
  formatEngineLine,
  formatEvaluation,
  mergeEngineLines,
  orderedEngineLines,
  parseEngineInfo,
  type EngineLines,
} from "./engine-protocol";

describe("parseEngineInfo", () => {
  const LINE = "info depth 18 seldepth 24 multipv 1 score cp 34 nodes 120000 nps 900000 pv e2e4 e7e5 g1f3";

  it("lee profundidad, puntuación y línea principal", () => {
    const info = parseEngineInfo(LINE, "white")!;
    expect(info.depth).toBe(18);
    expect(info.score).toBeCloseTo(0.34);
    expect(info.mateIn).toBeNull();
    expect(info.pv).toEqual(["e2e4", "e7e5", "g1f3"]);
  });

  it("normaliza la puntuación al punto de vista de las blancas", () => {
    // The engine scores in favour of whoever moves: with Black to move, a +34 of
    // its own is 0.34 IN BLACK'S FAVOUR.
    expect(parseEngineInfo(LINE, "black")!.score).toBeCloseTo(-0.34);
  });

  it("entiende el mate y le conserva el bando", () => {
    const white = parseEngineInfo("info depth 12 score mate 3 pv e2e4", "white")!;
    expect(white.mateIn).toBe(3);
    expect(white.score).toBeGreaterThan(50);

    // The same mate announced with Black to move is Black giving it.
    const black = parseEngineInfo("info depth 12 score mate 3 pv e2e4", "black")!;
    expect(black.mateIn).toBe(-3);
    expect(black.score).toBeLessThan(-50);
  });

  it("descarta las líneas que no traen evaluación", () => {
    expect(parseEngineInfo("info depth 1 currmove e2e4 currmovenumber 1", "white")).toBeNull();
    expect(parseEngineInfo("info string NNUE evaluation using nn-x.nnue", "white")).toBeNull();
    expect(parseEngineInfo("bestmove e2e4 ponder e7e5", "white")).toBeNull();
    expect(parseEngineInfo("readyok", "white")).toBeNull();
  });

  it("no se traga basura en la línea principal", () => {
    const info = parseEngineInfo("info depth 5 score cp 10 pv e2e4 hmm 0000 g1f3", "white")!;
    expect(info.pv).toEqual(["e2e4", "g1f3"]);
  });

  it("acepta la coronación en la línea principal", () => {
    expect(parseEngineInfo("info depth 5 score cp 10 pv a7a8q", "white")!.pv).toEqual(["a7a8q"]);
  });
});

describe("evaluationBarFill", () => {
  it("reparte a la mitad cuando está igualada", () => {
    expect(evaluationBarFill(0)).toBeCloseTo(0.5);
  });

  it("se mueve mucho donde la ventaja se discute y poco donde ya está decidida", () => {
    const small = evaluationBarFill(1) - evaluationBarFill(0.3);
    const large = evaluationBarFill(9) - evaluationBarFill(8.3);
    expect(small).toBeGreaterThan(large * 5);
  });

  it("no se sale de sus límites", () => {
    expect(evaluationBarFill(-100)).toBeGreaterThanOrEqual(0);
    expect(evaluationBarFill(100)).toBeLessThanOrEqual(1);
  });
});

describe("formatEvaluation", () => {
  const base = { multipv: 1, depth: 10, pv: [] };

  it("escribe la ventaja con su signo", () => {
    expect(formatEvaluation({ ...base, score: 1.44, mateIn: null })).toBe("+1.4");
    expect(formatEvaluation({ ...base, score: -0.7, mateIn: null })).toBe("−0.7");
    expect(formatEvaluation({ ...base, score: 0, mateIn: null })).toBe("0.0");
  });

  it("el mate manda sobre la puntuación", () => {
    expect(formatEvaluation({ ...base, score: 100, mateIn: 3 })).toBe("+M3");
    expect(formatEvaluation({ ...base, score: -100, mateIn: -2 })).toBe("−M2");
  });
});

describe("parseEngineInfo con varias líneas", () => {
  it("lee de qué línea de las pedidas se trata", () => {
    const second = "info depth 14 multipv 2 score cp -12 pv d2d4 g8f6";
    expect(parseEngineInfo(second, "white")!.multipv).toBe(2);
  });

  it("asume la primera cuando el motor no la numera", () => {
    // With MultiPV at 1, Stockfish omits the field.
    expect(parseEngineInfo("info depth 9 score cp 20 pv e2e4", "white")!.multipv).toBe(1);
  });

  it("descarta una numeración imposible", () => {
    expect(parseEngineInfo("info depth 9 multipv 0 score cp 20 pv e2e4", "white")).toBeNull();
    expect(parseEngineInfo("info depth 9 multipv x score cp 20 pv e2e4", "white")).toBeNull();
  });
});

describe("formatEngineLine", () => {
  const AFTER_1_E4 = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
  const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("numera desde donde está el tablero, no desde la primera jugada", () => {
    const middlegame = "8/8/4k3/8/8/4K3/8/8 w - - 0 30";
    expect(formatEngineLine(middlegame, ["Kd4", "Kd6", "Kc4"])).toBe("30. Kd4 Kd6 31. Kc4");
  });

  it("marca con puntos suspensivos cuando arranca en negras", () => {
    expect(formatEngineLine(AFTER_1_E4, ["e5", "Nf3", "Nc6"])).toBe("1… e5 2. Nf3 Nc6");
  });

  it("empieza en las blancas sin puntos suspensivos", () => {
    expect(formatEngineLine(START, ["e4", "e5"])).toBe("1. e4 e5");
  });

  it("con una línea vacía no escribe nada", () => {
    expect(formatEngineLine(START, [])).toBe("");
  });

  it("aguanta un FEN sin número de jugada", () => {
    expect(formatEngineLine("8/8/4k3/8/8/4K3/8/8 w - -", ["Kd4"])).toBe("1. Kd4");
  });
});

describe("acumular las tres líneas", () => {
  const FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const OTHER = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
  const info = (multipv: number, depth: number, score: number) => ({
    multipv,
    depth,
    score,
    mateIn: null,
    pv: ["e2e4"],
  });

  /** As they really arrive: one line per message, in order, for each depth. */
  function feed(fen: string, infos: ReturnType<typeof info>[]): EngineLines | null {
    return infos.reduce<EngineLines | null>((acc, next) => mergeEngineLines(acc, fen, next), null);
  }

  it("junta las tres continuaciones de una misma profundidad", () => {
    const state = feed(FEN, [info(1, 12, 0.3), info(2, 12, 0.1), info(3, 12, -0.2)]);
    expect(orderedEngineLines(state, FEN).map((l) => l.score)).toEqual([0.3, 0.1, -0.2]);
  });

  it("las devuelve por número de línea aunque lleguen desordenadas", () => {
    const state = feed(FEN, [info(3, 12, -0.2), info(1, 12, 0.3), info(2, 12, 0.1)]);
    expect(orderedEngineLines(state, FEN).map((l) => l.multipv)).toEqual([1, 2, 3]);
  });

  it("cada línea se actualiza sola sin pisar a las otras", () => {
    // Depth 13 has only emitted the first one so far.
    const state = feed(FEN, [info(1, 12, 0.3), info(2, 12, 0.1), info(3, 12, -0.2), info(1, 13, 0.5)]);
    const lines = orderedEngineLines(state, FEN);
    expect(lines.map((l) => l.depth)).toEqual([13, 12, 12]);
    expect(lines[0]?.score).toBe(0.5);
  });

  it("cambiar de posición tira lo anterior en vez de mezclarlo", () => {
    const previous = feed(FEN, [info(1, 12, 0.3), info(2, 12, 0.1), info(3, 12, -0.2)]);
    const next = mergeEngineLines(previous, OTHER, info(1, 8, -0.4));

    expect(orderedEngineLines(next, OTHER)).toHaveLength(1);
    // And the old one stops being available under its own FEN.
    expect(orderedEngineLines(next, FEN)).toEqual([]);
  });

  it("sin nada acumulado no devuelve líneas", () => {
    expect(orderedEngineLines(null, FEN)).toEqual([]);
  });

  it("una posición con menos continuaciones que las pedidas no inventa las que faltan", () => {
    // In a forced mate the engine may give only one.
    const state = feed(FEN, [info(1, 20, 100)]);
    expect(orderedEngineLines(state, FEN)).toHaveLength(1);
  });
});
