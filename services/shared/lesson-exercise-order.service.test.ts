import { describe, expect, it } from "vitest";
import { FAKE_EXERCISE_IDS, fakeExerciseDb, type FakeExerciseClient } from "@/lib/testing/fake-exercise-db";
import { createExerciseRecord, exerciseCopyInput, type ExerciseRecordWriter } from "./exercise-record.service";
import {
  closeLessonExerciseOrderGaps,
  nextLessonExerciseOrder,
  type LessonExerciseOrderWriter,
} from "./lesson-exercise-order.service";
import { reviewLibraryExercise, type ExerciseStatusWriter } from "./exercise-status.service";

const asPlaces = (client: FakeExerciseClient) => client as unknown as LessonExerciseOrderWriter;

// The places of a lesson's exercises after an archive (found 2026-10-16): the
// archive of a middle one left the list 1, 3 and `count + 1` collided for
// ever. Replayed here on the fake client, end to end through the writers the
// actions call: archive, close the gap, insert at the next place.

const S = FAKE_EXERCISE_IDS.status;
const NOW = new Date("2026-10-16T18:00:00.000Z");
const BACK_RANK = '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n1. Rd8# *';

const lessonExercise = (id: string, lessonOrder: number) => ({
  id,
  teacherId: null,
  lessonId: "l-1",
  lessonOrder,
  statusId: S.PUBLISHED,
  kindId: FAKE_EXERCISE_IDS.kind.SEQUENCE,
  mateIn: null,
  title: `Ejercicio ${lessonOrder}`,
  solutionPgn: BACK_RANK,
  explanation: null,
  difficulty: 1000,
  publishedAt: NOW,
});

const orders = (db: ReturnType<typeof fakeExerciseDb>) =>
  db
    .rows("exercise")
    .filter((row) => row.lessonId === "l-1")
    .map((row) => [row.id, row.lessonOrder] as const)
    .sort(([left], [right]) => String(left).localeCompare(String(right)));

/** What `archiveLessonExercise` does inside its transaction. */
async function archive(tx: FakeExerciseClient, exerciseId: string) {
  const result = await reviewLibraryExercise(tx as unknown as ExerciseStatusWriter, {
    exerciseId,
    reviewerUserId: "u-s",
    to: "ARCHIVED",
    note: null,
    now: NOW,
  });
  expect(result).toMatchObject({ ok: true });
  await closeLessonExerciseOrderGaps(asPlaces(tx), "l-1");
}

const CONTENT = {
  title: "Nuevo",
  prompt: null,
  difficulty: 1200,
  hints: [],
  explanation: null,
  sourceWhite: null,
  sourceBlack: null,
  sourceEvent: null,
  sourceYear: null,
  topicCodes: ["FORK"],
};

describe("nextLessonExerciseOrder", () => {
  it("es uno más que el lugar más alto, no `count + 1`: un hueco nunca lo hace chocar", async () => {
    const db = fakeExerciseDb({ exercise: [lessonExercise("a", 1), lessonExercise("c", 3)] });
    await expect(nextLessonExerciseOrder(asPlaces(db.begin()), "l-1")).resolves.toBe(4);
    await expect(nextLessonExerciseOrder(asPlaces(db.begin()), "l-2")).resolves.toBe(1);
  });

  it("no cuenta los archivados, que no tienen lugar", async () => {
    const db = fakeExerciseDb({
      exercise: [lessonExercise("a", 1), { ...lessonExercise("z", 9), lessonOrder: null, statusId: S.ARCHIVED }],
    });
    await expect(nextLessonExerciseOrder(asPlaces(db.begin()), "l-1")).resolves.toBe(2);
  });
});

describe("archivar uno de en medio", () => {
  it("cierra el hueco en la misma transacción, y el siguiente que se guarda toma el lugar libre", async () => {
    const db = fakeExerciseDb({
      exercise: [lessonExercise("a", 1), lessonExercise("b", 2), lessonExercise("c", 3)],
    });
    const tx = db.begin();
    await archive(tx, "b");
    tx.commit();
    expect(orders(db)).toEqual([
      ["a", 1],
      ["b", null],
      ["c", 2],
    ]);

    // What `saveLessonExercise` does for a new one.
    const save = db.begin();
    const order = await nextLessonExerciseOrder(asPlaces(save), "l-1");
    expect(order).toBe(3);
    const created = await createExerciseRecord(save as unknown as ExerciseRecordWriter, {
      teacherId: null,
      lesson: { lessonId: "l-1", lessonOrder: order },
      authorUserId: "u-s",
      solution: { solutionPgn: BACK_RANK, kind: "SEQUENCE", mateIn: null },
      content: CONTENT,
    });
    expect(created).toMatchObject({ ok: true });
    save.commit();
    const places = db
      .rows("exercise")
      .filter((row) => row.lessonId === "l-1" && row.lessonOrder !== null)
      .map((row) => row.lessonOrder)
      .sort();
    expect(places).toEqual([1, 2, 3]);
  });

  it("y lo mismo para la copia desde la biblioteca", async () => {
    const db = fakeExerciseDb({
      exercise: [
        lessonExercise("a", 1),
        lessonExercise("b", 2),
        lessonExercise("c", 3),
        { ...lessonExercise("lib", 0), lessonId: null, lessonOrder: null },
      ],
    });
    const tx = db.begin();
    await archive(tx, "a");
    tx.commit();
    expect(orders(db)).toEqual([
      ["a", null],
      ["b", 1],
      ["c", 2],
    ]);

    // What `copyLibraryExerciseToLesson` does.
    const copy = db.begin();
    const created = await createExerciseRecord(copy as unknown as ExerciseRecordWriter, {
      teacherId: null,
      lesson: { lessonId: "l-1", lessonOrder: await nextLessonExerciseOrder(asPlaces(copy), "l-1") },
      authorUserId: "u-s",
      ...exerciseCopyInput({ ...CONTENT, solutionPgn: BACK_RANK, kind: "SEQUENCE", mateIn: null, id: "lib" }),
    });
    expect(created).toMatchObject({ ok: true });
    copy.commit();
    const copied = db.rows("exercise").find((row) => row.copiedFromId === "lib");
    expect(copied).toMatchObject({ lessonId: "l-1", lessonOrder: 3 });
  });

  it("archivar el último no mueve a nadie", async () => {
    const db = fakeExerciseDb({ exercise: [lessonExercise("a", 1), lessonExercise("b", 2)] });
    const tx = db.begin();
    await archive(tx, "b");
    expect(tx.log.filter((entry) => entry === "exercise.updateMany")).toHaveLength(1);
    tx.commit();
    expect(orders(db)).toEqual([
      ["a", 1],
      ["b", null],
    ]);
  });
});
