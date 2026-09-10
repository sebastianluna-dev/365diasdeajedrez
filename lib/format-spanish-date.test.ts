import { describe, expect, it } from "vitest";
import { formatSpanishDate } from "./format-spanish-date";

// Dates built with the local constructor: the formatter uses the process's
// local time, so the test does not depend on the machine's time zone.
describe("formatSpanishDate", () => {
  it("escribe día, mes en minúscula y año", () => {
    expect(formatSpanishDate(new Date(2026, 8, 9))).toBe("9 de septiembre, 2026");
    expect(formatSpanishDate(new Date(2026, 0, 1))).toBe("1 de enero, 2026");
    expect(formatSpanishDate(new Date(2025, 11, 31))).toBe("31 de diciembre, 2025");
  });
});
