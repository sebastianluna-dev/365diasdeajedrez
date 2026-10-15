import { describe, expect, it } from "vitest";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { FAKE_IDS, fakeClassDb, type FakeClient } from "@/lib/testing/fake-class-db";
import { CLASSES_NOW, cdmx } from "@/lib/testing/fixtures/classes";
import {
  classStatusIds,
  initialClassStatusData,
  transitionClassStatus,
  type ClassStatusWriter,
} from "./class-status.service";

function writer(client: FakeClient): ClassStatusWriter {
  return client as unknown as ClassStatusWriter;
}

function classRow(id: string, status: keyof typeof FAKE_IDS.status) {
  const scheduledAt = cdmx("2026-10-07", "12:00");
  return {
    id,
    statusId: FAKE_IDS.status[status],
    scheduledAt,
    durationMin: 60,
    endsAt: new Date(scheduledAt.getTime() + 3_600_000),
  };
}

describe("transitionClassStatus", () => {
  it("el profesor finaliza, y queda quién y cuándo", async () => {
    const database = fakeClassDb({ class: [classRow("c", CLASS_STATUS.SCHEDULED)] });
    const tx = database.begin();
    await expect(
      transitionClassStatus(writer(tx), {
        classId: "c",
        to: CLASS_STATUS.COMPLETED,
        actor: { userId: "u-t", role: "teacher" },
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ written: true });
    tx.commit();
    expect(database.rows("class")[0]).toMatchObject({
      statusId: FAKE_IDS.status.COMPLETED,
      closedAt: CLASSES_NOW,
      closedById: "u-t",
    });
  });

  it("el profesor no cancela; administración sí, con el motivo y la nota", async () => {
    const database = fakeClassDb({ class: [classRow("c", CLASS_STATUS.LIVE)] });
    const tx = database.begin();
    await expect(
      transitionClassStatus(writer(tx), {
        classId: "c",
        to: CLASS_STATUS.CANCELLED,
        actor: { userId: "u-t", role: "teacher" },
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ written: false });
    await expect(
      transitionClassStatus(writer(tx), {
        classId: "c",
        to: CLASS_STATUS.CANCELLED,
        actor: { userId: "u-s", role: "staff" },
        now: CLASSES_NOW,
        cancel: { reason: "El alumno pidió moverla.", note: "Te escribiremos." },
      }),
    ).resolves.toEqual({ written: true });
    tx.commit();
    expect(database.rows("class")[0]).toMatchObject({
      statusId: FAKE_IDS.status.CANCELLED,
      cancelledAt: CLASSES_NOW,
      cancelledById: "u-s",
      cancelReason: "El alumno pidió moverla.",
      cancelNote: "Te escribiremos.",
    });
  });

  it("una clase cerrada no cambia, y la segunda de dos finalizaciones no escribe", async () => {
    const database = fakeClassDb({ class: [classRow("c", CLASS_STATUS.COMPLETED)] });
    const tx = database.begin();
    await expect(
      transitionClassStatus(writer(tx), {
        classId: "c",
        to: CLASS_STATUS.CANCELLED,
        actor: { userId: "u-s", role: "staff" },
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ written: false });
    await expect(
      transitionClassStatus(writer(tx), {
        classId: "missing",
        to: CLASS_STATUS.COMPLETED,
        actor: { userId: "u-s", role: "staff" },
        now: CLASSES_NOW,
      }),
    ).resolves.toEqual({ written: false });
  });
});

describe("initialClassStatusData", () => {
  it("una clase nace programada", async () => {
    const ids = await classStatusIds(writer(fakeClassDb().begin()));
    expect(initialClassStatusData(ids)).toEqual({ statusId: FAKE_IDS.status.SCHEDULED });
  });
});
