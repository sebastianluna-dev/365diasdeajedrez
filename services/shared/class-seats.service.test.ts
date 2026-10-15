import { describe, expect, it } from "vitest";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { FAKE_IDS, fakeClassDb, type FakeClient } from "@/lib/testing/fake-class-db";
import { CLASSES_NOW, cdmx } from "@/lib/testing/fixtures/classes";
import {
  countingSeatsOf,
  lockClasses,
  moveClassSeat,
  removeClassSeat,
  syncClassSeat,
  type ClassSeatsWriter,
} from "./class-seats.service";

const STUDENT = "u-valentina";
const OTHER = "u-mateo";
const STAFF = "u-staff";

function classRow(
  id: string,
  date: string,
  time: string,
  status: ClassStatusCode = CLASS_STATUS.SCHEDULED,
  extra = {},
) {
  const scheduledAt = cdmx(date, time);
  return {
    id,
    formatId: FAKE_IDS.format.INDIVIDUAL,
    capacity: null,
    statusId: FAKE_IDS.status[status],
    scheduledAt,
    durationMin: 60,
    endsAt: new Date(scheduledAt.getTime() + 60 * 60 * 1000),
    ...extra,
  };
}

const PAYMENT = { id: "pay-1", studentId: STUDENT, classCount: 2, paidOn: new Date("2026-10-01") };

function seat(classId: string, userId: string, extra = {}) {
  return { classId, userId, paymentId: null, isFree: false, attended: null, seatMovedAt: null, ...extra };
}

function writer(client: FakeClient): ClassSeatsWriter {
  return client as unknown as ClassSeatsWriter;
}

describe("syncClassSeat (add)", () => {
  it("sienta a un alumno sin pago, gratis o con su pago, y anota quién lo agregó", async () => {
    const database = fakeClassDb({ class: [classRow("c1", "2026-10-21", "19:00")], classPayment: [PAYMENT] });
    const tx = database.begin();
    await expect(
      syncClassSeat(writer(tx), {
        classId: "c1",
        studentId: STUDENT,
        coverage: "unpaid",
        addedById: STAFF,
        mode: "add",
      }),
    ).resolves.toEqual({ ok: true, paymentId: null, isFree: false });
    tx.commit();
    expect(database.rows("classParticipant")).toMatchObject([
      { classId: "c1", userId: STUDENT, paymentId: null, isFree: false, addedById: STAFF, attended: null },
    ]);

    const free = database.begin();
    await syncClassSeat(writer(free), {
      classId: "c1",
      studentId: OTHER,
      coverage: "free",
      addedById: STAFF,
      mode: "add",
    });
    // An individual class seats one: the second student does not fit.
    expect(database.rows("classParticipant")).toHaveLength(1);
  });

  it("un alumno que ya está no se escribe dos veces: se dice, sin tocar nada", async () => {
    const database = fakeClassDb({
      class: [classRow("c1", "2026-10-21", "19:00")],
      classParticipant: [seat("c1", STUDENT)],
    });
    const tx = database.begin();
    await expect(
      syncClassSeat(writer(tx), {
        classId: "c1",
        studentId: STUDENT,
        coverage: "unpaid",
        addedById: STAFF,
        mode: "add",
      }),
    ).resolves.toEqual({ ok: false, code: "studentInClass" });
    expect(tx.sql.filter((text) => !/FOR UPDATE/.test(text))).toEqual([]);
  });

  it("bloquea la clase antes de mirar quién está", async () => {
    const database = fakeClassDb({ class: [classRow("c1", "2026-10-21", "19:00")] });
    const tx = database.begin();
    await syncClassSeat(writer(tx), {
      classId: "c1",
      studentId: STUDENT,
      coverage: "unpaid",
      addedById: null,
      mode: "add",
    });
    expect(tx.sql[0]).toMatch(/^SELECT "id" FROM "Class" WHERE "id" = ANY\(<c1>\) ORDER BY "id" FOR UPDATE$/);
  });

  it("una individual admite uno y una grupal hasta su capacidad, sin contar las plazas movidas", async () => {
    const database = fakeClassDb({
      class: [
        classRow("g", "2026-10-21", "19:00", CLASS_STATUS.SCHEDULED, { formatId: FAKE_IDS.format.GROUP, capacity: 2 }),
      ],
      classParticipant: [seat("g", "u-a"), seat("g", "u-b", { attended: false, seatMovedAt: new Date() })],
    });
    const tx = database.begin();
    await expect(
      syncClassSeat(writer(tx), { classId: "g", studentId: STUDENT, coverage: "unpaid", addedById: null, mode: "add" }),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      syncClassSeat(writer(tx), { classId: "g", studentId: OTHER, coverage: "unpaid", addedById: null, mode: "add" }),
    ).resolves.toEqual({ ok: false, code: "classFull" });
  });

  it("con un pago: lo gasta hasta agotarlo, y rechaza el de otro alumno", async () => {
    const database = fakeClassDb({
      class: [
        classRow("c1", "2026-10-21", "19:00"),
        classRow("c2", "2026-10-28", "19:00"),
        classRow("c3", "2026-11-04", "19:00"),
      ],
      classPayment: [PAYMENT],
    });
    const tx = database.begin();
    const add = (classId: string, studentId = STUDENT) =>
      syncClassSeat(writer(tx), {
        classId,
        studentId,
        coverage: { paymentId: "pay-1" },
        addedById: STAFF,
        mode: "add",
      });
    await expect(add("c1")).resolves.toEqual({ ok: true, paymentId: "pay-1", isFree: false });
    await expect(add("c2")).resolves.toEqual({ ok: true, paymentId: "pay-1", isFree: false });
    await expect(add("c3")).resolves.toEqual({ ok: false, code: "seatsExhausted" });
    await expect(add("c3", OTHER)).resolves.toEqual({ ok: false, code: "paymentNotStudents" });
    expect(tx.sql).toContain('SELECT "id" FROM "ClassPayment" WHERE "id" = <pay-1> FOR UPDATE');
  });

  it("una clase cancelada devuelve la plaza: el pago vuelve a tener sitio", async () => {
    const database = fakeClassDb({
      class: [
        classRow("c1", "2026-10-21", "19:00", CLASS_STATUS.CANCELLED),
        classRow("c2", "2026-10-28", "19:00"),
        classRow("c3", "2026-11-04", "19:00"),
      ],
      classPayment: [PAYMENT],
      classParticipant: [seat("c1", STUDENT, { paymentId: "pay-1" }), seat("c2", STUDENT, { paymentId: "pay-1" })],
    });
    const tx = database.begin();
    await expect(countingSeatsOf(writer(tx), "pay-1")).resolves.toBe(1);
    await expect(
      syncClassSeat(writer(tx), {
        classId: "c3",
        studentId: STUDENT,
        coverage: { paymentId: "pay-1" },
        addedById: null,
        mode: "add",
      }),
    ).resolves.toMatchObject({ ok: true, paymentId: "pay-1" });
  });

  it("«auto» toma el pago más antiguo con clases, y sin ninguno dice que no hay", async () => {
    const old = { id: "pay-old", studentId: STUDENT, classCount: 1, paidOn: new Date("2026-09-01") };
    const database = fakeClassDb({
      class: [
        classRow("c0", "2026-09-10", "19:00", CLASS_STATUS.COMPLETED),
        classRow("c1", "2026-10-21", "19:00"),
        classRow("c2", "2026-10-28", "19:00"),
        classRow("c3", "2026-11-04", "19:00"),
      ],
      classPayment: [PAYMENT, old],
      classParticipant: [seat("c0", STUDENT, { paymentId: "pay-old", attended: true })],
    });
    const tx = database.begin();
    const add = (classId: string) =>
      syncClassSeat(writer(tx), { classId, studentId: STUDENT, coverage: "auto", addedById: null, mode: "add" });
    // The old payment is spent; the October one has two left.
    await expect(add("c1")).resolves.toMatchObject({ ok: true, paymentId: "pay-1" });
    await expect(add("c2")).resolves.toMatchObject({ ok: true, paymentId: "pay-1" });
    await expect(add("c3")).resolves.toEqual({ ok: false, code: "noPaidSeats" });
    expect(tx.sql).toContain(
      `SELECT "id" FROM "ClassPayment" WHERE "studentId" = <${STUDENT}> ORDER BY "paidOn", "id" FOR UPDATE`,
    );
  });

  it("dos registros que corren por la última plaza de un pago: uno la toma y el otro se queda sin ella", async () => {
    const database = fakeClassDb({
      class: [classRow("c1", "2026-10-21", "19:00"), classRow("c2", "2026-10-28", "19:00")],
      classPayment: [{ ...PAYMENT, classCount: 1 }],
    });
    const one = database.begin();
    const other = database.begin();
    const first = syncClassSeat(writer(one), {
      classId: "c1",
      studentId: STUDENT,
      coverage: { paymentId: "pay-1" },
      addedById: null,
      mode: "add",
    });
    const second = syncClassSeat(writer(other), {
      classId: "c2",
      studentId: STUDENT,
      coverage: { paymentId: "pay-1" },
      addedById: null,
      mode: "add",
    });
    await expect(first).resolves.toMatchObject({ ok: true });
    one.commit();
    await expect(second).resolves.toEqual({ ok: false, code: "seatsExhausted" });
    other.commit();
    expect(database.rows("classParticipant").filter((row) => row.paymentId === "pay-1")).toHaveLength(1);
  });

  it("dos registros que cubren las mismas clases en orden distinto no se bloquean entre sí", async () => {
    const database = fakeClassDb({
      class: [
        classRow("a", "2026-10-21", "19:00", CLASS_STATUS.SCHEDULED, { formatId: FAKE_IDS.format.GROUP, capacity: 4 }),
        classRow("b", "2026-10-28", "19:00", CLASS_STATUS.SCHEDULED, { formatId: FAKE_IDS.format.GROUP, capacity: 4 }),
      ],
    });
    const one = database.begin();
    const other = database.begin();
    const seatBoth = async (tx: FakeClient, order: string[], studentId: string) => {
      await lockClasses(writer(tx), order);
      for (const classId of order) {
        await syncClassSeat(writer(tx), { classId, studentId, coverage: "unpaid", addedById: null, mode: "add" });
      }
      tx.commit();
    };
    await Promise.all([seatBoth(one, ["a", "b"], STUDENT), seatBoth(other, ["b", "a"], OTHER)]);
    expect(database.rows("classParticipant")).toHaveLength(4);
    // Both lock in the same order whatever the order they were asked in.
    expect(one.sql[0]).toContain("ANY(<a,b>)");
    expect(other.sql[0]).toContain("ANY(<a,b>)");
  });
});

describe("syncClassSeat (cover)", () => {
  it("paga una plaza «sin pago», y sólo ésa", async () => {
    const database = fakeClassDb({
      class: [
        classRow("c1", "2026-10-21", "19:00"),
        classRow("c2", "2026-10-28", "19:00"),
        classRow("c3", "2026-11-04", "19:00"),
      ],
      classPayment: [PAYMENT],
      classParticipant: [
        seat("c1", STUDENT),
        seat("c2", STUDENT, { isFree: true }),
        seat("c3", STUDENT, { paymentId: "pay-1" }),
      ],
    });
    const tx = database.begin();
    const cover = (classId: string, studentId = STUDENT) =>
      syncClassSeat(writer(tx), { classId, studentId, coverage: "auto", addedById: null, mode: "cover" });
    await expect(cover("c1")).resolves.toEqual({ ok: true, paymentId: "pay-1", isFree: false });
    await expect(cover("c2")).resolves.toEqual({ ok: false, code: "seatIsFree" });
    await expect(cover("c3")).resolves.toEqual({ ok: false, code: "seatAlreadyPaid" });
    await expect(cover("c1", OTHER)).resolves.toEqual({ ok: false, code: "notInClass" });
    tx.commit();
    expect(database.rows("classParticipant").find((row) => row.classId === "c1")).toMatchObject({ paymentId: "pay-1" });
  });
});

describe("removeClassSeat", () => {
  it("quita sólo una plaza sin historia", async () => {
    const database = fakeClassDb({
      class: [classRow("c1", "2026-10-21", "19:00"), classRow("c2", "2026-10-07", "19:00", CLASS_STATUS.COMPLETED)],
      classParticipant: [seat("c1", STUDENT, { paymentId: "pay-1" }), seat("c2", STUDENT, { attended: true })],
    });
    const tx = database.begin();
    await expect(removeClassSeat(writer(tx), { classId: "c1", studentId: STUDENT })).resolves.toEqual({
      removed: true,
    });
    await expect(removeClassSeat(writer(tx), { classId: "c2", studentId: STUDENT })).resolves.toEqual({
      removed: false,
    });
    tx.commit();
    expect(database.rows("classParticipant")).toHaveLength(1);
  });
});

describe("moveClassSeat", () => {
  const done = classRow("done", "2026-10-07", "17:00", CLASS_STATUS.COMPLETED);
  const target = classRow("target", "2026-10-21", "17:00");

  it("mueve la plaza de quien faltó con la misma cobertura, y la vieja deja de contar", async () => {
    const database = fakeClassDb({
      class: [done, target],
      classPayment: [{ ...PAYMENT, classCount: 1 }],
      classParticipant: [seat("done", STUDENT, { paymentId: "pay-1", attended: false })],
    });
    const tx = database.begin();
    await expect(
      moveClassSeat(writer(tx), {
        fromClassId: "done",
        studentId: STUDENT,
        toClassId: "target",
        note: "Te la reponemos.",
        actorId: STAFF,
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ ok: true });
    tx.commit();
    const rows = database.rows("classParticipant");
    expect(rows.find((row) => row.classId === "done")).toMatchObject({
      attended: false,
      seatMovedAt: CLASSES_NOW,
      seatMovedById: STAFF,
      seatMovedToClassId: "target",
      seatMoveNote: "Te la reponemos.",
    });
    expect(rows.find((row) => row.classId === "target")).toMatchObject({
      paymentId: "pay-1",
      isFree: false,
      addedById: STAFF,
    });
    await expect(countingSeatsOf(writer(database.begin()), "pay-1")).resolves.toBe(1);
    expect(tx.sql[0]).toContain("ANY(<done,target>)");
  });

  it("o la deja por programar en su pago", async () => {
    const database = fakeClassDb({
      class: [done],
      classParticipant: [seat("done", STUDENT, { paymentId: "pay-1", attended: false })],
    });
    const tx = database.begin();
    await expect(
      moveClassSeat(writer(tx), {
        fromClassId: "done",
        studentId: STUDENT,
        toClassId: null,
        note: null,
        actorId: STAFF,
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ ok: true });
    tx.commit();
    expect(database.rows("classParticipant")[0]).toMatchObject({ seatMovedAt: CLASSES_NOW, seatMovedToClassId: null });
  });

  it("sólo se mueve una falta de una clase terminada", async () => {
    const database = fakeClassDb({
      class: [done, target],
      classParticipant: [seat("done", STUDENT, { attended: true }), seat("target", OTHER, { attended: null })],
    });
    const tx = database.begin();
    await expect(
      moveClassSeat(writer(tx), {
        fromClassId: "done",
        studentId: STUDENT,
        toClassId: null,
        note: null,
        actorId: STAFF,
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ ok: false, code: "seatNotMovable" });
    await expect(
      moveClassSeat(writer(tx), {
        fromClassId: "target",
        studentId: OTHER,
        toClassId: null,
        note: null,
        actorId: STAFF,
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ ok: false, code: "seatNotMovable" });
  });

  it("si el destino la rechaza, deshace la marca y no escribe nada", async () => {
    const database = fakeClassDb({
      class: [done, target],
      classParticipant: [seat("done", STUDENT, { attended: false }), seat("target", OTHER)],
    });
    const tx = database.begin();
    await expect(
      moveClassSeat(writer(tx), {
        fromClassId: "done",
        studentId: STUDENT,
        toClassId: "target",
        note: null,
        actorId: STAFF,
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ ok: false, code: "classFull" });
    tx.commit();
    expect(database.rows("classParticipant").find((row) => row.classId === "done")).toMatchObject({
      seatMovedAt: null,
      seatMovedToClassId: null,
    });
    expect(database.rows("classParticipant")).toHaveLength(2);
  });
});
