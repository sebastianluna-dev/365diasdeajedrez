import { describe, expect, it } from "vitest";
import { classTimeZone, dayRangeIn, formatDateTimeLocal, parseDateTimeLocal, safeTimeZone } from "./timezone";

describe("formatDateTimeLocal", () => {
  it("pinta el instante UTC en la zona pedida", () => {
    const instant = new Date("2026-03-10T18:30:00.000Z");
    expect(formatDateTimeLocal(instant, "UTC")).toBe("2026-03-10T18:30");
    expect(formatDateTimeLocal(instant, "America/Mexico_City")).toBe("2026-03-10T12:30");
    expect(formatDateTimeLocal(instant, "Europe/Madrid")).toBe("2026-03-10T19:30");
  });
});

describe("parseDateTimeLocal", () => {
  it("interpreta la hora de pared en la zona indicada", () => {
    expect(parseDateTimeLocal("2026-03-10T12:30", "America/Mexico_City")?.toISOString()).toBe(
      "2026-03-10T18:30:00.000Z",
    );
    expect(parseDateTimeLocal("2026-03-10T18:30", "UTC")?.toISOString()).toBe("2026-03-10T18:30:00.000Z");
  });

  it("va y vuelve sin desplazarse, también en horario de verano", () => {
    for (const value of ["2026-01-15T09:00", "2026-07-15T09:00", "2026-03-29T04:00"]) {
      for (const zone of ["UTC", "Europe/Madrid", "America/Mexico_City", "America/Argentina/Buenos_Aires"]) {
        const instant = parseDateTimeLocal(value, zone);
        expect(instant, `${value} en ${zone}`).not.toBeNull();
        expect(formatDateTimeLocal(instant!, zone)).toBe(value);
      }
    }
  });

  it("rechaza formatos y fechas imposibles", () => {
    expect(parseDateTimeLocal("", "UTC")).toBeNull();
    expect(parseDateTimeLocal("2026-03-10", "UTC")).toBeNull();
    expect(parseDateTimeLocal("10/03/2026 12:30", "UTC")).toBeNull();
    expect(parseDateTimeLocal("2026-02-31T10:00", "UTC")).toBeNull();
    expect(parseDateTimeLocal("2026-13-01T10:00", "UTC")).toBeNull();
  });
});

describe("safeTimeZone", () => {
  it("cae a UTC cuando no hay zona o no es válida", () => {
    expect(safeTimeZone(null)).toBe("UTC");
    expect(safeTimeZone(undefined)).toBe("UTC");
    expect(safeTimeZone("Marte/Olympus")).toBe("UTC");
  });

  it("conserva una zona IANA válida", () => {
    expect(safeTimeZone("Europe/Madrid")).toBe("Europe/Madrid");
  });
});

describe("dayRangeIn", () => {
  it("corta el día en la zona pedida: las 21:00 del 13 en Ciudad de México siguen siendo el 13", () => {
    // 03:00 UTC of the 14th is 21:00 of the 13th in Mexico City (UTC−6).
    const range = dayRangeIn(new Date("2026-10-14T03:00:00.000Z"), "America/Mexico_City");
    expect(range.key).toBe("2026-10-13");
    expect(range.start.toISOString()).toBe("2026-10-13T06:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-10-14T06:00:00.000Z");
  });

  it("en UTC el mismo instante ya es el 14", () => {
    expect(dayRangeIn(new Date("2026-10-14T03:00:00.000Z"), "UTC").key).toBe("2026-10-14");
  });
});

describe("classTimeZone", () => {
  it("conserva la zona válida del profesor", () => {
    expect(classTimeZone("Europe/Madrid")).toEqual({ timeZone: "Europe/Madrid", missing: false });
  });

  it("sin zona, o con una que no existe, usa la de la academia y lo dice: nunca UTC", () => {
    expect(classTimeZone(null)).toEqual({ timeZone: "America/Mexico_City", missing: true });
    expect(classTimeZone(undefined)).toEqual({ timeZone: "America/Mexico_City", missing: true });
    expect(classTimeZone("Marte/Olympus")).toEqual({ timeZone: "America/Mexico_City", missing: true });
  });
});
