import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { makeSan } from "chessops/san";
import { makeSquare } from "chessops/util";
import { describe, expect, it } from "vitest";
import type { ExerciseKindCode } from "@/constants/platform/exercise-codes.const";
import {
  outcomeOf,
  playMove,
  readSolution,
  replayAttempt,
  showSolution,
  startSolving,
  takeHint,
  type MoveResult,
  type Solution,
  type SolveState,
} from "./exercise-solver";
import { sanForMove } from "./replay";

// Positions checked with chessops on 2026-10-16.
const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
const PHILIDOR = "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1";
const BLACK_TO_MOVE = "3r2k1/8/8/8/8/8/5PPP/6K1 b - - 0 1";
const TWO_MATES = "6k1/5ppp/8/8/8/8/Q4PPP/1R4K1 w - - 0 1";
const KNIGHT_FORK = "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1";
/** White may castle short: a sequence that starts with it, to test how the move is matched. */
const CASTLING = "6k1/8/8/8/8/8/6PP/4K2R w K - 0 1";
/** A pawn on the seventh: 1. b8=N+ forks king and queen; 1. b8=Q is another move. */
const UNDERPROMOTION = "3q4/1P6/8/2k5/8/8/8/4K3 w - - 0 1";

function solutionOf(
  fen: string,
  moves: string,
  options: { kind?: ExerciseKindCode; mateIn?: number | null; hints?: string[] } = {},
): Solution {
  const solution = readSolution({
    solutionPgn: `[SetUp "1"]\n[FEN "${fen}"]\n\n${moves} *`,
    kind: options.kind ?? "SEQUENCE",
    mateIn: options.mateIn ?? null,
    hints: options.hints ?? [],
  });
  if (!solution) throw new Error(`Unreadable solution: ${moves}`);
  return solution;
}

function play(solution: Solution, state: SolveState, san: string): Extract<MoveResult, { state: SolveState }> {
  const result = playMove(solution, state, san);
  if (result.kind === "illegal") throw new Error(`Illegal: ${san}`);
  return result;
}

/** A move the tree accepts; anything else fails the test. */
function correct(solution: Solution, state: SolveState, san: string): Extract<MoveResult, { kind: "correct" }> {
  const result = playMove(solution, state, san);
  if (result.kind !== "correct") throw new Error(`Not accepted: ${san} (${result.kind})`);
  return result;
}

/** Plays the moves in order, whatever they do, and gives the last state. */
function playAll(solution: Solution, sans: string[], state = startSolving(solution)): SolveState {
  return sans.reduce((current, san) => play(solution, current, san).state, state);
}

describe("readSolution", () => {
  it("no lee una solución sin jugadas ni una ilegible", () => {
    expect(
      readSolution({
        solutionPgn: `[SetUp "1"]\n[FEN "${BACK_RANK}"]\n\n*`,
        kind: "SEQUENCE",
        mateIn: null,
        hints: [],
      }),
    ).toBeNull();
    expect(readSolution({ solutionPgn: "hola", kind: "SEQUENCE", mateIn: null, hints: [] })).toBeNull();
  });
});

describe("mate del pasillo en 1", () => {
  const solution = solutionOf(BACK_RANK, "1. Rd8#");

  it("acepta la jugada sin el signo de mate y termina", () => {
    const result = play(solution, startSolving(solution), "Rd8");

    expect(result).toMatchObject({ kind: "correct", completed: true, reply: null });
    expect(outcomeOf(result.state)).toMatchObject({
      result: "PASSED",
      isPerfect: true,
      review: "clean",
      correctMoves: 1,
      requiredMoves: 1,
      reachedPly: 1,
    });
  });

  it("falla con la primera jugada equivocada y sigue enseñando", () => {
    const wrong = play(solution, startSolving(solution), "Rd7");

    expect(wrong).toMatchObject({ kind: "wrong", isFirst: true });
    expect(wrong.state.failed).toBe(true);
    expect(wrong.state.path).toBe("");
    expect(wrong.state.firstMistake).toEqual({
      ply: 1,
      fen: BACK_RANK,
      playedSan: "Rd7",
      expectedSan: "Rd8#",
      hintShownBefore: false,
    });

    const finished = correct(solution, wrong.state, "Rd8");
    expect(finished.completed).toBe(true);
    expect(outcomeOf(finished.state)).toMatchObject({
      result: "FAILED",
      isPerfect: false,
      review: "failed",
      correctMoves: 0,
      reachedPly: 0,
    });
  });

  it("guarda el SAN esperado canónico aunque el PGN omita el signo de mate", () => {
    const bare = solutionOf(BACK_RANK, "1. Rd8");
    expect(play(bare, startSolving(bare), "Rd2").state.firstMistake?.expectedSan).toBe("Rd8#");
  });

  it("no acepta una jugada que el tablero no puede hacer", () => {
    expect(playMove(solution, startSolving(solution), "Rd9")).toEqual({ kind: "illegal" });
    expect(playMove(solution, startSolving(solution), "Qd8")).toEqual({ kind: "illegal" });
  });
});

describe("mate de la coz de Philidor en 2", () => {
  const solution = solutionOf(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7#", { kind: "MATE_IN", mateIn: 2 });

  it("responde Rxg8 y termina con Cf7", () => {
    const first = play(solution, startSolving(solution), "Qg8+");
    expect(first).toMatchObject({
      kind: "correct",
      playerPath: "0",
      reply: { san: "Rxg8", path: "0.0" },
      completed: false,
    });
    expect(first.state.path).toBe("0.0");

    const second = correct(solution, first.state, "Nf7");
    expect(second.completed).toBe(true);
    expect(outcomeOf(second.state)).toMatchObject({
      result: "PASSED",
      requiredMoves: 2,
      correctMoves: 2,
      reachedPly: 3,
    });
  });

  it("da por mala Cf7+ como primera jugada: no está en el árbol", () => {
    expect(play(solution, startSolving(solution), "Nf7+").kind).toBe("wrong");
  });
});

describe("juegan negras", () => {
  it("el jugador es el negro y la primera jugada es suya", () => {
    const solution = solutionOf(BLACK_TO_MOVE, "1... Rd1#");

    expect(solution.player).toBe("black");
    expect(correct(solution, startSolving(solution), "Rd1").completed).toBe(true);
  });
});

describe("varias jugadas aceptadas (D02)", () => {
  for (const kind of ["SEQUENCE", "MATE_IN"] as const) {
    const options = { kind, mateIn: kind === "MATE_IN" ? 1 : null };

    it(`acepta cada una de las del árbol (${kind})`, () => {
      const both = solutionOf(TWO_MATES, "1. Rb8# ( 1. Qa8# )", options);
      expect(correct(both, startSolving(both), "Rb8").completed).toBe(true);
      expect(correct(both, startSolving(both), "Qa8").completed).toBe(true);
      expect(play(both, startSolving(both), "Rb7").kind).toBe("wrong");
    });

    it(`da por mala una que mata pero no está en el árbol (${kind})`, () => {
      const one = solutionOf(TWO_MATES, "1. Rb8#", options);
      expect(play(one, startSolving(one), "Qa8#").kind).toBe("wrong");
      expect(play(one, startSolving(one), "Rb7").kind).toBe("wrong");
    });
  }
});

describe("variantes del rival (D01)", () => {
  it("responde siempre con la línea principal", () => {
    const solution = solutionOf(KNIGHT_FORK, "1. Nc7+ Kd8 ( 1... Kd7 ) 2. Nxa8");
    const first = correct(solution, startSolving(solution), "Nc7+");

    expect(first.reply?.san).toBe("Kd8");
    expect(correct(solution, first.state, "Nxa8").completed).toBe(true);
  });

  it("sigue la variante del jugador que eligió", () => {
    const solution = solutionOf(KNIGHT_FORK, "1. Nc7+ ( 1. Nd6+ Kd7 2. Nf7 ) Kd8 2. Nxa8");
    const first = play(solution, startSolving(solution), "Nd6+");

    expect(first).toMatchObject({ playerPath: "1", reply: { san: "Kd7", path: "1.0" } });
    expect(correct(solution, first.state, "Nf7").completed).toBe(true);
  });

  it("termina tras la respuesta cuando la línea acaba con la jugada del rival", () => {
    const solution = solutionOf(KNIGHT_FORK, "1. Nc7+ Kd8");
    const result = play(solution, startSolving(solution), "Nc7+");

    expect(result).toMatchObject({ completed: true, reply: { san: "Kd8" } });
    expect(outcomeOf(result.state)).toMatchObject({ result: "PASSED", reachedPly: 2 });
  });
});

describe("cómo llega una jugada", () => {
  it("el enroque llega como O-O desde e1→g1 y desde e1→h1, y coincide", () => {
    const solution = solutionOf(CASTLING, "1. O-O Kh8 2. Rf8+");
    const kingTwoSquares = sanForMove(CASTLING, "e1", "g1");
    const kingOntoRook = sanForMove(CASTLING, "e1", "h1");

    expect([kingTwoSquares, kingOntoRook]).toEqual(["O-O", "O-O"]);
    for (const san of [kingTwoSquares, kingOntoRook]) {
      expect(play(solution, startSolving(solution), san ?? "")).toMatchObject({
        kind: "correct",
        reply: { san: "Kh8" },
      });
    }
  });

  it("una subpromoción no es una promoción a dama", () => {
    const solution = solutionOf(UNDERPROMOTION, "1. b8=N+");

    expect(correct(solution, startSolving(solution), "b8=N+").completed).toBe(true);
    expect(play(solution, startSolving(solution), "b8=Q").kind).toBe("wrong");
  });
});

describe("pistas (D20, D37)", () => {
  const hints = ["Busca un sacrificio de dama.", "El caballo da el último golpe."];
  const solution = solutionOf(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7#", { kind: "MATE_IN", mateIn: 2, hints });

  it("muestra los textos del autor, luego la pieza que se mueve, al inicio y tras la respuesta", () => {
    let state = startSolving(solution);
    const shown: unknown[] = [];
    for (let press = 0; press < 3; press++) {
      const taken = takeHint(solution, state);
      state = taken.state;
      shown.push(taken.hint);
    }
    expect(shown).toEqual([
      { kind: "text", text: hints[0], index: 0 },
      { kind: "text", text: hints[1], index: 1 },
      { kind: "piece", square: "b3" },
    ]);
    expect(state).toMatchObject({ hintsUsed: 3, textHintsShown: 2, hintSquare: "b3" });

    state = play(solution, state, "Qg8+").state;
    expect(state.hintSquare).toBeNull();
    const afterReply = takeHint(solution, state);
    expect(afterReply.hint).toEqual({ kind: "piece", square: "h6" });
    expect(afterReply.state.hintsUsed).toBe(4);
  });

  it("con una pista, resolverlo es superarlo, no perfecto", () => {
    const hinted = takeHint(solution, startSolving(solution)).state;
    const done = playAll(solution, ["Qg8+", "Nf7#"], hinted);

    expect(outcomeOf(done)).toMatchObject({ result: "PASSED", isPerfect: false, hintsUsed: 1, review: "hinted" });
    expect(done.decisive).toEqual({
      moves: [
        { san: "Qg8+", hintsBefore: 1 },
        { san: "Nf7#", hintsBefore: 1 },
      ],
      at: "completed",
    });
  });

  it("sin textos, la primera pista ya es la pieza; terminado, no hay pista", () => {
    const bare = solutionOf(BACK_RANK, "1. Rd8#");
    expect(takeHint(bare, startSolving(bare)).hint).toEqual({ kind: "piece", square: "d1" });

    const done = playAll(bare, ["Rd8#"]);
    expect(takeHint(bare, done)).toEqual({ state: done, hint: null });
  });
});

describe("«Ver la solución» (D20)", () => {
  const solution = readSolution({
    solutionPgn: `[SetUp "1"]\n[FEN "${PHILIDOR}"]\n\n1. Qg8+ {¡La dama se entrega!} Rxg8 2. Nf7# {Mate ahogado.} *`,
    kind: "MATE_IN",
    mateIn: 2,
    hints: [],
  }) as Solution;

  it("desde el inicio: todos los pasos con sus comentarios, y cuenta como fallado", () => {
    const shown = showSolution(solution, startSolving(solution));

    expect(shown.steps).toEqual([
      { path: "0", san: "Qg8+", fen: expect.any(String), comment: "¡La dama se entrega!", byPlayer: true },
      { path: "0.0", san: "Rxg8", fen: expect.any(String), byPlayer: false },
      { path: "0.0.0", san: "Nf7#", fen: expect.any(String), comment: "Mate ahogado.", byPlayer: true },
    ]);
    expect(shown.state).toMatchObject({ completed: true, path: "0.0.0", decisive: { moves: [], at: "solution" } });
    expect(outcomeOf(shown.state)).toMatchObject({
      result: "FAILED",
      solutionShown: true,
      review: "failed",
      mistake: null,
    });
  });

  it("desde la mitad: sólo lo que falta", () => {
    const middle = play(solution, startSolving(solution), "Qg8+").state;
    const shown = showSolution(solution, middle);

    expect(shown.steps.map((step) => step.san)).toEqual(["Nf7#"]);
    expect(outcomeOf(shown.state)).toMatchObject({ result: "FAILED", solutionShown: true, correctMoves: 1 });
  });
});

describe("replayAttempt", () => {
  const solution = solutionOf(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7#", { kind: "MATE_IN", mateIn: 2 });
  const clean = [
    { san: "Qg8+", hintsBefore: 0 },
    { san: "Nf7", hintsBefore: 0 },
  ];

  it("acepta un intento limpio, uno fallado a la primera y uno con la solución vista", () => {
    expect(replayAttempt(solution, { moves: clean, hintsUsed: 0, solutionShown: false })).toMatchObject({
      ok: true,
      outcome: { result: "PASSED", isPerfect: true, review: "clean" },
    });

    const failed = replayAttempt(solution, {
      moves: [{ san: "Qh3", hintsBefore: 1 }],
      hintsUsed: 1,
      solutionShown: false,
    });
    expect(failed).toMatchObject({
      ok: true,
      outcome: {
        result: "FAILED",
        review: "failed",
        mistake: { ply: 1, fen: PHILIDOR, playedSan: "Qh3", expectedSan: "Qg8+", hintShownBefore: true },
      },
    });

    expect(replayAttempt(solution, { moves: clean.slice(0, 1), hintsUsed: 0, solutionShown: true })).toMatchObject({
      ok: true,
      outcome: { result: "FAILED", solutionShown: true, correctMoves: 1 },
    });
  });

  it("baja el resultado con las pistas que declara, nunca lo sube", () => {
    expect(replayAttempt(solution, { moves: clean, hintsUsed: 2, solutionShown: false })).toMatchObject({
      ok: true,
      outcome: { result: "PASSED", isPerfect: false, review: "hinted", hintsUsed: 2 },
    });
  });

  it("rechaza una jugada tras la decisión, una ilegal, una secuencia sin terminar y una lista vacía", () => {
    const afterWrong = [{ san: "Qh3", hintsBefore: 0 }, ...clean];
    expect(replayAttempt(solution, { moves: afterWrong, hintsUsed: 0, solutionShown: false })).toEqual({
      ok: false,
      reason: "movesAfterDecision",
    });
    expect(
      replayAttempt(solution, {
        moves: [...clean, { san: "Kh1", hintsBefore: 0 }],
        hintsUsed: 0,
        solutionShown: false,
      }),
    ).toEqual({
      ok: false,
      reason: "movesAfterDecision",
    });
    expect(
      replayAttempt(solution, { moves: [{ san: "Qz9", hintsBefore: 0 }], hintsUsed: 0, solutionShown: false }),
    ).toEqual({
      ok: false,
      reason: "illegal",
    });
    expect(replayAttempt(solution, { moves: clean.slice(0, 1), hintsUsed: 0, solutionShown: false })).toEqual({
      ok: false,
      reason: "undecided",
    });
    expect(replayAttempt(solution, { moves: [], hintsUsed: 0, solutionShown: false })).toEqual({
      ok: false,
      reason: "undecided",
    });
  });
});

describe("outcomeOf", () => {
  /** A small deterministic generator (mulberry32), so a failure can be replayed. */
  function random(seed: number): () => number {
    let value = seed;
    return () => {
      value = (value + 0x6d2b79f5) | 0;
      let t = Math.imul(value ^ (value >>> 15), 1 | value);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function legalSans(fen: string): string[] {
    const pos = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
    return [...pos.allDests()].flatMap(([from, dests]) =>
      [...dests].map((to) => {
        const san = sanForMove(fen, makeSquare(from), makeSquare(to));
        return san ?? makeSan(pos, { from, to });
      }),
    );
  }

  it("nunca dice PASSED con un primer error, sobre secuencias al azar en la coz", () => {
    const solution = solutionOf(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7#", {
      kind: "MATE_IN",
      mateIn: 2,
      hints: ["Una pista."],
    });
    const next = random(20261016);

    for (let run = 0; run < 300; run++) {
      let state = startSolving(solution);
      for (let step = 0; step < 8 && !state.completed; step++) {
        const roll = next();
        if (roll < 0.1) state = takeHint(solution, state).state;
        else if (roll < 0.15) state = showSolution(solution, state).state;
        else {
          // Half the time a move from the tree, half a random legal one.
          const sans = roll < 0.55 ? ["Qg8+", "Nf7#"] : legalSans(state.fen);
          const san = sans[Math.floor(next() * sans.length)] ?? "";
          const result = playMove(solution, state, san);
          if (result.kind !== "illegal") state = result.state;
        }
      }
      const outcome = outcomeOf(state);
      if (state.firstMistake !== null) expect(outcome.result).toBe("FAILED");
      if (outcome.result === "PASSED") expect(outcome.mistake).toBeNull();
    }
  });
});
