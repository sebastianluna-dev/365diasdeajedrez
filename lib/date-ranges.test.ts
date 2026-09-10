import { describe, expect, it } from "vitest";
import { rangeStart, toUtcDay } from "./date-ranges";

const iso = (date: Date | null) => date?.toISOString().slice(0, 10) ?? null;

describe("toUtcDay", () => {
  it("recorta a la medianoche UTC del mismo día", () => {
    expect(toUtcDay(new Date("2026-09-09T23:59:59Z")).toISOString()).toBe("2026-09-09T00:00:00.000Z");
  });
});

describe("rangeStart", () => {
  it("la semana empieza el lunes anterior (o el mismo día si es lunes)", () => {
    expect(iso(rangeStart("week", new Date("2026-09-09T15:00:00Z")))).toBe("2026-09-07"); // miércoles
    expect(iso(rangeStart("week", new Date("2026-09-13T01:00:00Z")))).toBe("2026-09-07"); // domingo
    expect(iso(rangeStart("week", new Date("2026-09-07T00:00:00Z")))).toBe("2026-09-07"); // lunes
  });

  it("cruza el cambio de año hacia atrás sin perder el lunes", () => {
    expect(iso(rangeStart("week", new Date("2026-01-01T12:00:00Z")))).toBe("2025-12-29"); // jueves
  });

  it("mes y año en curso, desde su día 1", () => {
    expect(iso(rangeStart("month", new Date("2026-09-09T15:00:00Z")))).toBe("2026-09-01");
    expect(iso(rangeStart("year", new Date("2026-09-09T15:00:00Z")))).toBe("2026-01-01");
  });

  it("«todo el tiempo» no tiene inicio", () => {
    expect(rangeStart("all", new Date("2026-09-09T15:00:00Z"))).toBeNull();
  });
});
