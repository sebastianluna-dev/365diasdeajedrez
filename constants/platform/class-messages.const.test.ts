import { describe, expect, it } from "vitest";
import { cdmx } from "@/lib/testing/fixtures/classes";
import { CLASS_FIELD_ERRORS, CLASS_NOTICES, readNotice } from "./class-messages.const";

describe("CLASS_NOTICES", () => {
  it("cuenta las clases de un pago registrado en singular y en plural", () => {
    expect(CLASS_NOTICES.paymentRegistered(["4", "3", "1"])).toBe(
      "Pago registrado: 4 clases, 3 con fecha y 1 por programar.",
    );
    expect(CLASS_NOTICES.paymentRegistered(["4", "4", "0"])).toBe("Pago registrado: 4 clases, todas con fecha.");
    expect(CLASS_NOTICES.paymentRegistered(["4", "0", "4"])).toBe("Pago registrado: 4 clases por programar.");
    expect(CLASS_NOTICES.paymentRegistered(["1", "0", "1"])).toBe("Pago registrado: 1 clase por programar.");
    expect(CLASS_NOTICES.paymentRegistered(["1", "1", "0"])).toBe("Pago registrado: 1 clase, con fecha.");
  });

  it("dice cuántas plazas quedaron sin pago, o nada", () => {
    expect(CLASS_NOTICES.paymentDeleted(["0"])).toBe("Pago eliminado.");
    expect(CLASS_NOTICES.paymentDeleted(["1"])).toBe("Pago eliminado. 1 clase quedó «Sin pago».");
    expect(CLASS_NOTICES.paymentDeleted(["2"])).toBe("Pago eliminado. 2 clases quedaron «Sin pago».");
    expect(CLASS_NOTICES.classCancelled(["3"])).toBe("Clase cancelada. 3 clases volvieron a sus pagos.");
    expect(CLASS_NOTICES.classCancelled(["1"])).toBe("Clase cancelada. 1 clase volvió a su pago.");
    expect(CLASS_NOTICES.participantsAdded(["2"])).toBe("2 alumnos agregados.");
    expect(CLASS_NOTICES.participantsAdded(["1"])).toBe("Alumno agregado.");
  });

  it("escribe la fecha de una plaza programada desde los minutos, en la hora de la academia", () => {
    const start = cdmx("2026-10-21", "12:00").getTime() / 60_000;
    expect(CLASS_NOTICES.seatScheduled([String(start), "60"])).toBe("Clase programada: mié 21 oct · 12:00–13:00.");
    expect(CLASS_NOTICES.seatRescheduled([String(start), "60"])).toBe(
      "Clase reprogramada al mié 21 oct · 12:00–13:00: no gasta otra.",
    );
  });

  it("deja a la página los avisos que llevan un nombre", () => {
    for (const code of [
      "classCreated",
      "teacherChanged",
      "attendanceChanged",
      "classFinalized",
      "gameSaved",
    ] as const) {
      const notice: (args: string[]) => string | null = CLASS_NOTICES[code];
      expect(notice([])).toBeNull();
    }
  });
});

describe("readNotice", () => {
  it("lee el código y sus argumentos", () => {
    expect(readNotice("paymentRegistered.4.3.1")).toEqual({
      code: "paymentRegistered",
      args: ["4", "3", "1"],
      text: "Pago registrado: 4 clases, 3 con fecha y 1 por programar.",
    });
    expect(readNotice("gameSaved.demoAtaq.demoOper")).toMatchObject({ code: "gameSaved", text: null });
  });

  it("da nada para lo que withNoticeParam no pudo escribir", () => {
    expect(readNotice(undefined)).toBeNull();
    expect(readNotice("")).toBeNull();
    expect(readNotice("unknown")).toBeNull();
    expect(readNotice("attendanceChanged.Valentina")).toBeNull();
    expect(readNotice(["paymentUpdated", "paymentUpdated"])).toBeNull();
  });
});

describe("CLASS_FIELD_ERRORS", () => {
  it("tiene palabras para cada código de los escritores", () => {
    for (const code of [
      "studentInClass",
      "classFull",
      "seatsExhausted",
      "noPaidSeats",
      "paymentNotStudents",
      "seatIsFree",
      "seatAlreadyPaid",
      "notInClass",
      "seatNotMovable",
      "classCancelled",
      "notStarted",
      "reasonRequired",
      "markLocked",
      "seatMoved",
      "missingMark",
      "meetingOpensLate",
      "classClosed",
      "groupTitle",
      "capacity",
      "throttled",
    ]) {
      expect(CLASS_FIELD_ERRORS[code], code).toBeTruthy();
    }
  });
});
