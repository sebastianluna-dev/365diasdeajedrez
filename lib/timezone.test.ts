import { describe, expect, it } from "vitest";
import { formatDateTimeLocal, parseDateTimeLocal, safeTimeZone } from "./timezone";

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
