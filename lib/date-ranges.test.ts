import { describe, expect, it } from "vitest";
import { rangeStart, statsDay } from "./date-ranges";

const iso = (date: Date | null) => date?.toISOString().slice(0, 10) ?? null;

describe("statsDay", () => {
  it("es el día de estudio (México), guardado como esa fecha a medianoche UTC", () => {
    // 21:00 on 9 September in Mexico is already the 10th in UTC.
    expect(statsDay(new Date("2026-09-10T03:00:00Z")).toISOString()).toBe("2026-09-09T00:00:00.000Z");
    expect(statsDay(new Date("2026-09-09T15:00:00Z")).toISOString()).toBe("2026-09-09T00:00:00.000Z");
  });

  it("acepta otra zona", () => {
    expect(statsDay(new Date("2026-09-10T03:00:00Z"), "UTC").toISOString()).toBe("2026-09-10T00:00:00.000Z");
  });
});

describe("rangeStart", () => {
  it("la semana empieza el lunes anterior (o el mismo día si es lunes)", () => {
    expect(iso(rangeStart("week", new Date("2026-09-09T15:00:00Z")))).toBe("2026-09-07"); // Wednesday
    expect(iso(rangeStart("week", new Date("2026-09-13T01:00:00Z")))).toBe("2026-09-07"); // Saturday evening in Mexico
    expect(iso(rangeStart("week", new Date("2026-09-07T15:00:00Z")))).toBe("2026-09-07"); // Monday
  });

  it("la tarde del domingo en México sigue siendo la semana que acaba", () => {
    // 22:00 on Sunday the 13th in Mexico; in UTC it is already Monday the 14th.
    expect(iso(rangeStart("week", new Date("2026-09-14T04:00:00Z")))).toBe("2026-09-07");
  });

  it("cruza el cambio de año hacia atrás sin perder el lunes", () => {
    expect(iso(rangeStart("week", new Date("2026-01-01T12:00:00Z")))).toBe("2025-12-29"); // Thursday
  });

  it("mes y año en curso, desde su día 1", () => {
    expect(iso(rangeStart("month", new Date("2026-09-09T15:00:00Z")))).toBe("2026-09-01");
    expect(iso(rangeStart("year", new Date("2026-09-09T15:00:00Z")))).toBe("2026-01-01");
  });

  it("«todo el tiempo» no tiene inicio", () => {
    expect(rangeStart("all", new Date("2026-09-09T15:00:00Z"))).toBeNull();
  });
});
