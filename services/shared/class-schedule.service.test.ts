import { describe, expect, it } from "vitest";
import { CLASS_FORMAT, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { FAKE_IDS, fakeClassDb, type FakeClient } from "@/lib/testing/fake-class-db";
import { CLASSES_NOW, cdmx } from "@/lib/testing/fixtures/classes";
import {
  classMeetingColumns,
  classScheduleColumns,
  createClassRecord,
  syncClassMeeting,
  syncClassSchedule,
  type ClassScheduleWriter,
} from "./class-schedule.service";

function writer(client: FakeClient): ClassScheduleWriter {
  return client as unknown as ClassScheduleWriter;
}

const PROVIDERS = new Map([
  ["ZOOM", 1],
  ["MEET", 2],
  ["OTHER", 3],
] as const);

const base = {
  teacherId: "t-1",
  formatCode: CLASS_FORMAT.INDIVIDUAL,
  capacity: null,
  title: "Repaso de la Najdorf",
  description: null,
  scheduledAt: cdmx("2026-10-21", "19:00"),
  durationMin: 60,
  meetingUrl: "https://zoom.us/j/11111111111",
  meetingVisibleFromChosen: null,
  createdById: "u-staff",
};

describe("classScheduleColumns y classMeetingColumns", () => {
  it("el fin es el inicio más la duración; la plataforma sale del enlace", () => {
    expect(classScheduleColumns(cdmx("2026-10-21", "19:00"), 90)).toEqual({
      scheduledAt: cdmx("2026-10-21", "19:00"),
      durationMin: 90,
      endsAt: cdmx("2026-10-21", "20:30"),
    });
    expect(
      classMeetingColumns({ meetingUrl: "https://meet.google.com/abc", visibleFromChosen: null }, PROVIDERS),
    ).toEqual({
      meetingUrl: "https://meet.google.com/abc",
      meetingProviderId: 2,
      meetingUrlVisibleFrom: null,
    });
    // No link: no platform and no instant, whatever was chosen.
    expect(
      classMeetingColumns({ meetingUrl: null, visibleFromChosen: cdmx("2026-10-21", "18:00") }, PROVIDERS),
    ).toEqual({
      meetingUrl: null,
      meetingProviderId: null,
      meetingUrlVisibleFrom: null,
    });
    // A platform that is not active falls back to «Otro».
    expect(
      classMeetingColumns({ meetingUrl: "https://zoom.us/j/1", visibleFromChosen: null }, new Map([["OTHER", 3]]))
        .meetingProviderId,
    ).toBe(3);
  });
});

describe("createClassRecord", () => {
  it("crea la clase programada con sus columnas derivadas y quién la creó", async () => {
    const database = fakeClassDb();
    const tx = database.begin();
    const created = await createClassRecord(writer(tx), base);
    expect(created).toMatchObject({ ok: true });
    tx.commit();
    expect(database.rows("class")[0]).toMatchObject({
      teacherId: "t-1",
      formatId: FAKE_IDS.format.INDIVIDUAL,
      capacity: null,
      title: "Repaso de la Najdorf",
      scheduledAt: base.scheduledAt,
      endsAt: cdmx("2026-10-21", "20:00"),
      statusId: FAKE_IDS.status.SCHEDULED,
      meetingProviderId: FAKE_IDS.provider.ZOOM,
      meetingUrlVisibleFrom: null,
      createdById: "u-staff",
    });
  });

  it("una grupal necesita título y capacidad; un enlace que abre tarde es un error", async () => {
    const tx = fakeClassDb().begin();
    await expect(
      createClassRecord(writer(tx), { ...base, formatCode: CLASS_FORMAT.GROUP, capacity: 6, title: " " }),
    ).resolves.toEqual({ ok: false, code: "groupTitle" });
    await expect(
      createClassRecord(writer(tx), { ...base, formatCode: CLASS_FORMAT.GROUP, capacity: 1 }),
    ).resolves.toEqual({ ok: false, code: "capacity" });
    await expect(
      createClassRecord(writer(tx), { ...base, meetingVisibleFromChosen: cdmx("2026-10-21", "19:05") }),
    ).resolves.toEqual({ ok: false, code: "meetingOpensLate" });
    // An individual class with a capacity is read as having none.
    await expect(createClassRecord(writer(tx), { ...base, capacity: 4, title: "" })).resolves.toMatchObject({
      ok: true,
    });
    expect((await tx.class.findMany({}))[0]).toMatchObject({ capacity: null, title: null });
  });
});

describe("syncClassSchedule", () => {
  async function seeded() {
    const database = fakeClassDb();
    const tx = database.begin();
    const created = await createClassRecord(writer(tx), { ...base, id: "c" });
    if (!created.ok) throw new Error(created.code);
    tx.commit();
    return database;
  }

  it("reprograma guardando la fecha anterior, quién y por qué", async () => {
    const database = await seeded();
    const tx = database.begin();
    await expect(
      syncClassSchedule(
        writer(tx),
        "c",
        { scheduledAt: cdmx("2026-10-23", "19:00"), durationMin: 90, note: "Examen." },
        "u-staff",
        CLASSES_NOW,
      ),
    ).resolves.toEqual({ ok: true, written: true });
    tx.commit();
    expect(database.rows("class")[0]).toMatchObject({
      scheduledAt: cdmx("2026-10-23", "19:00"),
      endsAt: cdmx("2026-10-23", "20:30"),
      previousScheduledAt: cdmx("2026-10-21", "19:00"),
      rescheduledAt: CLASSES_NOW,
      rescheduledById: "u-staff",
      rescheduleNote: "Examen.",
    });
  });

  it("la misma fecha y duración no escribe una reprogramación", async () => {
    const database = await seeded();
    const tx = database.begin();
    await expect(
      syncClassSchedule(
        writer(tx),
        "c",
        { scheduledAt: base.scheduledAt, durationMin: 60, note: null },
        "u-staff",
        CLASSES_NOW,
      ),
    ).resolves.toEqual({ ok: true, written: false });
  });

  it("una clase cerrada no se mueve, y un enlace elegido no puede quedar después del inicio", async () => {
    const database = await seeded();
    const tx = database.begin();
    await syncClassMeeting(writer(tx), "c", {
      meetingUrl: base.meetingUrl,
      visibleFromChosen: cdmx("2026-10-21", "18:00"),
    });
    await expect(
      syncClassSchedule(
        writer(tx),
        "c",
        { scheduledAt: cdmx("2026-10-21", "17:00"), durationMin: 60, note: null },
        "u-staff",
        CLASSES_NOW,
      ),
    ).resolves.toEqual({ ok: false, code: "meetingOpensLate" });
    await tx.class.updateMany({ where: { id: "c" }, data: { statusId: FAKE_IDS.status[CLASS_STATUS.CANCELLED] } });
    await expect(
      syncClassSchedule(
        writer(tx),
        "c",
        { scheduledAt: cdmx("2026-10-28", "19:00"), durationMin: 60, note: null },
        "u-staff",
        CLASSES_NOW,
      ),
    ).resolves.toEqual({ ok: false, code: "classClosed" });
  });
});

describe("syncClassMeeting", () => {
  it("cambia el enlace con su plataforma y su instante, o lo quita del todo", async () => {
    const database = fakeClassDb();
    const tx = database.begin();
    await createClassRecord(writer(tx), { ...base, id: "c" });
    await expect(
      syncClassMeeting(writer(tx), "c", {
        meetingUrl: "https://meet.google.com/abc",
        visibleFromChosen: cdmx("2026-10-21", "18:00"),
      }),
    ).resolves.toEqual({ ok: true });
    expect((await tx.class.findMany({}))[0]).toMatchObject({
      meetingProviderId: FAKE_IDS.provider.MEET,
      meetingUrlVisibleFrom: cdmx("2026-10-21", "18:00"),
    });
    await expect(
      syncClassMeeting(writer(tx), "c", { meetingUrl: null, visibleFromChosen: cdmx("2026-10-21", "18:00") }),
    ).resolves.toEqual({ ok: true });
    expect((await tx.class.findMany({}))[0]).toMatchObject({
      meetingUrl: null,
      meetingProviderId: null,
      meetingUrlVisibleFrom: null,
    });
    await expect(
      syncClassMeeting(writer(tx), "c", {
        meetingUrl: base.meetingUrl,
        visibleFromChosen: cdmx("2026-10-21", "19:30"),
      }),
    ).resolves.toEqual({ ok: false, code: "meetingOpensLate" });
  });
});
