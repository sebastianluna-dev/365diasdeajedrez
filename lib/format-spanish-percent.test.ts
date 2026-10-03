import { describe, expect, it } from "vitest";
import { formatSpanishPercent } from "./format-spanish-percent";

/** The space Spanish writes before the sign: a non-breaking one, so the figure and its sign never part. */
const NBSP = "\u00a0";

describe("formatSpanishPercent", () => {
  it("escribe la coma decimal y el signo separado, como el español", () => {
    expect(formatSpanishPercent(69.5)).toBe(`69,5${NBSP}%`);
    expect(formatSpanishPercent(33.3)).toBe(`33,3${NBSP}%`);
  });

  it("no inventa decimales donde no los hay", () => {
    expect(formatSpanishPercent(100)).toBe(`100${NBSP}%`);
    expect(formatSpanishPercent(0)).toBe(`0${NBSP}%`);
  });

  it("redondea a un decimal", () => {
    expect(formatSpanishPercent(12.34)).toBe(`12,3${NBSP}%`);
  });
});
