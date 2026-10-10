import { describe, expect, it } from "vitest";
import { perforated, shade } from "./perforated";

describe("perforated", () => {
  it("is a closed path from the origin with a bite for every pitch along each edge", () => {
    const d = perforated(120, 150, 3.4, 10.6);
    expect(d.startsWith("M0 0")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    // 120 / 10.6 → 11 bites on the top and bottom, 150 / 10.6 → 14 on the sides.
    expect(d.match(/A/g)).toHaveLength(2 * 11 + 2 * 14);
  });

  it("bites at least twice on an edge however short", () => {
    expect(perforated(4, 4, 1, 10).match(/A/g)).toHaveLength(8);
  });

  it("keeps the corners of the rectangle", () => {
    const d = perforated(40, 60, 2, 10);
    for (const corner of ["L40 0", "L40 60", "L0 60", "L0 0"]) expect(d).toContain(corner);
  });
});

describe("shade", () => {
  it("moves a colour toward white or black", () => {
    expect(shade("#000000", 0.5)).toBe("#808080");
    expect(shade("#ffffff", -0.5)).toBe("#808080");
    expect(shade("#336699", 0)).toBe("#336699");
  });
});
