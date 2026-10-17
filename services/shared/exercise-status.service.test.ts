import { describe, expect, it } from "vitest";
import type { ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";
import { FAKE_EXERCISE_IDS, fakeExerciseDb, type FakeExerciseClient } from "@/lib/testing/fake-exercise-db";
import {
  exerciseStatusIds,
  initialExerciseStatusData,
  reviewLibraryExercise,
  transitionOwnExercise,
  type ExerciseStatusWriter,
} from "./exercise-status.service";

function writer(client: FakeExerciseClient): ExerciseStatusWriter {
  return client as unknown as ExerciseStatusWriter;
}

const S = FAKE_EXERCISE_IDS.status;
const NOW = new Date("2026-10-16T18:00:00.000Z");
const EARLIER = new Date("2026-09-01T18:00:00.000Z");
const BACK_RANK = '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n1. Rd8# *';
const NO_MOVES = '[SetUp "1"]\n[FEN "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1"]\n\n*';

function exercise(status: keyof typeof S, overrides: Record<string, unknown> = {}) {
  return {
    id: "e-1",
    teacherId: "t-1",
    statusId: S[status],
    kindId: FAKE_EXERCISE_IDS.kind.SEQUENCE,
    mateIn: null,
    title: "Mate del pasillo",
    solutionPgn: BACK_RANK,
    explanation: null,
    difficulty: 1000,
    ...overrides,
  };
}

const TOPIC = [{ exerciseId: "e-1", topicId: FAKE_EXERCISE_IDS.topic.FORK }];

describe("initialExerciseStatusData", () => {
  it("todo ejercicio nace en borrador", async () => {
    const tx = fakeExerciseDb().begin();
    expect(initialExerciseStatusData(await exerciseStatusIds(writer(tx)))).toEqual({ statusId: S.DRAFT });
  });
});

describe("transitionOwnExercise", () => {
  it("el profesor marca como listo un borrador preparado", async () => {
    const database = fakeExerciseDb({ exercise: [exercise("DRAFT")], exerciseTopic: TOPIC });
    const tx = database.begin();
    await expect(
      transitionOwnExercise(writer(tx), {
        exerciseId: "e-1",
        teacherId: "t-1",
        actorUserId: "u-t",
        to: "READY",
        now: NOW,
      }),
    ).resolves.toEqual({ ok: true, from: "DRAFT" });
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.READY, reviewedAt: null, publishedAt: null });
  });

  it("no lo marca sin tema ni con una solución sin jugadas, y dice por qué", async () => {
    const database = fakeExerciseDb({ exercise: [exercise("DRAFT", { solutionPgn: NO_MOVES })] });
    const tx = database.begin();
    const result = await transitionOwnExercise(writer(tx), {
      exerciseId: "e-1",
      teacherId: "t-1",
      actorUserId: "u-t",
      to: "READY",
      now: NOW,
    });
    expect(result).toMatchObject({ ok: false, code: "notReady", readiness: { missing: ["topic"] } });
    expect(result.ok === false && result.code === "notReady" && result.readiness.solution).toContainEqual({
      code: "noMoves",
    });
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.DRAFT });
  });

  it("el ejercicio de otro profesor, o el de la academia, no existe para él", async () => {
    const database = fakeExerciseDb({
      exercise: [exercise("DRAFT"), exercise("DRAFT", { id: "e-2", teacherId: null })],
      exerciseTopic: TOPIC,
    });
    const tx = database.begin();
    const ask = (exerciseId: string, teacherId: string) =>
      transitionOwnExercise(writer(tx), { exerciseId, teacherId, actorUserId: "u-t", to: "READY", now: NOW });
    await expect(ask("e-1", "t-2")).resolves.toEqual({ ok: false, code: "notFound" });
    await expect(ask("e-2", "t-1")).resolves.toEqual({ ok: false, code: "notFound" });
  });

  it("proponer a la biblioteca pide la explicación, sella el envío y borra la nota de una devolución anterior", async () => {
    const database = fakeExerciseDb({
      exercise: [exercise("READY", { reviewNote: "Falta la explicación." })],
      exerciseTopic: TOPIC,
    });
    let tx = database.begin();
    const propose = () =>
      transitionOwnExercise(writer(tx), {
        exerciseId: "e-1",
        teacherId: "t-1",
        actorUserId: "u-t",
        to: "IN_REVIEW",
        now: NOW,
      });
    await expect(propose()).resolves.toMatchObject({
      ok: false,
      code: "notReady",
      readiness: { missing: ["explanation"] },
    });
    await tx.exercise.updateMany({ where: { id: "e-1" }, data: { explanation: "Ab8 no existe." } });
    tx.commit();

    tx = database.begin();
    await expect(propose()).resolves.toEqual({ ok: true, from: "READY" });
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.IN_REVIEW, submittedAt: NOW, reviewNote: null });
  });

  it("el profesor nunca publica", async () => {
    const database = fakeExerciseDb({ exercise: [exercise("IN_REVIEW", { explanation: "x" })], exerciseTopic: TOPIC });
    const tx = database.begin();
    await expect(
      transitionOwnExercise(writer(tx), {
        exerciseId: "e-1",
        teacherId: "t-1",
        actorUserId: "u-t",
        to: "PUBLISHED",
        now: NOW,
      }),
    ).resolves.toEqual({ ok: false, code: "notAllowed" });
  });

  it("de dos pasos que se cruzan, el segundo no escribe", async () => {
    const database = fakeExerciseDb({ exercise: [exercise("READY")], exerciseTopic: TOPIC });
    const archive = (tx: FakeExerciseClient) =>
      transitionOwnExercise(writer(tx), {
        exerciseId: "e-1",
        teacherId: "t-1",
        actorUserId: "u-t",
        to: "ARCHIVED",
        now: NOW,
      });
    const second = database.begin();
    const write = second.exercise.updateMany;
    second.exercise.updateMany = async (args) => {
      // The first move commits between the second's read and its write.
      const first = database.begin();
      await expect(archive(first)).resolves.toMatchObject({ ok: true });
      first.commit();
      return write(args);
    };
    await expect(archive(second)).resolves.toEqual({ ok: false, code: "changed" });
    second.commit();
    expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.ARCHIVED });
  });
});

describe("reviewLibraryExercise", () => {
  const approve = (tx: FakeExerciseClient, to: ExerciseStatusCode, note: string | null = null) =>
    reviewLibraryExercise(writer(tx), { exerciseId: "e-1", reviewerUserId: "u-s", to, note, now: NOW });

  it("el staff aprueba: quién, cuándo y la primera publicación", async () => {
    const database = fakeExerciseDb({ exercise: [exercise("IN_REVIEW", { explanation: "x" })], exerciseTopic: TOPIC });
    const tx = database.begin();
    await expect(approve(tx, "PUBLISHED")).resolves.toEqual({ ok: true, from: "IN_REVIEW" });
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({
      statusId: S.PUBLISHED,
      reviewedAt: NOW,
      reviewedById: "u-s",
      publishedAt: NOW,
    });
  });

  it("devolver pide la nota y la deja", async () => {
    const database = fakeExerciseDb({ exercise: [exercise("IN_REVIEW", { explanation: "x" })], exerciseTopic: TOPIC });
    const tx = database.begin();
    await expect(approve(tx, "READY", "  ")).resolves.toEqual({ ok: false, code: "noteRequired" });
    await expect(approve(tx, "READY", "La variante 2 no es mate.")).resolves.toMatchObject({ ok: true });
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({
      statusId: S.READY,
      reviewNote: "La variante 2 no es mate.",
      publishedAt: null,
    });
  });

  it("quitar de la biblioteca conserva la primera publicación", async () => {
    const database = fakeExerciseDb({
      exercise: [exercise("PUBLISHED", { explanation: "x", publishedAt: EARLIER })],
      exerciseTopic: TOPIC,
    });
    const tx = database.begin();
    await expect(approve(tx, "READY", "Ya hay uno igual.")).resolves.toMatchObject({ ok: true });
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.READY, publishedAt: EARLIER });
  });

  it("publicar otra vez no cambia la fecha de la primera", async () => {
    const database = fakeExerciseDb({
      exercise: [exercise("IN_REVIEW", { explanation: "x", publishedAt: EARLIER })],
      exerciseTopic: TOPIC,
    });
    const tx = database.begin();
    await approve(tx, "PUBLISHED");
    tx.commit();
    expect(database.rows("exercise")[0]).toMatchObject({ publishedAt: EARLIER, reviewedAt: NOW });
  });

  it("el de la academia se publica sin revisión, si está preparado", async () => {
    const database = fakeExerciseDb({ exercise: [exercise("DRAFT", { teacherId: null })], exerciseTopic: TOPIC });
    const tx = database.begin();
    await expect(approve(tx, "PUBLISHED")).resolves.toMatchObject({ ok: true, from: "DRAFT" });
    await expect(approve(tx, "READY", "x")).resolves.toEqual({ ok: false, code: "notAllowed" });
  });

  describe("el de una lección (fase 2)", () => {
    const inLesson = { teacherId: null, lessonId: "l-1", lessonOrder: 2 };

    it("el staff lo publica si está preparado, y lo devuelve a borrador; nunca a listo ni a revisión", async () => {
      const database = fakeExerciseDb({ exercise: [exercise("DRAFT", inLesson)], exerciseTopic: TOPIC });
      const tx = database.begin();
      await expect(approve(tx, "PUBLISHED")).resolves.toMatchObject({ ok: true, from: "DRAFT" });
      tx.commit();
      expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.PUBLISHED, lessonOrder: 2, publishedAt: NOW });
      const back = database.begin();
      await expect(approve(back, "DRAFT")).resolves.toMatchObject({ ok: true, from: "PUBLISHED" });
      await expect(approve(back, "READY")).resolves.toEqual({ ok: false, code: "notAllowed" });
      await expect(approve(back, "IN_REVIEW")).resolves.toEqual({ ok: false, code: "notAllowed" });
      back.commit();
      // The first publication is kept, as for every exercise.
      expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.DRAFT, lessonOrder: 2, publishedAt: NOW });
    });

    it("archivarlo le quita su lugar en la lección y conserva la fila", async () => {
      for (const from of ["DRAFT", "PUBLISHED"] as const) {
        const database = fakeExerciseDb({ exercise: [exercise(from, inLesson)] });
        const tx = database.begin();
        await expect(approve(tx, "ARCHIVED")).resolves.toMatchObject({ ok: true, from });
        tx.commit();
        expect(database.rows("exercise")[0]).toMatchObject({
          statusId: S.ARCHIVED,
          lessonId: "l-1",
          lessonOrder: null,
        });
      }
    });

    it("restaurarlo lo devuelve a borrador con el lugar que le dan, al final; sin lugar no escribe", async () => {
      const archived = exercise("ARCHIVED", { ...inLesson, lessonOrder: null, publishedAt: EARLIER });
      const database = fakeExerciseDb({ exercise: [archived] });
      await expect(approve(database.begin(), "DRAFT")).rejects.toThrow(/lessonOrder/);
      expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.ARCHIVED, lessonOrder: null });

      const tx = database.begin();
      await expect(
        reviewLibraryExercise(writer(tx), {
          exerciseId: "e-1",
          reviewerUserId: "u-s",
          to: "DRAFT",
          note: null,
          now: NOW,
          lessonOrder: 4,
        }),
      ).resolves.toEqual({ ok: true, from: "ARCHIVED" });
      tx.commit();
      expect(database.rows("exercise")[0]).toMatchObject({
        statusId: S.DRAFT,
        lessonId: "l-1",
        lessonOrder: 4,
        reviewedById: "u-s",
        // The first publication stays: it was once what the students saw.
        publishedAt: EARLIER,
      });
      // Never straight back to PUBLISHED: the staff publishes it again from the draft.
      const again = fakeExerciseDb({ exercise: [archived] });
      await expect(
        reviewLibraryExercise(writer(again.begin()), {
          exerciseId: "e-1",
          reviewerUserId: "u-s",
          to: "PUBLISHED",
          note: null,
          now: NOW,
          lessonOrder: 1,
        }),
      ).resolves.toEqual({ ok: false, code: "notAllowed" });
    });

    it("el lugar que llega con otro paso no se escribe", async () => {
      const database = fakeExerciseDb({ exercise: [exercise("DRAFT", inLesson)], exerciseTopic: TOPIC });
      const tx = database.begin();
      await expect(
        reviewLibraryExercise(writer(tx), {
          exerciseId: "e-1",
          reviewerUserId: "u-s",
          to: "PUBLISHED",
          note: null,
          now: NOW,
          lessonOrder: 9,
        }),
      ).resolves.toMatchObject({ ok: true });
      tx.commit();
      expect(database.rows("exercise")[0]).toMatchObject({ statusId: S.PUBLISHED, lessonOrder: 2 });
    });

    it("sin preparar, no se publica, y dice qué le falta", async () => {
      const database = fakeExerciseDb({ exercise: [exercise("DRAFT", inLesson)] });
      await expect(approve(database.begin(), "PUBLISHED")).resolves.toMatchObject({
        ok: false,
        code: "notReady",
        readiness: { missing: ["topic"] },
      });
    });

    it("para un profesor no existe: nunca es suyo", async () => {
      const database = fakeExerciseDb({ exercise: [exercise("DRAFT", inLesson)], exerciseTopic: TOPIC });
      await expect(
        transitionOwnExercise(writer(database.begin()), {
          exerciseId: "e-1",
          teacherId: "t-1",
          actorUserId: "u-t",
          to: "READY",
          now: NOW,
        }),
      ).resolves.toEqual({ ok: false, code: "notFound" });
    });
  });
});
