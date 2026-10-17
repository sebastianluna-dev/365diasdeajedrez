import { describe, expect, it } from "vitest";
import { createPositionHash } from "@/lib/chess/position-hash";
import { firstSanOf, readExerciseImport, type ExerciseImportDefaults, type ExerciseImportRow } from "./exercise-import";

// Positions checked with chessops on 2026-10-16 (lib/chess/exercise-format.test.ts).
const BACK_RANK = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
const PHILIDOR = "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1";
const TWO_MATES = "6k1/5ppp/8/8/8/8/Q4PPP/1R4K1 w - - 0 1";
const FOURTEENTH = "r3k2r/pppbqppp/8/4p3/2B5/5N2/PPP2PPP/R3K2R w KQkq - 0 14";
const LUCENA = "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1";

const TOPICS = [
  { code: "TACTICS", label: "Táctica" },
  { code: "FORK", label: "Ataque doble" },
  { code: "PIN", label: "Clavada" },
  { code: "BACK_RANK_MATE", label: "Mate del pasillo" },
];

const DEFAULTS: ExerciseImportDefaults = {
  difficulty: 1200,
  kind: "SEQUENCE",
  mateIn: null,
  topicCodes: ["TACTICS"],
  dropMistakeVariants: true,
  target: "ready",
};

/** One game of a file: the headers given, `[SetUp]`/`[FEN]` unless `fen` is null, and the moves. */
function game(fen: string | null, moves: string, headers: Record<string, string> = {}): string {
  const lines = Object.entries(headers).map(([name, value]) => `[${name} "${value}"]`);
  if (fen) lines.push('[SetUp "1"]', `[FEN "${fen}"]`);
  return `${lines.join("\n")}\n\n${moves} *\n`;
}

const outcomes = (rows: ExerciseImportRow[]) => rows.map((row) => row.outcome);
const refusals = (rows: ExerciseImportRow[]) =>
  rows.map((row) => (row.outcome === "skipped" ? row.refusal.code : row.outcome));

describe("readExerciseImport", () => {
  it("lee un ejercicio por partida con sus cabeceras: título, enunciado, dificultad, temas, N, pistas, explicación y origen", () => {
    const reading = readExerciseImport(
      game(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7#", {
        Event: "Estudio",
        White: "Philidor",
        Black: "?",
        Date: "1749.??.??",
        Title: "El mate de Philidor",
        Prompt: "Juegan blancas y dan mate",
        Difficulty: "1410",
        Topics: "mate del pasillo, FORK, Rayos X",
        MateIn: "2",
        Hint1: "Sacrifica la dama.",
        Hint3: "El caballo remata.",
        Explanation: "El rey se ahoga con sus propias piezas.",
      }),
      DEFAULTS,
      TOPICS,
      [],
    );
    expect(reading.counts).toEqual({ ready: 1, draft: 0, skipped: 0 });
    const [row] = reading.rows;
    if (row?.outcome !== "ready") throw new Error("expected a ready row");
    expect(row.title).toBe("El mate de Philidor");
    expect(row.record.solution).toMatchObject({ kind: "MATE_IN", mateIn: 2 });
    expect(row.record.solution.solutionPgn).toContain(`[FEN "${PHILIDOR}"]`);
    expect(row.record.solution.solutionPgn).not.toContain("Event");
    expect(row.record.content).toMatchObject({
      prompt: "Juegan blancas y dan mate",
      // Snapped to the editor's step.
      difficulty: 1400,
      topicCodes: ["BACK_RANK_MATE", "FORK"],
      hints: ["Sacrifica la dama.", "El caballo remata."],
      explanation: "El rey se ahoga con sus propias piezas.",
      sourceWhite: "Philidor",
      sourceBlack: null,
      sourceEvent: "Estudio",
      sourceYear: 1749,
    });
    expect(row.notes).toEqual([{ code: "unknownTopics", names: ["Rayos X"] }]);
  });

  it("sin [Title] titula «Blancas – Negras, año», y sin jugadores «Ejercicio N»; sin cabeceras toma lo elegido", () => {
    const reading = readExerciseImport(
      [
        game(BACK_RANK, "1. Rd8#", { White: "Steinitz", Black: "Bardeleben", Date: "1895.08.17" }),
        game(LUCENA, "1. Rd1+ Ke7 2. Rd4"),
      ].join("\n"),
      { ...DEFAULTS, difficulty: 900, kind: "MATE_IN", mateIn: 1 },
      TOPICS,
      [],
    );
    expect(reading.rows.map((row) => row.title)).toEqual(["Steinitz – Bardeleben, 1895", "Ejercicio 2"]);
    const [mate, lucena] = reading.rows;
    if (mate?.outcome !== "ready") throw new Error("expected a ready row");
    expect(mate.record.content).toMatchObject({ difficulty: 900, topicCodes: ["TACTICS"], sourceYear: 1895 });
    expect(mate.record.solution).toMatchObject({ kind: "MATE_IN", mateIn: 1 });
    // The default kind is «Mate en 1», which the Lucena line is not: read with it, the gate refuses it.
    expect(lucena).toMatchObject({ outcome: "skipped", refusal: { code: "solution", problem: { code: "notMate" } } });
  });

  it("deja fuera lo que no tiene [FEN], lo que no se lee, una posición imposible y una solución que la puerta rechaza, cada una con su razón", () => {
    const reading = readExerciseImport(
      [
        game(null, "1. e4 e5", { White: "Sin posición" }),
        game("4k3/8/8/8/8/8/8/4RK2 w - - 0 1", "1. Kf2"),
        game(BACK_RANK, "1. Rd7", { MateIn: "1" }),
        game(BACK_RANK, "1. Rd8# 1. Rd7", { MateIn: "1" }),
        game(LUCENA, "", { Title: "Sin jugadas" }),
        game(BACK_RANK, "1. Rd8#", { Variant: "Atomic" }),
      ].join("\n"),
      DEFAULTS,
      TOPICS,
      [],
    );
    expect(refusals(reading.rows)).toEqual([
      "noFen",
      "badPosition",
      "solution",
      "solution",
      "solution",
      "unsupportedVariant",
    ]);
    const [, , notMate, illegal, noMoves] = reading.rows;
    expect(notMate).toMatchObject({ refusal: { problem: { code: "notMate" } } });
    expect(illegal).toMatchObject({ refusal: { problem: { code: "illegalMove" } } });
    expect(noMoves).toMatchObject({ refusal: { problem: { code: "noMoves" } } });
    expect(reading.counts).toEqual({ ready: 0, draft: 0, skipped: 6 });
  });

  it("quita la variante marcada como error y lo dice; sin esa opción, la rechaza", () => {
    const text = game(FOURTEENTH, "14. Bxf7+ (14. Nxe5? Qxe5) 14... Kxf7 15. Ng5+", { Title: "El golpe en f7" });
    const dropped = readExerciseImport(text, DEFAULTS, TOPICS, []);
    expect(outcomes(dropped.rows)).toEqual(["ready"]);
    expect(dropped.rows[0]?.notes).toEqual([{ code: "droppedVariant", label: "14. Cxe5" }]);
    const row = dropped.rows[0];
    if (row?.outcome !== "ready") throw new Error("expected a ready row");
    expect(row.record.solution.solutionPgn).not.toContain("Nxe5");

    const kept = readExerciseImport(text, { ...DEFAULTS, dropMistakeVariants: false }, TOPICS, []);
    expect(kept.rows[0]).toMatchObject({
      outcome: "skipped",
      refusal: { code: "solution", problem: { code: "mistakeVariant" } },
    });
  });

  it("avisa de las jugadas alternativas aceptadas", () => {
    const reading = readExerciseImport(game(TWO_MATES, "1. Rb8# (1. Qa8#)", { MateIn: "1" }), DEFAULTS, TOPICS, []);
    expect(reading.rows[0]?.notes).toEqual([{ code: "alternatives", sans: ["Rb8#", "Qa8#"] }]);
  });

  it("deja fuera la que ya está en los ejercicios del autor (misma posición y primera jugada) y la repetida en el archivo", () => {
    const existing = [{ startPositionHash: createPositionHash(BACK_RANK), firstSan: "Rd8#" }];
    const reading = readExerciseImport(
      [
        game(BACK_RANK, "1. Rd8#"),
        game(BACK_RANK, "1. Rd7 Kf8 2. Rd8#"),
        game(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7#"),
        game(PHILIDOR, "1. Qg8+ Rxg8 2. Nf7# {otra copia}"),
      ].join("\n"),
      DEFAULTS,
      TOPICS,
      existing,
    );
    expect(refusals(reading.rows)).toEqual(["duplicate", "ready", "ready", "repeated"]);
    expect(firstSanOf(`[FEN "${BACK_RANK}"]\n\n1. Rd8 *`)).toBe("Rd8");
  });

  it("como borrador lo que no alcanza lo pedido: sin tema con «Listo», sin explicación con «En la biblioteca»; todo entra con «Borrador»", () => {
    const text = game(BACK_RANK, "1. Rd8#", { MateIn: "1" });
    const noTopic = { ...DEFAULTS, topicCodes: [] };
    expect(readExerciseImport(text, noTopic, TOPICS, []).rows[0]).toMatchObject({
      outcome: "draft",
      missing: ["topic"],
    });
    expect(readExerciseImport(text, { ...DEFAULTS, target: "library" }, TOPICS, []).rows[0]).toMatchObject({
      outcome: "draft",
      missing: ["explanation"],
    });
    expect(readExerciseImport(text, { ...noTopic, target: "draft" }, TOPICS, []).counts).toEqual({
      ready: 1,
      draft: 0,
      skipped: 0,
    });
  });

  it("una cabecera que no se lee cae al valor elegido y lo dice: [MateIn] y [Difficulty]", () => {
    const reading = readExerciseImport(
      game(LUCENA, "1. Rd1+ Ke7 2. Rd4", { MateIn: "nueve", Difficulty: "muy alta" }),
      DEFAULTS,
      TOPICS,
      [],
    );
    const [row] = reading.rows;
    if (row?.outcome !== "ready") throw new Error("expected a ready row");
    expect(row.record.solution).toMatchObject({ kind: "SEQUENCE", mateIn: null });
    expect(row.record.content.difficulty).toBe(1200);
    expect(row.notes).toEqual([{ code: "mateInIgnored" }, { code: "difficultyIgnored" }]);
  });

  it("ignora el texto suelto entre partidas y no lee nada de un texto que no es PGN", () => {
    expect(readExerciseImport("hola, esto no es un PGN", DEFAULTS, TOPICS, []).rows).toEqual([]);
    const reading = readExerciseImport(`Un título suelto\n\n${game(BACK_RANK, "1. Rd8#")}`, DEFAULTS, TOPICS, []);
    expect(reading.rows).toHaveLength(1);
  });
});
