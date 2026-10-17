import { describe, expect, it } from "vitest";
import type { AttemptOutcome, PlayedMove } from "@/lib/chess/exercise-solver";
import { readSolution, replayAttempt } from "@/lib/chess/exercise-solver";
import { createPositionHash } from "@/lib/chess/position-hash";
import { FAKE_EXERCISE_IDS, fakeExerciseDb, type FakeExerciseClient } from "@/lib/testing/fake-exercise-db";
import {
  exerciseSolveKey,
  foldExerciseAttempt,
  EMPTY_EXERCISE_STATE,
  isSameStudyDay,
  rebuildUserExerciseState,
  recordExerciseAttempt,
  type ExerciseAttemptContextCode,
  type ExerciseAttemptWriter,
  type ExerciseStateRebuilder,
} from "./exercise-attempt.service";

// The writer of an exercise's attempts, over the fake database (PLAN.md §5.4).
// A fake cannot reproduce PostgreSQL's row locks exactly, but it serialises
// what asks for the same lock, so two submits that race are replayed here;
// the app check of phase 1 repeats it on the real database (two tabs).

const USER = "u-alumno";
const BACK_RANK_FEN = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
const BACK_RANK = `[SetUp "1"]\n[FEN "${BACK_RANK_FEN}"]\n\n1. Rd8# *`;
const SOLUTION = readSolution({ solutionPgn: BACK_RANK, kind: "SEQUENCE", mateIn: null, hints: ["Mira la fila."] })!;

function replay(moves: PlayedMove[], hintsUsed = 0, solutionShown = false): AttemptOutcome {
  const result = replayAttempt(SOLUTION, { moves, hintsUsed, solutionShown });
  if (!result.ok) throw new Error(result.reason);
  return result.outcome;
}

const CLEAN = replay([{ san: "Rd8#", hintsBefore: 0 }]);
const HINTED = replay([{ san: "Rd8#", hintsBefore: 1 }], 1);
const FAILED = replay([{ san: "Rd7", hintsBefore: 0 }]);
const SHOWN = replay([], 0, true);

// Study days in Mexico City (UTC−6): noon and five in the afternoon of the 16th, noon of the 17th and the 20th.
const DAY1 = new Date("2026-10-16T18:00:00.000Z");
const DAY1_LATER = new Date("2026-10-16T23:00:00.000Z");
const DAY2 = new Date("2026-10-17T18:00:00.000Z");
const DAY5 = new Date("2026-10-20T18:00:00.000Z");
/** 00:00 of a study day in Mexico City. */
const startOf = (day: string) => new Date(`${day}T06:00:00.000Z`);

const T = FAKE_EXERCISE_IDS.topic;

function database() {
  return fakeExerciseDb({
    exercise: [{ id: "e-1", copiedFromId: null, solutionPgn: BACK_RANK }],
    // A tactical motif and an endgame: the activity credits the lowest-order root, «Táctica».
    exerciseTopic: [
      { exerciseId: "e-1", topicId: T.ENDGAME },
      { exerciseId: "e-1", topicId: T.FORK },
    ],
  });
}

function writer(client: FakeExerciseClient): ExerciseAttemptWriter {
  return client as unknown as ExerciseAttemptWriter;
}

async function submit(
  db: ReturnType<typeof database>,
  outcome: AttemptOutcome,
  now: Date,
  contextCode: ExerciseAttemptContextCode = "SERIES",
) {
  const tx = db.begin();
  const result = await recordExerciseAttempt(writer(tx), {
    userId: USER,
    exercise: { id: "e-1", copiedFromId: null },
    contextCode,
    seriesId: contextCode === "SERIES" ? "s-1" : null,
    outcome,
    durationMs: 12_000,
    now,
  });
  tx.commit();
  return { result, log: tx.log };
}

const state = (db: ReturnType<typeof database>) => db.rows("userExerciseState").find((row) => row.exerciseId === "e-1");

describe("recordExerciseAttempt", () => {
  it("el primer resuelto guarda el intento, el estado y una actividad con la raíz de menor orden", async () => {
    const db = database();
    const { result } = await submit(db, CLEAN, DAY1);
    expect(result).toMatchObject({ scored: true, firstSolve: true });

    expect(db.rows("trainingAttempt")).toEqual([
      expect.objectContaining({
        userId: USER,
        exerciseId: "e-1",
        trainingExerciseId: null,
        seriesId: "s-1",
        resultId: FAKE_EXERCISE_IDS.result.PASSED,
        contextId: FAKE_EXERCISE_IDS.context.SERIES,
        mistakes: 0,
        isPerfect: true,
        solutionShown: false,
        requiredMoves: 1,
        correctMoves: 1,
        createdAt: DAY1,
      }),
    ]);
    expect(db.rows("trainingMistake")).toEqual([]);
    expect(state(db)).toMatchObject({
      attemptCount: 1,
      firstAttemptAt: DAY1,
      firstSolvedAt: DAY1,
      lastAttemptAt: DAY1,
      lastResultId: FAKE_EXERCISE_IDS.result.PASSED,
      // A clean first solve never enters the review.
      reviewStep: null,
      nextReviewAt: null,
    });
    expect(db.rows("userActivity")).toEqual([
      expect.objectContaining({
        userId: USER,
        typeCode: "EXERCISE_PASSED",
        subjectTypeCode: "EXERCISE",
        subjectId: "e-1",
        topicId: T.TACTICS,
        occurredAt: DAY1,
      }),
    ]);
  });

  it("toma el candado antes de leer nada del estado", async () => {
    const { log } = await submit(database(), CLEAN, DAY1);
    expect(log[0]).toMatch(/^INSERT INTO "UserExerciseState" .*ON CONFLICT DO NOTHING$/);
    expect(log[1]).toMatch(/^SELECT .* FROM "UserExerciseState" .* FOR UPDATE$/);
    expect(log.slice(2).some((entry) => entry.startsWith("userExerciseState."))).toBe(true);
  });

  it("un primer intento con o sin fila de estado no choca con la unicidad", async () => {
    const db = fakeExerciseDb({
      exercise: [{ id: "e-1", copiedFromId: null }],
      userExerciseState: [{ userId: USER, exerciseId: "e-1", attemptCount: 0 }],
    });
    await expect(submit(db, FAILED, DAY1)).resolves.toMatchObject({ result: { scored: true } });
    expect(db.rows("userExerciseState")).toHaveLength(1);
  });

  it("otro resuelto otro día cuenta como intento, pero no como otra actividad", async () => {
    const db = database();
    await submit(db, CLEAN, DAY1);
    const { result } = await submit(db, CLEAN, DAY2);
    expect(result).toMatchObject({ scored: true, firstSolve: false });
    expect(db.rows("trainingAttempt")).toHaveLength(2);
    expect(db.rows("userActivity")).toHaveLength(1);
    expect(state(db)).toMatchObject({ attemptCount: 2, firstSolvedAt: DAY1, lastAttemptAt: DAY2 });
  });

  it("un fallo guarda exactamente un error, con los SAN del servidor, y lo devuelve al día siguiente", async () => {
    const db = database();
    const { result } = await submit(db, FAILED, DAY1);
    expect(result).toMatchObject({ scored: true, firstSolve: false });
    expect(db.rows("trainingMistake")).toEqual([
      expect.objectContaining({
        attemptId: db.rows("trainingAttempt")[0]!.id,
        fen: BACK_RANK_FEN,
        positionHash: createPositionHash(BACK_RANK_FEN),
        playedSan: "Rd7",
        expectedSan: "Rd8#",
        ply: 1,
        usedHint: false,
      }),
    ]);
    expect(db.rows("trainingAttempt")[0]).toMatchObject({ mistakes: 1, resultId: FAKE_EXERCISE_IDS.result.FAILED });
    expect(state(db)).toMatchObject({ reviewStep: 0, nextReviewAt: startOf("2026-10-17"), firstSolvedAt: null });
    expect(db.rows("userActivity")).toEqual([]);
  });

  it("un fallo y un resuelto el mismo día: el resuelto no guarda nada", async () => {
    const db = database();
    await submit(db, FAILED, DAY1);
    const { result } = await submit(db, CLEAN, DAY1_LATER);
    expect(result).toEqual({ scored: false, attemptId: null });
    expect(db.rows("trainingAttempt")).toHaveLength(1);
    expect(db.rows("userActivity")).toEqual([]);
    expect(state(db)).toMatchObject({ attemptCount: 1, reviewStep: 0, firstSolvedAt: null, lastAttemptAt: DAY1 });
  });

  it("«Ver la solución» y luego resolverlo el mismo día tampoco cuenta", async () => {
    const db = database();
    expect(SHOWN).toMatchObject({ result: "FAILED", solutionShown: true, review: "failed" });
    await submit(db, SHOWN, DAY1);
    await expect(submit(db, CLEAN, DAY1_LATER)).resolves.toMatchObject({ result: { scored: false } });
    expect(db.rows("trainingAttempt")).toEqual([expect.objectContaining({ solutionShown: true })]);
    expect(db.rows("userActivity")).toEqual([]);
  });

  it("un fallo y un resuelto al día siguiente: una actividad, y el repaso sube un paso sólo desde ese día", async () => {
    const db = database();
    await submit(db, FAILED, DAY1);
    expect(state(db)).toMatchObject({ reviewStep: 0, nextReviewAt: startOf("2026-10-17") });
    const { result } = await submit(db, CLEAN, DAY2);
    expect(result).toMatchObject({ scored: true, firstSolve: true });
    expect(db.rows("userActivity")).toHaveLength(1);
    expect(state(db)).toMatchObject({ reviewStep: 1, nextReviewAt: startOf("2026-10-20"), firstSolvedAt: DAY2 });
  });

  it("un resuelto con pista entra al repaso a los tres días y no es perfecto", async () => {
    const db = database();
    await submit(db, HINTED, DAY1);
    expect(db.rows("trainingAttempt")[0]).toMatchObject({ isPerfect: false, hintsUsed: 1 });
    expect(state(db)).toMatchObject({ reviewStep: 1, nextReviewAt: startOf("2026-10-19") });
    expect(db.rows("userActivity")).toHaveLength(1);
  });

  it("el contrarreloj no mueve el repaso", async () => {
    const db = database();
    await submit(db, FAILED, DAY1);
    await submit(db, FAILED, DAY5, "STORM");
    expect(state(db)).toMatchObject({ attemptCount: 2, reviewStep: 0, nextReviewAt: startOf("2026-10-17") });
    expect(db.rows("trainingAttempt")[1]).toMatchObject({ seriesId: null, contextId: FAKE_EXERCISE_IDS.context.STORM });
  });

  it("en el contrarreloj, un ejercicio ya intentado hoy guarda su fila para la partida y nada más", async () => {
    const db = database();
    await submit(db, FAILED, DAY1);
    const { result } = await submit(db, CLEAN, DAY1_LATER, "STORM");
    expect(result).toEqual({ scored: false, attemptId: expect.any(String) });
    expect(db.rows("trainingAttempt")).toHaveLength(2);
    expect(db.rows("trainingMistake")).toHaveLength(1);
    expect(db.rows("userActivity")).toEqual([]);
    expect(state(db)).toMatchObject({ attemptCount: 1, firstSolvedAt: null, lastAttemptAt: DAY1 });
  });

  it("dos envíos a la vez el mismo día guardan uno: el segundo espera el candado y lee el primero", async () => {
    const db = database();
    const first = db.begin();
    const second = db.begin();
    const input = (outcome: AttemptOutcome) => ({
      userId: USER,
      exercise: { id: "e-1", copiedFromId: null },
      contextCode: "SERIES" as const,
      seriesId: "s-1",
      outcome,
      durationMs: null,
      now: DAY1,
    });
    // The wrong move's auto-submit and «Ver la solución», from two tabs.
    const one = recordExerciseAttempt(writer(first), input(FAILED));
    const two = recordExerciseAttempt(writer(second), input(SHOWN));
    await expect(one).resolves.toMatchObject({ scored: true });
    first.commit();
    await expect(two).resolves.toEqual({ scored: false, attemptId: null });
    second.commit();
    expect(db.rows("trainingAttempt")).toHaveLength(1);
    expect(db.rows("userExerciseState")).toHaveLength(1);
  });
});

describe("la familia de un ejercicio (D22, D28)", () => {
  /** The library original, its copy in a lesson, and a teacher's «Duplicar» of the original. */
  function familyDb() {
    return fakeExerciseDb({
      exercise: [
        { id: "orig", copiedFromId: null, lessonId: null, solutionPgn: BACK_RANK },
        { id: "copy", copiedFromId: "orig", lessonId: "l-1", solutionPgn: BACK_RANK },
        { id: "dup", copiedFromId: "orig", lessonId: null, solutionPgn: BACK_RANK },
      ],
      exerciseTopic: [{ exerciseId: "orig", topicId: T.FORK }],
    });
  }

  async function submitAt(db: ReturnType<typeof familyDb>, id: string, outcome: AttemptOutcome, now: Date) {
    const row = db.rows("exercise").find((candidate) => candidate.id === id)!;
    const tx = db.begin();
    const result = await recordExerciseAttempt(writer(tx), {
      userId: USER,
      exercise: { id, copiedFromId: row.copiedFromId as string | null, lessonId: row.lessonId as string | null },
      contextCode: id === "copy" ? "LESSON" : "SERIES",
      seriesId: id === "copy" ? null : "s-1",
      outcome,
      durationMs: 9_000,
      now,
    });
    tx.commit();
    return result;
  }

  it("la copia de una lección es su original: resolverla después de él no escribe otra actividad", async () => {
    const db = familyDb();
    await expect(submitAt(db, "orig", CLEAN, DAY1)).resolves.toMatchObject({ scored: true, firstSolve: true });
    await expect(submitAt(db, "copy", CLEAN, DAY2)).resolves.toMatchObject({ scored: true, firstSolve: false });
    const activities = db.rows("userActivity");
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({ subjectId: "orig" });
    // Both rows hold their own standing; the copy's first solve is its own date.
    expect(db.rows("userExerciseState").find((row) => row.exerciseId === "copy")).toMatchObject({
      firstSolvedAt: DAY2,
    });
  });

  it("y al revés: la copia primero cuenta con la clave del original, y el original ya no cuenta", async () => {
    const db = familyDb();
    await expect(submitAt(db, "copy", CLEAN, DAY1)).resolves.toMatchObject({ scored: true, firstSolve: true });
    expect(db.rows("userActivity")[0]).toMatchObject({ subjectId: "orig" });
    await expect(submitAt(db, "orig", CLEAN, DAY2)).resolves.toMatchObject({ scored: true, firstSolve: false });
    expect(db.rows("userActivity")).toHaveLength(1);
  });

  it("un fallo en el original y un acierto en la copia el mismo día: la copia no guarda nada", async () => {
    const db = familyDb();
    await submitAt(db, "orig", FAILED, DAY1);
    await expect(submitAt(db, "copy", CLEAN, DAY1_LATER)).resolves.toEqual({ scored: false, attemptId: null });
    expect(db.rows("trainingAttempt")).toHaveLength(1);
    expect(db.rows("userActivity")).toHaveLength(0);
  });

  it("un «Duplicar» del profesor es otro ejercicio: su familia no es la del original", async () => {
    const db = familyDb();
    await submitAt(db, "orig", CLEAN, DAY1);
    await expect(submitAt(db, "dup", CLEAN, DAY1_LATER)).resolves.toMatchObject({ scored: true, firstSolve: true });
    expect(
      db
        .rows("userActivity")
        .map((row) => row.subjectId)
        .sort(),
    ).toEqual(["dup", "orig"]);
  });
});

describe("exerciseSolveKey", () => {
  it("la copia de una lección es su original; un «Duplicar» es un ejercicio nuevo", () => {
    expect(exerciseSolveKey({ id: "copy", copiedFromId: "orig", lessonId: "l-1" })).toBe("orig");
    expect(exerciseSolveKey({ id: "dup", copiedFromId: "orig", lessonId: null })).toBe("dup");
    expect(exerciseSolveKey({ id: "dup", copiedFromId: "orig" })).toBe("dup");
    expect(exerciseSolveKey({ id: "own", copiedFromId: null, lessonId: "l-1" })).toBe("own");
  });
});

describe("isSameStudyDay", () => {
  it("cuenta el día de estudio de la Ciudad de México, no el de UTC", () => {
    expect(isSameStudyDay(DAY1, DAY1_LATER)).toBe(true);
    // 23:30 of the 16th and 00:30 of the 17th in Mexico City.
    expect(isSameStudyDay(new Date("2026-10-17T05:30:00.000Z"), new Date("2026-10-17T06:30:00.000Z"))).toBe(false);
  });
});

describe("rebuildUserExerciseState", () => {
  it("reproduce lo que escribió el escritor, saltándose lo que la puerta del día rechazó", async () => {
    const db = database();
    await submit(db, FAILED, DAY1);
    await submit(db, CLEAN, DAY1_LATER); // refused: nothing stored
    await submit(db, HINTED, DAY1_LATER, "STORM"); // stored for the run only
    await submit(db, CLEAN, DAY2);
    await submit(db, CLEAN, DAY5, "REVIEW");
    const written = state(db)!;

    const tx = db.begin();
    await expect(rebuildUserExerciseState(tx as unknown as ExerciseStateRebuilder, USER)).resolves.toBe(1);
    tx.commit();
    const rebuilt = state(db)!;
    const columns = [
      "attemptCount",
      "firstAttemptAt",
      "firstSolvedAt",
      "lastAttemptAt",
      "lastResultId",
      "reviewStep",
      "nextReviewAt",
      "lastReviewedAt",
    ];
    for (const column of columns) expect(rebuilt[column], column).toEqual(written[column]);
    expect(rebuilt).toMatchObject({ attemptCount: 3, firstSolvedAt: DAY2, lastReviewedAt: DAY5 });
  });

  it("reproduce lo que la migración de fase 2 dejó en las filas isLegacy: cuentas y fechas, sin repaso ni puerta del día", async () => {
    const R = FAKE_EXERCISE_IDS.result;
    const C = FAKE_EXERCISE_IDS.context;
    // Two attempts the same study day (the trainer gated nothing) and one the day after; one more, not legacy.
    const db = fakeExerciseDb({
      exercise: [{ id: "e-1", copiedFromId: null, solutionPgn: BACK_RANK }],
      trainingAttempt: [
        {
          id: "a-1",
          userId: USER,
          exerciseId: "e-1",
          resultId: R.FAILED,
          contextId: C.TRAINER,
          createdAt: DAY1,
          isLegacy: true,
        },
        {
          id: "a-2",
          userId: USER,
          exerciseId: "e-1",
          resultId: R.PASSED,
          contextId: C.TRAINER,
          createdAt: DAY1_LATER,
          isLegacy: true,
        },
        {
          id: "a-3",
          userId: USER,
          exerciseId: "e-1",
          resultId: R.FAILED,
          contextId: C.LESSON,
          createdAt: DAY2,
          isLegacy: true,
        },
      ],
    });
    const tx = db.begin();
    await expect(rebuildUserExerciseState(tx as unknown as ExerciseStateRebuilder, USER)).resolves.toBe(1);
    tx.commit();
    // What the migration's SQL computes: count(*), min, min FILTER PASSED, max, the last result; the review columns null.
    expect(state(db)).toMatchObject({
      attemptCount: 3,
      firstAttemptAt: DAY1,
      firstSolvedAt: DAY1_LATER,
      lastAttemptAt: DAY2,
      lastResultId: R.FAILED,
      reviewStep: null,
      nextReviewAt: null,
      lastReviewedAt: null,
    });

    // A scored attempt after them climbs from nothing, as the writer would over the migration's row.
    await submit(db, CLEAN, DAY5);
    expect(state(db)).toMatchObject({
      attemptCount: 4,
      firstSolvedAt: DAY1_LATER,
      reviewStep: null,
      lastAttemptAt: DAY5,
    });
    const again = db.begin();
    await rebuildUserExerciseState(again as unknown as ExerciseStateRebuilder, USER);
    again.commit();
    expect(state(db)).toMatchObject({
      attemptCount: 4,
      firstSolvedAt: DAY1_LATER,
      reviewStep: null,
      lastAttemptAt: DAY5,
    });
  });

  it("sin intentos, deja al alumno sin estados", async () => {
    const db = fakeExerciseDb({ userExerciseState: [{ userId: USER, exerciseId: "e-1" }] });
    const tx = db.begin();
    await expect(rebuildUserExerciseState(tx as unknown as ExerciseStateRebuilder, USER)).resolves.toBe(0);
    tx.commit();
    expect(db.rows("userExerciseState")).toEqual([]);
  });
});

describe("foldExerciseAttempt", () => {
  it("una racha de resueltos limpios gradúa el ejercicio del repaso", () => {
    let current = foldExerciseAttempt(EMPTY_EXERCISE_STATE, {
      at: DAY1,
      resultCode: "FAILED",
      resultId: 2,
      contextCode: "SERIES",
      review: "failed",
    });
    for (let step = 0; step < 5; step += 1) {
      current = foldExerciseAttempt(current, {
        at: DAY2,
        resultCode: "PASSED",
        resultId: 1,
        contextCode: "REVIEW",
        review: "clean",
      });
    }
    expect(current).toMatchObject({ reviewStep: null, nextReviewAt: null, attemptCount: 6, firstSolvedAt: DAY2 });
  });
});
