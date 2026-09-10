import { describe, expect, it } from "vitest";
import { formatSpanishDate } from "./format-spanish-date";

// Fechas construidas con el constructor local: el formateador usa la hora
// local del proceso, así que el test no depende de la zona de la máquina.
describe("formatSpanishDate", () => {
  it("escribe día, mes en minúscula y año", () => {
    expect(formatSpanishDate(new Date(2026, 8, 9))).toBe("9 de septiembre, 2026");
    expect(formatSpanishDate(new Date(2026, 0, 1))).toBe("1 de enero, 2026");
    expect(formatSpanishDate(new Date(2025, 11, 31))).toBe("31 de diciembre, 2025");
  });
});
