import { describe, expect, it } from "vitest";
import { CLASS_FORMAT, CLASS_PHASE, CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { CLASSES_NOW, cdmx } from "@/lib/testing/fixtures/classes";
import { balanceLine, mapPayment, paidOnLabel, type PaymentRow, type PaymentSeatRow } from "./staff-payments.mapper";

function seat(
  classId: string,
  date: string,
  time: string,
  status: ClassStatusCode = CLASS_STATUS.SCHEDULED,
  extra: Partial<PaymentSeatRow> = {},
): PaymentSeatRow {
  const scheduledAt = cdmx(date, time);
  return {
    classId,
    attended: null,
    seatMovedAt: null,
    seatMovedToClassId: null,
    isFree: false,
    paymentId: "pay-1",
    class: {
      id: classId,
      title: `Clase ${classId}`,
      scheduledAt,
      endsAt: new Date(scheduledAt.getTime() + 60 * 60_000),
      durationMin: 60,
      statusCode: status,
      formatCode: CLASS_FORMAT.INDIVIDUAL,
      teacherName: "GM Profesor Demo",
      studentNames: ["Alumno Demo"],
      meetingUrl: null,
      meetingUrlVisibleFrom: null,
    },
    ...extra,
  };
}

const payment: PaymentRow = {
  id: "pay-1",
  paidOn: new Date("2026-10-01T00:00:00.000Z"),
  amount: "1400.00",
  currencyCode: "MXN",
  classCount: 4,
  reference: "Transferencia 8841",
  note: null,
  recordedByName: "Staff Demo",
  seats: [
    seat("done", "2026-10-07", "12:00", CLASS_STATUS.COMPLETED, { attended: true }),
    seat("today", "2026-10-14", "12:00"),
    seat("group", "2026-10-17", "10:00", CLASS_STATUS.SCHEDULED, {
      class: { ...seat("group", "2026-10-17", "10:00").class, formatCode: CLASS_FORMAT.GROUP },
    }),
  ],
};

describe("mapPayment", () => {
  it("cuenta y numera las plazas, y formatea el importe y la fecha", () => {
    const view = mapPayment(payment, CLASSES_NOW);
    expect(view).toMatchObject({
      amountLabel: "$1,400.00 MXN",
      perClassLabel: "$350.00 por clase",
      paidOnLabel: "jue 1 oct 2026",
      taken: 1,
      scheduled: 2,
      toSchedule: 1,
      allTaken: false,
      canDelete: false,
      minClassCount: 3,
      seatsLeftUnpaid: 3,
    });
    expect(view.seats.map((row) => [row.ordinal, row.phase, row.isGroup])).toEqual([
      [1, CLASS_PHASE.DONE, false],
      [2, CLASS_PHASE.UPCOMING, false],
      [3, CLASS_PHASE.UPCOMING, true],
    ]);
    expect(view.deleteReason).toContain("Editar pago");
  });

  it("un pago sin clase empezada se puede eliminar; uno con todas tomadas se pliega", () => {
    const fresh = mapPayment({ ...payment, seats: [seat("later", "2026-10-21", "12:00")] }, CLASSES_NOW);
    expect(fresh.canDelete).toBe(true);
    expect(fresh.deleteReason).toBeUndefined();
    const spent = mapPayment(
      {
        ...payment,
        classCount: 1,
        seats: [seat("done", "2026-10-07", "12:00", CLASS_STATUS.COMPLETED, { attended: true })],
      },
      CLASSES_NOW,
    );
    expect(spent.allTaken).toBe(true);
  });

  it("una plaza movida dice adónde fue y no cuenta; la nueva dice de qué clase es reposición", () => {
    const moved = seat("missed", "2026-10-02", "19:00", CLASS_STATUS.COMPLETED, {
      attended: false,
      seatMovedAt: cdmx("2026-10-03", "09:00"),
      seatMovedToClassId: "redo",
    });
    const redo = seat("redo", "2026-10-09", "19:00", CLASS_STATUS.COMPLETED, { attended: true });
    const view = mapPayment({ ...payment, classCount: 1, seats: [moved, redo] }, CLASSES_NOW);
    expect(view.seats[0]).toMatchObject({
      classId: "missed",
      ordinal: 0,
      moved: { toClassId: "redo", label: "Faltó · reprogramada al vie 9 oct" },
    });
    expect(view.seats[1]).toMatchObject({ classId: "redo", ordinal: 1, replacesLabel: "reposición del vie 2 oct" });
    expect(view.taken).toBe(1);
  });
});

describe("balanceLine y paidOnLabel", () => {
  it("dice cuántas quedan y cuándo es la próxima", () => {
    expect(balanceLine(0, null, CLASSES_NOW)).toBe("Sin clases pagadas");
    expect(balanceLine(3, null, CLASSES_NOW)).toBe("Le quedan 3 clases");
    expect(balanceLine(1, { scheduledAt: cdmx("2026-10-14", "19:00"), durationMin: 60 }, CLASSES_NOW)).toBe(
      "Le queda 1 clase (hoy 19:00)",
    );
    expect(balanceLine(2, { scheduledAt: cdmx("2026-10-17", "10:00"), durationMin: 90 }, CLASSES_NOW)).toBe(
      "Le quedan 2 clases (sáb 17 oct)",
    );
  });

  it("escribe el día del pago con su año, leído de la columna de fecha", () => {
    expect(paidOnLabel(new Date("2026-10-01T00:00:00.000Z"), "America/Mexico_City", CLASSES_NOW)).toBe(
      "jue 1 oct 2026",
    );
  });
});
