import { describe, expect, it } from "vitest";
import { capsule, changeLabel, dot, f1, percentOf, polyline } from "@/lib/charts/chart-geometry";

describe("the charts' shapes", () => {
  it("round to one decimal", () => {
    expect(f1(1.26)).toBe("1.3");
    expect(f1(4)).toBe("4");
  });

  it("draw a capsule never shorter than it is wide", () => {
    expect(capsule(0, 0, 10, 40)).toBe("M0,5A5,5 0 0 1 10,5L10,35A5,5 0 0 1 0,35Z");
    expect(capsule(0, 0, 10, 2)).toBe("M0,5A5,5 0 0 1 10,5L10,5A5,5 0 0 1 0,5Z");
  });

  it("draw a dot as two arcs", () => {
    expect(dot(10, 10, 2)).toBe("M8,10a2,2 0 1 0 4,0a2,2 0 1 0 -4,0Z");
  });

  it("join the points of a line", () => {
    expect(
      polyline([
        [0, 1],
        [2.25, 3],
      ]),
    ).toBe("M0,1L2.3,3");
  });

  it("place a label as a percentage of its box", () => {
    expect(percentOf(25, 200)).toBe("12.5%");
    expect(percentOf(5, 0)).toBe("0%");
  });

  it("write a change with its sign, or nothing when there is no before", () => {
    expect(changeLabel(112, 100)).toBe("+12 %");
    expect(changeLabel(92, 100)).toBe("−8 %");
    expect(changeLabel(10, 0)).toBeNull();
  });
});
