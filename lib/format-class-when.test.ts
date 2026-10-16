import { describe, expect, it } from "vitest";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import {
  classDayParts,
  formatAgendaDay,
  formatClassDay,
  formatClassHours,
  formatClassLength,
  formatClassStamp,
  formatClassWhen,
  formatLongDay,
  timeZoneLabel,
} from "./format-class-when";

const zone = CLASSES_TIME_ZONE;

describe("formatClassWhen", () => {
  it("escribe el día corto y las horas en la zona", () => {
    expect(
      formatClassWhen({ start: cdmx("2026-10-17", "10:00"), durationMin: 90, timeZone: zone, now: CLASSES_NOW }),
    ).toBe("sáb 17 oct · 10:00–11:30");
    expect(
      formatClassWhen({ start: cdmx("2026-10-21", "19:00"), durationMin: 60, timeZone: zone, now: CLASSES_NOW }),
    ).toBe("mié 21 oct · 19:00–20:00");
  });

  it("dice Hoy, Mañana y Ayer", () => {
    expect(
      formatClassWhen({ start: cdmx("2026-10-14", "12:00"), durationMin: 60, timeZone: zone, now: CLASSES_NOW }),
    ).toBe("Hoy · 12:00–13:00");
    expect(
      formatClassWhen({ start: cdmx("2026-10-15", "18:00"), durationMin: 60, timeZone: zone, now: CLASSES_NOW }),
    ).toBe("Mañana · 18:00–19:00");
    expect(
      formatClassWhen({ start: cdmx("2026-10-13", "12:00"), durationMin: 60, timeZone: zone, now: CLASSES_NOW }),
    ).toBe("Ayer · 12:00–13:00");
  });

  it("con relative: false escribe la fecha también hoy y mañana, para «al …»", () => {
    const now = cdmx("2026-10-14", "11:40");
    expect(
      formatClassWhen({ start: cdmx("2026-10-15", "12:00"), durationMin: 60, timeZone: zone, now, relative: false }),
    ).toBe("jue 15 oct · 12:00–13:00");
  });

  it("el año sólo cuando no es el actual, y la zona cuando se pide", () => {
    expect(
      formatClassWhen({ start: cdmx("2025-12-03", "12:00"), durationMin: 60, timeZone: zone, now: CLASSES_NOW }),
    ).toBe("mié 3 dic 2025 · 12:00–13:00");
    expect(
      formatClassWhen({
        start: cdmx("2026-10-14", "12:00"),
        durationMin: 60,
        timeZone: zone,
        now: CLASSES_NOW,
        withZone: true,
      }),
    ).toBe("Hoy · 12:00–13:00 (hora de Ciudad de México)");
  });

  it("lee el día en la zona pedida, no en la del proceso", () => {
    // 23:30 in Mexico City is already the next day in Madrid.
    const late = cdmx("2026-10-14", "23:30");
    expect(formatClassWhen({ start: late, durationMin: 60, timeZone: zone, now: CLASSES_NOW })).toBe(
      "Hoy · 23:30–00:30",
    );
    // Seen from Madrid, where it is already 19:40 of the 14th, that is tomorrow morning.
    expect(formatClassWhen({ start: late, durationMin: 60, timeZone: "Europe/Madrid", now: CLASSES_NOW })).toBe(
      "Mañana · 07:30–08:30",
    );
    expect(
      formatClassWhen({ start: late, durationMin: 60, timeZone: "Europe/Madrid", now: cdmx("2026-10-20", "12:00") }),
    ).toBe("jue 15 oct · 07:30–08:30");
  });
});

describe("formatClassHours", () => {
  it("sólo las horas", () => {
    expect(formatClassHours(cdmx("2026-10-14", "12:00"), 60, zone)).toBe("12:00–13:00");
  });
});

describe("formatClassLength", () => {
  it("minutes under an hour, hours, and hours with their minutes", () => {
    expect(formatClassLength(45)).toBe("45 min");
    expect(formatClassLength(60)).toBe("1 h");
    expect(formatClassLength(90)).toBe("1 h 30");
    expect(formatClassLength(125)).toBe("2 h 05");
  });
});

describe("formatAgendaDay", () => {
  it("encabeza el día con Hoy o Mañana, y los demás con mayúscula", () => {
    expect(formatAgendaDay("2026-10-14", "2026-10-14")).toBe("Hoy · miércoles 14 de octubre");
    expect(formatAgendaDay("2026-10-15", "2026-10-14")).toBe("Mañana · jueves 15 de octubre");
    expect(formatAgendaDay("2026-10-17", "2026-10-14")).toBe("Sábado 17 de octubre");
    expect(formatAgendaDay("2027-01-04", "2026-10-14")).toBe("Lunes 4 de enero de 2027");
  });
});

describe("formatClassDay", () => {
  it("el día corto, con el año sólo si cambia", () => {
    expect(formatClassDay(cdmx("2026-10-01", "12:00"), zone, CLASSES_NOW)).toBe("jue 1 oct");
    expect(formatClassDay(cdmx("2025-09-03", "12:00"), zone, CLASSES_NOW)).toBe("mié 3 sep 2025");
  });
});

describe("timeZoneLabel", () => {
  it("nombra la de la academia y escribe las demás por su id", () => {
    expect(timeZoneLabel("America/Mexico_City")).toBe("hora de Ciudad de México");
    expect(timeZoneLabel("Europe/Madrid")).toBe("hora de Europe/Madrid");
  });
});

describe("classDayParts", () => {
  it("las tres palabras de la ficha del día, en la zona", () => {
    expect(classDayParts(cdmx("2026-10-14", "23:30"), zone)).toEqual({ weekday: "mié", day: 14, month: "oct" });
    expect(classDayParts(cdmx("2026-10-14", "23:30"), "Europe/Madrid")).toEqual({
      weekday: "jue",
      day: 15,
      month: "oct",
    });
  });
});

describe("formatClassStamp", () => {
  it("escribe el día corto y la hora del momento", () => {
    expect(formatClassStamp(cdmx("2026-10-14", "20:12"), zone, CLASSES_NOW)).toBe("mié 14 oct, 20:12");
    expect(formatClassStamp(cdmx("2025-09-15", "10:20"), zone, CLASSES_NOW)).toBe("lun 15 sep 2025, 10:20");
  });
});

describe("formatLongDay", () => {
  it("escribe el día largo, con el año sólo cuando no es el de hoy", () => {
    expect(formatLongDay("2026-10-14", "2026-10-14")).toBe("miércoles 14 de octubre");
    expect(formatLongDay("2026-10-20", "2026-10-14")).toBe("martes 20 de octubre");
    expect(formatLongDay("2027-01-04", "2026-10-14")).toBe("lunes 4 de enero de 2027");
  });
});
