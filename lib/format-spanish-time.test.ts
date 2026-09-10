import { describe, expect, it } from "vitest";
import { formatSpanishTime } from "./format-spanish-time";

describe("formatSpanishTime", () => {
  it("rellena con ceros y añade la «h»", () => {
    expect(formatSpanishTime(new Date(2026, 0, 1, 9, 5))).toBe("09:05 h");
    expect(formatSpanishTime(new Date(2026, 0, 1, 18, 30))).toBe("18:30 h");
    expect(formatSpanishTime(new Date(2026, 0, 1, 0, 0))).toBe("00:00 h");
  });
});
