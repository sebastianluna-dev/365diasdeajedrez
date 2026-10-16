import { describe, expect, it } from "vitest";
import {
  analyzeSolution,
  dropMistakeVariants,
  emptySolutionPgn,
  exerciseSeedFromGame,
  readSolutionStart,
  solutionPgnFromLine,
  type SolutionAnalysis,
} from "./exercise-format";
import { parsePgnTree, sansAlongPath } from "./pgn-tree";

// Positions checked with chessops on 2026-10-16.
const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
const PHILIDOR = "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1";
const TWO_MATES = "6k1/5ppp/8/8/8/8/Q4PPP/1R4K1 w - - 0 1";
const KNIGHT_FORK = "r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1";
/** Two rooks: after 1. Ra7 the king has two squares, and 2. Rb8# mates on both. */
const ROOK_LADDER = "6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1";
/** The back rank with a spare pawn: 1. Rd5 a6 2. Rd8# reads as a mate in 2, but 1… h6 escapes. */
const BACK_RANK_WITH_LUFT = "6k1/p4ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
/** White moves a pawn and Black mates: the line ends with the opponent mating. */
const OPPONENT_MATES = "3r2k1/5ppp/8/8/8/8/P4PPP/6K1 w - - 0 1";
/** Move 14 of an open game: 14. Ac4xf7+ is the shot, 14. Cxe5? Dxe5 the refuted try. */
const FOURTEENTH = "r3k2r/pppbqppp/8/4p3/2B5/5N2/PPP2PPP/R3K2R w KQkq - 0 14";
const LUCENA = "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1";
const LUCENA_LINE = ["Rd1+", "Ke7", "Rd4", "Ra1", "Kc7", "Rc1+", "Kb6", "Rb1+", "Kc6", "Rc1+", "Kb5", "Rb1+", "Rb4"];
/** The seed's Sicilian lesson, with its variation. */
const SICILIAN = `1. e4 c5 {La Defensa Siciliana.} 2. Nf3 ( 2. Nc3 Nc6 3. g3 g6 {La Siciliana Cerrada.} ) 2... d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 *`;

function pgn(fen: string, moves: string, extraHeaders = ""): string {
  return `${extraHeaders}[SetUp "1"]\n[FEN "${fen}"]\n\n${moves} *`;
}

function problemsOf(analysis: SolutionAnalysis) {
  return analysis.ok ? [] : analysis.problems;
}

describe("readSolutionStart", () => {
  it("normaliza un PGN con [FEN], variantes y comentarios: sólo SetUp y FEN, comentarios y flechas intactos", () => {
    const read = readSolutionStart(
      pgn(
        PHILIDOR,
        "1. Qg8+ {El sacrificio. [%cal Gb3g8]} Rxg8 ( 1... Kxg8 ) 2. Nf7# {Mate ahogado.}",
        '[Event "Ejemplo"]\n[White "Philidor"]\n[Black "?"]\n',
      ),
    );

    expect(read.ok).toBe(true);
    if (!read.ok) return;
    expect(read.normalizedPgn).not.toContain("Event");
    expect(read.normalizedPgn).not.toContain("White");
    expect(read.normalizedPgn).toContain('[SetUp "1"]');
    expect(read.normalizedPgn).toContain(`[FEN "${PHILIDOR}"]`);
    expect(read.normalizedPgn).toContain("El sacrificio.");
    expect(read.normalizedPgn).toContain("[%cal Gb3g8]");
    expect(read.normalizedPgn).toContain("Mate ahogado.");
  });

  it("da el FEN de inicio con sus relojes y cuenta las jugadas del jugador", () => {
    const line = ["Rd1+", "Ke7", "Rd4", "Ra1"];
    const counts = [1, 2, 3, 4].map((plies) => {
      const read = readSolutionStart(solutionPgnFromLine(LUCENA, line.slice(0, plies)));
      return read.ok ? [read.startFen, read.solutionPlies, read.playerMoves] : null;
    });

    expect(counts).toEqual([
      [LUCENA, 1, 1],
      [LUCENA, 2, 1],
      [LUCENA, 3, 2],
      [LUCENA, 4, 2],
    ]);
  });

  it("lee un borrador sin jugadas y uno con una rama rota, igual en la segunda lectura", () => {
    const empty = readSolutionStart(emptySolutionPgn(BACK_RANK));
    expect(empty).toMatchObject({ ok: true, startFen: BACK_RANK, solutionPlies: 0, playerMoves: 0 });

    const broken = readSolutionStart(pgn(LUCENA, "1. Rd1+ Ke7 2. Rd4 Ra1 3. Kxa1 Rb1+"));
    expect(broken).toMatchObject({ ok: true, solutionPlies: 4, playerMoves: 2 });

    for (const read of [empty, broken]) {
      if (!read.ok) throw new Error("unreadable");
      expect(readSolutionStart(read.normalizedPgn)).toEqual(read);
    }
  });

  it("rechaza una posición imposible que parsePgnTree cambiaría por la inicial", () => {
    // Black, not to move, is in check from the rook.
    const oppositeCheck = pgn("4k3/8/8/8/8/8/8/4RK2 w - - 0 1", "1. Kf2");
    // A white pawn on the eighth rank.
    const pawnOnBackRank = pgn("P3k3/8/8/8/8/8/8/4K3 w - - 0 1", "1. Kf2");

    for (const text of [oppositeCheck, pawnOnBackRank]) {
      expect(parsePgnTree(text)?.initialFen).toContain("rnbqkbnr");
      expect(readSolutionStart(text)).toEqual({ ok: false, problem: "badPosition" });
    }
    // The two checks chessops' validate() does not make.
    expect(readSolutionStart(pgn("4k3/8/8/8/8/3n1n2/8/4K3 w - - 0 1", "1. Kf2"))).toEqual({
      ok: false,
      problem: "badPosition",
    });
  });

  it("rechaza otra variante de ajedrez y acepta las que son ajedrez", () => {
    expect(readSolutionStart(pgn(BACK_RANK, "1. Rd8#", '[Variant "Atomic"]\n'))).toEqual({
      ok: false,
      problem: "unsupportedVariant",
    });
    expect(readSolutionStart(pgn(BACK_RANK, "1. Rd8#", '[Variant "From Position"]\n')).ok).toBe(true);
    expect(readSolutionStart(pgn(BACK_RANK, "1. Rd8#", '[Variant "Standard"]\n')).ok).toBe(true);
  });

  it("reescribe el [FEN] con el inicio normalizado cuando un enroque es imposible", () => {
    // White has castling rights but no rook on h1 or a1.
    const read = readSolutionStart(pgn("4k3/8/8/8/8/8/8/4K3 w KQ - 0 1", "1. Kf2"));

    expect(read).toMatchObject({ ok: true, startFen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1" });
    if (read.ok) expect(read.normalizedPgn).toContain(`[FEN "${read.startFen}"]`);
  });

  it("no lee lo que no es un PGN", () => {
    expect(readSolutionStart("")).toEqual({ ok: false, problem: "unreadable" });
    expect(readSolutionStart("esto no es un PGN")).toEqual({ ok: false, problem: "unreadable" });
  });
});

describe("analyzeSolution", () => {
  it("pide jugadas, señala las ilegales y no lee lo ilegible", () => {
    expect(
      problemsOf(analyzeSolution({ solutionPgn: emptySolutionPgn(BACK_RANK), kind: "SEQUENCE", mateIn: null })),
    ).toEqual([{ code: "noMoves" }]);
    const broken = analyzeSolution({
      solutionPgn: pgn(LUCENA, "1. Rd1+ Ke7 2. Rd4 (2. Kxa1) Ra1"),
      kind: "SEQUENCE",
      mateIn: null,
    });
    expect(problemsOf(broken)).toEqual([{ code: "illegalMove", detail: expect.stringContaining("Kxa1") }]);
    expect(problemsOf(analyzeSolution({ solutionPgn: "hola", kind: "SEQUENCE", mateIn: null }))).toEqual([
      { code: "unreadable" },
    ]);
  });

  it("acepta una secuencia correcta y da sus columnas", () => {
    const analysis = analyzeSolution({
      solutionPgn: solutionPgnFromLine(LUCENA, LUCENA_LINE),
      kind: "SEQUENCE",
      mateIn: null,
    });

    expect(analysis).toMatchObject({ ok: true, startFen: LUCENA, solutionPlies: 13, playerMoves: 7, warnings: [] });
  });

  it("exige que el tipo y el número de jugadas del mate concuerden", () => {
    const mate = pgn(BACK_RANK, "1. Rd8#");
    expect(problemsOf(analyzeSolution({ solutionPgn: mate, kind: "MATE_IN", mateIn: null }))).toEqual([
      { code: "mateInMissing" },
    ]);
    expect(problemsOf(analyzeSolution({ solutionPgn: mate, kind: "MATE_IN", mateIn: 6 }))).toEqual([
      { code: "mateInMissing" },
    ]);
    expect(problemsOf(analyzeSolution({ solutionPgn: mate, kind: "SEQUENCE", mateIn: 1 }))).toEqual([
      { code: "mateInOnSequence" },
    ]);
  });

  describe("Mate en N", () => {
    const smothered = pgn(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7#");

    it("acepta el mate de la coz de Philidor como mate en 2", () => {
      expect(analyzeSolution({ solutionPgn: smothered, kind: "MATE_IN", mateIn: 2 }).ok).toBe(true);
    });

    it("rechaza una línea más larga que N", () => {
      expect(problemsOf(analyzeSolution({ solutionPgn: smothered, kind: "MATE_IN", mateIn: 1 }))).toContainEqual({
        code: "mateTooLong",
        path: "0.0.0",
      });
    });

    it("rechaza un mate en 1 etiquetado como mate en 2", () => {
      expect(
        problemsOf(analyzeSolution({ solutionPgn: pgn(BACK_RANK, "1. Rd8#"), kind: "MATE_IN", mateIn: 2 })),
      ).toEqual([{ code: "mateLengthMismatch" }]);
    });

    it("rechaza una línea que acaba en jaque sin mate, y una en la que mata el rival", () => {
      const check = pgn("6k1/5pp1/8/8/8/8/5PPP/3R2K1 w - - 0 1", "1. Rd8+");
      expect(problemsOf(analyzeSolution({ solutionPgn: check, kind: "MATE_IN", mateIn: 1 }))).toContainEqual({
        code: "notMate",
        path: "0",
      });

      const matedPlayer = pgn(OPPONENT_MATES, "1. a3 Rd1#");
      expect(problemsOf(analyzeSolution({ solutionPgn: matedPlayer, kind: "MATE_IN", mateIn: 1 }))).toContainEqual({
        code: "notMate",
        path: "0.0",
      });
    });

    it("acepta una defensa escrita como variante si también recibe mate", () => {
      const ladder = pgn(ROOK_LADDER, "1. Ra7 Kf8 ( 1... Kh8 2. Rb8# ) 2. Rb8#");
      const analysis = analyzeSolution({ solutionPgn: ladder, kind: "MATE_IN", mateIn: 2 });

      expect(analysis.ok).toBe(true);
      expect(analysis.warnings).toEqual([{ code: "opponentVariant", path: "0.1" }]);
    });

    it("rechaza un mate en 2 cuya jugada clave deja escapar una defensa no escrita", () => {
      const luft = pgn(BACK_RANK_WITH_LUFT, "1. Rd5 a6 2. Rd8#");

      expect(problemsOf(analyzeSolution({ solutionPgn: luft, kind: "MATE_IN", mateIn: 2 }))).toEqual([
        { code: "notForced" },
      ]);
    });
  });

  it("avisa de las variantes del rival, que nunca se juegan", () => {
    const fork = pgn(KNIGHT_FORK, "1. Nc7+ Kd8 ( 1... Kd7 ) 2. Nxa8");
    const analysis = analyzeSolution({ solutionPgn: fork, kind: "SEQUENCE", mateIn: null });

    expect(analysis).toMatchObject({ ok: true, warnings: [{ code: "opponentVariant", path: "0.1" }] });
  });

  it("lista las jugadas aceptadas cuando hay más de una", () => {
    const both = pgn(TWO_MATES, "1. Rb8# ( 1. Qa8# )");

    for (const kind of ["SEQUENCE", "MATE_IN"] as const) {
      const analysis = analyzeSolution({ solutionPgn: both, kind, mateIn: kind === "MATE_IN" ? 1 : null });
      expect(analysis).toMatchObject({
        ok: true,
        warnings: [{ code: "playerAlternatives", at: "", sans: ["Rb8#", "Qa8#"] }],
      });
    }
  });

  it("avisa de una variante aceptada que termina antes que la línea principal", () => {
    const short = pgn(KNIGHT_FORK, "1. Nc7+ ( 1. Nd6+ ) Kd8 2. Nxa8");
    const analysis = analyzeSolution({ solutionPgn: short, kind: "SEQUENCE", mateIn: null });

    expect(analysis.ok).toBe(true);
    expect(analysis.warnings).toContainEqual({ code: "shortAlternative", path: "1" });
  });

  it("rechaza una variante del jugador marcada como error, y dropMistakeVariants la quita", () => {
    const refuted = pgn(FOURTEENTH, "14. Bxf7+! ( 14. Nxe5? Qxe5 )");
    expect(problemsOf(analyzeSolution({ solutionPgn: refuted, kind: "SEQUENCE", mateIn: null }))).toEqual([
      { code: "mistakeVariant", path: "1" },
    ]);

    const dropped = dropMistakeVariants(refuted);
    expect(dropped).toContain("Bxf7+");
    expect(dropped).not.toContain("Nxe5");
    expect(analyzeSolution({ solutionPgn: dropped, kind: "SEQUENCE", mateIn: null }).ok).toBe(true);
  });
});

describe("exerciseSeedFromGame", () => {
  it("toma la posición de una jugada a mitad de partida y lo que sigue, con sus variantes", () => {
    const seed = exerciseSeedFromGame(SICILIAN, "0.0");

    expect(seed?.startFen).toBe("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
    const tree = seed ? parsePgnTree(seed.solutionPgn) : null;
    expect(tree?.children.map((child) => child.san)).toEqual(["Nf3", "Nc3"]);
    expect(tree ? sansAlongPath(tree, "1.0.0.0") : []).toEqual(["Nc3", "Nc6", "g3", "g6"]);
    expect(tree?.nodesByPath.get("1.0.0.0")?.comment).toBe("La Siciliana Cerrada.");
    // The game's own text is not the seed's: the source stays untouched.
    expect(parsePgnTree(SICILIAN)?.children[0]?.san).toBe("e4");
  });

  it("deja la solución vacía en la última jugada y no da nada en una ruta rota", () => {
    const last = exerciseSeedFromGame(SICILIAN, "0.0.0.0.0.0.0.0.0");
    expect(last && parsePgnTree(last.solutionPgn)?.children).toEqual([]);
    expect(exerciseSeedFromGame(SICILIAN, "0.5")).toBeNull();
  });
});

describe("solutionPgnFromLine", () => {
  it("escribe la línea de Lucena tal como parsePgnTree la vuelve a leer", () => {
    const tree = parsePgnTree(solutionPgnFromLine(LUCENA, LUCENA_LINE));

    expect(tree?.initialFen).toBe(LUCENA);
    expect(tree ? sansAlongPath(tree, Array(LUCENA_LINE.length).fill("0").join(".")) : []).toEqual(LUCENA_LINE);
    expect(tree?.warnings).toEqual([]);
  });
});
