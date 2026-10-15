import { describe, expect, it } from "vitest";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { FAKE_IDS, fakeClassDb, type FakeClient } from "@/lib/testing/fake-class-db";
import { CLASSES_NOW, cdmx } from "@/lib/testing/fixtures/classes";
import { recordAttendance, type AttendanceWriter, type RecordAttendanceInput } from "./class-attendance.service";

const TEACHER = "u-teacher";
const STAFF = "u-staff";
const A = "u-a";
const B = "u-b";

function classRow(
  id: string,
  date: string,
  time: string,
  status: ClassStatusCode = CLASS_STATUS.SCHEDULED,
  meetingUrl: string | null = null,
) {
  const scheduledAt = cdmx(date, time);
  return {
    id,
    statusId: FAKE_IDS.status[status],
    scheduledAt,
    durationMin: 60,
    endsAt: new Date(scheduledAt.getTime() + 60 * 60 * 1000),
    meetingUrl,
    meetingUrlVisibleFrom: null,
    attendanceTakenAt: null,
  };
}

function seat(classId: string, userId: string, extra = {}) {
  return { classId, userId, paymentId: null, isFree: false, attended: null, seatMovedAt: null, ...extra };
}

function writer(client: FakeClient): AttendanceWriter {
  return client as unknown as AttendanceWriter;
}

// The class ended at 11:00 of the example day; it is 11:40: «Por finalizar».
const ENDED = classRow("ended", "2026-10-14", "10:00");
const teacher = { userId: TEACHER, role: "teacher" as const };
const staff = { userId: STAFF, role: "staff" as const };

function finalize(marks: RecordAttendanceInput["marks"], classId = "ended"): RecordAttendanceInput {
  return { classId, marks, actor: teacher, mode: "finalize", reason: null, now: CLASSES_NOW };
}

describe("recordAttendance (finalize)", () => {
  it("escribe cada marca, su fila del registro, la actividad de quien asistió y la hora de pasar lista", async () => {
    const database = fakeClassDb({ class: [ENDED], classParticipant: [seat("ended", A), seat("ended", B)] });
    const tx = database.begin();
    await expect(
      recordAttendance(
        writer(tx),
        finalize([
          { studentId: A, attended: true },
          { studentId: B, attended: false },
        ]),
      ),
    ).resolves.toEqual({ ok: true, changed: 2 });
    tx.commit();

    expect(database.rows("classParticipant").map((row) => [row.userId, row.attended])).toEqual([
      [A, true],
      [B, false],
    ]);
    expect(database.rows("classAttendanceChange")).toMatchObject([
      {
        userId: A,
        fromAttended: null,
        toAttended: true,
        changedById: TEACHER,
        isOverride: false,
        changedAt: CLASSES_NOW,
      },
      { userId: B, fromAttended: null, toAttended: false, changedById: TEACHER, isOverride: false },
    ]);
    expect(database.rows("userActivity")).toMatchObject([
      { userId: A, subjectId: "ended", occurredAt: ENDED.scheduledAt },
    ]);
    expect(database.rows("class")[0]).toMatchObject({ attendanceTakenAt: CLASSES_NOW });
    expect(tx.sql[0]).toMatch(/FROM "Class" WHERE "id" = ANY\(<ended>\) ORDER BY "id" FOR UPDATE/);
  });

  it("al finalizar, toda plaza no movida lleva marca; una movida no la necesita ni la admite", async () => {
    const database = fakeClassDb({
      class: [ENDED],
      classParticipant: [seat("ended", A), seat("ended", B, { attended: false, seatMovedAt: new Date() })],
    });
    const tx = database.begin();
    await expect(recordAttendance(writer(tx), finalize([]))).resolves.toEqual({ ok: false, code: "missingMark" });
    await expect(
      recordAttendance(
        writer(tx),
        finalize([
          { studentId: A, attended: true },
          { studentId: B, attended: true },
        ]),
      ),
    ).resolves.toEqual({ ok: false, code: "seatMoved" });
    await expect(recordAttendance(writer(tx), finalize([{ studentId: A, attended: true }]))).resolves.toMatchObject({
      ok: true,
    });
  });

  it("no se pasa lista antes de empezar ni en una cancelada, ni a quien no está", async () => {
    const database = fakeClassDb({
      class: [
        classRow("soon", "2026-10-14", "12:00"),
        classRow("off", "2026-10-07", "12:00", CLASS_STATUS.CANCELLED),
        ENDED,
      ],
      classParticipant: [seat("soon", A), seat("off", A), seat("ended", A)],
    });
    const tx = database.begin();
    await expect(recordAttendance(writer(tx), finalize([{ studentId: A, attended: true }], "soon"))).resolves.toEqual({
      ok: false,
      code: "notStarted",
    });
    await expect(recordAttendance(writer(tx), finalize([{ studentId: A, attended: true }], "off"))).resolves.toEqual({
      ok: false,
      code: "classCancelled",
    });
    await expect(
      recordAttendance(
        writer(tx),
        finalize([
          { studentId: A, attended: true },
          { studentId: B, attended: true },
        ]),
      ),
    ).resolves.toEqual({ ok: false, code: "notInClass" });
  });

  it("administración finaliza en nombre del profesor sólo con motivo, y su marca no cierra la del profesor", async () => {
    const database = fakeClassDb({ class: [ENDED], classParticipant: [seat("ended", A)] });
    const tx = database.begin();
    const byStaff = (reason: string | null) =>
      recordAttendance(writer(tx), { ...finalize([{ studentId: A, attended: true }]), actor: staff, reason });
    await expect(byStaff(null)).resolves.toEqual({ ok: false, code: "reasonRequired" });
    await expect(byStaff("El profesor no pudo entrar a la plataforma.")).resolves.toMatchObject({ ok: true });
    expect((await tx.classAttendanceChange.findMany({}))[0]).toMatchObject({ isOverride: false, changedById: STAFF });
  });

  it("la misma marca dos veces no duplica la actividad, y desmarcar no la elimina", async () => {
    const database = fakeClassDb({ class: [ENDED], classParticipant: [seat("ended", A)] });
    const tx = database.begin();
    await recordAttendance(writer(tx), finalize([{ studentId: A, attended: true }]));
    // The second finalize changes nothing and logs nothing.
    await expect(recordAttendance(writer(tx), finalize([{ studentId: A, attended: true }]))).resolves.toEqual({
      ok: true,
      changed: 0,
    });
    tx.commit();
    expect(database.rows("classAttendanceChange")).toHaveLength(1);
    expect(database.rows("userActivity")).toHaveLength(1);

    const later = database.begin();
    await later.class.updateMany({ where: { id: "ended" }, data: { statusId: FAKE_IDS.status.COMPLETED } });
    await expect(
      recordAttendance(writer(later), { ...finalize([{ studentId: A, attended: false }]), mode: "change" }),
    ).resolves.toEqual({ ok: true, changed: 1 });
    await expect(
      recordAttendance(writer(later), { ...finalize([{ studentId: A, attended: true }]), mode: "change" }),
    ).resolves.toEqual({ ok: true, changed: 1 });
    later.commit();
    expect(database.rows("userActivity")).toHaveLength(1);
    expect(database.rows("classAttendanceChange")).toHaveLength(3);
  });
});

describe("recordAttendance (change and override)", () => {
  const DONE = {
    ...classRow("done", "2026-10-07", "12:00", CLASS_STATUS.COMPLETED),
    attendanceTakenAt: cdmx("2026-10-07", "13:05"),
  };

  it("el modo tiene que ser el que la regla da al papel en esa fase", async () => {
    const database = fakeClassDb({ class: [DONE], classParticipant: [seat("done", A, { attended: false })] });
    const tx = database.begin();
    const base = { classId: "done", marks: [{ studentId: A, attended: true }], reason: null, now: CLASSES_NOW };
    await expect(recordAttendance(writer(tx), { ...base, actor: teacher, mode: "finalize" })).resolves.toEqual({
      ok: false,
      code: "notAllowed",
    });
    await expect(recordAttendance(writer(tx), { ...base, actor: staff, mode: "change", reason: "x" })).resolves.toEqual(
      { ok: false, code: "notAllowed" },
    );
    await expect(recordAttendance(writer(tx), { ...base, actor: teacher, mode: "change" })).resolves.toMatchObject({
      ok: true,
    });
  });

  it("una marca que administración corrigió queda cerrada para el profesor, con el motivo registrado", async () => {
    const database = fakeClassDb({ class: [DONE], classParticipant: [seat("done", A, { attended: false })] });
    const tx = database.begin();
    await expect(
      recordAttendance(writer(tx), {
        classId: "done",
        marks: [{ studentId: A, attended: true }],
        actor: staff,
        mode: "override",
        reason: "Estuvo conectado; se le cayó el audio.",
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ ok: true, changed: 1 });
    tx.commit();
    expect(database.rows("classAttendanceChange")[0]).toMatchObject({
      fromAttended: false,
      toAttended: true,
      isOverride: true,
      reason: "Estuvo conectado; se le cayó el audio.",
    });
    expect(database.rows("userActivity")).toHaveLength(1);

    const again = database.begin();
    await expect(
      recordAttendance(writer(again), {
        classId: "done",
        marks: [{ studentId: A, attended: false }],
        actor: teacher,
        mode: "change",
        reason: null,
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ ok: false, code: "markLocked" });
  });
});
