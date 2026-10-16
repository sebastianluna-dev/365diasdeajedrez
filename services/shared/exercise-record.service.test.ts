import { describe, expect, it } from "vitest";
import { createPositionHash } from "@/lib/chess/position-hash";
import { FAKE_EXERCISE_IDS, fakeExerciseDb, type FakeExerciseClient } from "@/lib/testing/fake-exercise-db";
import {
  createExerciseRecord,
  exerciseCopyInput,
  exerciseSolutionColumns,
  exerciseSolutionProblem,
  syncExerciseSolution,
  type CreateExerciseRecordInput,
  type ExerciseRecordWriter,
} from "./exercise-record.service";

function writer(client: FakeExerciseClient): ExerciseRecordWriter {
  return client as unknown as ExerciseRecordWriter;
}

const KINDS = new Map([
  ["SEQUENCE", FAKE_EXERCISE_IDS.kind.SEQUENCE],
  ["MATE_IN", FAKE_EXERCISE_IDS.kind.MATE_IN],
] as const);

const SMOTHERED_FEN = "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1";
// Headers the solution drops, an unnumbered line, and no result: stored normalised.
const SMOTHERED = `[Event "Philidor"]\n[White "A"]\n[SetUp "1"]\n[FEN "${SMOTHERED_FEN}"]\n\n1. Qg8+ Rxg8 2. Nf7# *`;

const CONTENT: CreateExerciseRecordInput["content"] = {
  title: " Mate de la coz ",
  prompt: null,
  difficulty: 1400,
  hints: ["La dama se sacrifica.", " ", ""],
  explanation: "Tras Rxg8 el rey no tiene casillas.",
  sourceWhite: null,
  sourceBlack: null,
  sourceEvent: null,
  sourceYear: null,
  topicCodes: ["FORK", "ENDGAME", "NOPE"],
};

describe("exerciseSolutionColumns", () => {
  it("congela juntas las siete columnas de la solución", () => {
    const columns = exerciseSolutionColumns({ solutionPgn: SMOTHERED, kind: "MATE_IN", mateIn: 2 }, KINDS);
    expect(columns).toMatchObject({
      kindId: FAKE_EXERCISE_IDS.kind.MATE_IN,
      mateIn: 2,
      startFen: SMOTHERED_FEN,
      startPositionHash: createPositionHash(SMOTHERED_FEN),
      solutionPlies: 3,
      playerMoves: 2,
    });
    expect(columns.solutionPgn).not.toContain("Event");
    expect(columns.solutionPgn).toContain(`[FEN "${SMOTHERED_FEN}"]`);
  });

  it("una secuencia nunca guarda N, y una solución ilegible no se guarda", () => {
    expect(exerciseSolutionProblem({ solutionPgn: SMOTHERED, kind: "SEQUENCE", mateIn: 2 })).toBe("mateInOnSequence");
    expect(exerciseSolutionProblem({ solutionPgn: SMOTHERED, kind: "MATE_IN", mateIn: null })).toBe("mateInMissing");
    expect(exerciseSolutionProblem({ solutionPgn: SMOTHERED, kind: "MATE_IN", mateIn: 6 })).toBe("mateInMissing");
    const badFen = '[SetUp "1"]\n[FEN "8/8/8/8/8/8/8/8 w - - 0 1"]\n\n*';
    expect(exerciseSolutionProblem({ solutionPgn: badFen, kind: "SEQUENCE", mateIn: null })).toBe("badPosition");
    expect(() => exerciseSolutionColumns({ solutionPgn: badFen, kind: "SEQUENCE", mateIn: null }, KINDS)).toThrow();
  });

  it("un borrador sin jugadas se guarda, con cero jugadas", () => {
    const draft = `[SetUp "1"]\n[FEN "${SMOTHERED_FEN}"]\n\n*`;
    expect(exerciseSolutionProblem({ solutionPgn: draft, kind: "SEQUENCE", mateIn: null })).toBeNull();
    expect(exerciseSolutionColumns({ solutionPgn: draft, kind: "SEQUENCE", mateIn: null }, KINDS)).toMatchObject({
      solutionPlies: 0,
      playerMoves: 0,
    });
  });
});

describe("createExerciseRecord", () => {
  it("crea el ejercicio en borrador, con sus columnas derivadas y sus temas, en la transacción", async () => {
    const database = fakeExerciseDb();
    const tx = database.begin();
    const created = await createExerciseRecord(writer(tx), {
      teacherId: "t-1",
      authorUserId: "u-t",
      solution: { solutionPgn: SMOTHERED, kind: "MATE_IN", mateIn: 2 },
      content: CONTENT,
    });
    expect(created.ok).toBe(true);
    // Nothing is seen before the caller's transaction commits.
    expect(database.rows("exercise")).toEqual([]);
    tx.commit();

    const [row] = database.rows("exercise");
    expect(row).toMatchObject({
      teacherId: "t-1",
      authorUserId: "u-t",
      statusId: FAKE_EXERCISE_IDS.status.DRAFT,
      title: "Mate de la coz",
      hints: ["La dama se sacrifica."],
      startFen: SMOTHERED_FEN,
      solutionPlies: 3,
      playerMoves: 2,
      kindId: FAKE_EXERCISE_IDS.kind.MATE_IN,
      mateIn: 2,
      sourceGameId: null,
      copiedFromId: null,
    });
    expect(
      database
        .rows("exerciseTopic")
        .map((join) => join.topicId)
        .sort(),
    ).toEqual([FAKE_EXERCISE_IDS.topic.ENDGAME, FAKE_EXERCISE_IDS.topic.FORK].sort());
  });

  it("no escribe nada con una solución que no se puede guardar", async () => {
    const database = fakeExerciseDb();
    const tx = database.begin();
    await expect(
      createExerciseRecord(writer(tx), {
        teacherId: null,
        authorUserId: null,
        solution: { solutionPgn: "nada", kind: "SEQUENCE", mateIn: null },
        content: CONTENT,
      }),
    ).resolves.toEqual({ ok: false, code: "unreadable" });
    tx.commit();
    expect(database.rows("exercise")).toEqual([]);
    expect(database.rows("exerciseTopic")).toEqual([]);
  });
});

describe("syncExerciseSolution", () => {
  it("reescribe la solución y deriva otra vez lo congelado", async () => {
    const database = fakeExerciseDb({
      exercise: [
        {
          id: "e-1",
          statusId: FAKE_EXERCISE_IDS.status.READY,
          kindId: FAKE_EXERCISE_IDS.kind.SEQUENCE,
          title: "x",
          difficulty: 1200,
          solutionPgn: "old",
          startFen: "old",
          startPositionHash: "old",
          solutionPlies: 9,
          playerMoves: 9,
        },
      ],
    });
    const tx = database.begin();
    await expect(
      syncExerciseSolution(writer(tx), "e-1", { solutionPgn: SMOTHERED, kind: "SEQUENCE", mateIn: null }),
    ).resolves.toEqual({ ok: true, written: true });
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({
      statusId: FAKE_EXERCISE_IDS.status.READY,
      startFen: SMOTHERED_FEN,
      startPositionHash: createPositionHash(SMOTHERED_FEN),
      solutionPlies: 3,
      playerMoves: 2,
      mateIn: null,
    });
  });

  it("rechaza una solución que no se puede guardar sin tocar la fila", async () => {
    const database = fakeExerciseDb({ exercise: [{ id: "e-1", solutionPgn: "old" }] });
    const tx = database.begin();
    await expect(
      syncExerciseSolution(writer(tx), "e-1", { solutionPgn: SMOTHERED, kind: "MATE_IN", mateIn: null }),
    ).resolves.toEqual({ ok: false, code: "mateInMissing" });
    expect(tx.log).toEqual([]);
  });
});

describe("exerciseCopyInput", () => {
  it("copia el contenido y la solución, y nunca el sello de la revisión ni la partida de origen", () => {
    const source = {
      id: "e-1",
      solutionPgn: SMOTHERED,
      kind: "MATE_IN" as const,
      mateIn: 2,
      title: "Mate de la coz",
      prompt: "Juegan blancas y dan mate en 2",
      difficulty: 1400,
      hints: ["a"],
      explanation: "b",
      sourceWhite: "Philidor",
      sourceBlack: null,
      sourceEvent: null,
      sourceYear: 1749,
      topicCodes: ["FORK"],
      // What a row also carries and a copy must never take.
      publishedAt: new Date(),
      reviewedById: "u-s",
      sourceGameId: "g-1",
      startFen: "x",
    };
    const copy = exerciseCopyInput(source);
    expect(copy.copiedFromId).toBe("e-1");
    expect(copy.solution).toEqual({ solutionPgn: SMOTHERED, kind: "MATE_IN", mateIn: 2 });
    expect(Object.keys(copy.content).sort()).toEqual(
      [
        "title",
        "prompt",
        "difficulty",
        "hints",
        "explanation",
        "sourceWhite",
        "sourceBlack",
        "sourceEvent",
        "sourceYear",
        "topicCodes",
      ].sort(),
    );
    expect(JSON.stringify(copy)).not.toMatch(/publishedAt|reviewedById|sourceGameId|startFen/);
    // A copy of the arrays, not the source's own.
    expect(copy.content.hints).not.toBe(source.hints);
  });
});
