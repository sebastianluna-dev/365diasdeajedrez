import { describe, expect, it } from "vitest";

import { stepTarget } from "./use-sortable-step.hook";

const IDS = ["a", "b", "c"];

describe("stepTarget", () => {
  it("takes the place of the neighbour above or below", () => {
    expect(stepTarget(IDS, "b", -1)).toBe("a");
    expect(stepTarget(IDS, "b", 1)).toBe("c");
  });

  it("goes nowhere up from the first row, nor down from the last", () => {
    expect(stepTarget(IDS, "a", -1)).toBeNull();
    expect(stepTarget(IDS, "c", 1)).toBeNull();
  });

  it("goes nowhere at all in a list of one", () => {
    expect(stepTarget(["a"], "a", -1)).toBeNull();
    expect(stepTarget(["a"], "a", 1)).toBeNull();
  });

  it("does not move a row that is not in the order, as the introduction or the closing", () => {
    expect(stepTarget(IDS, "intro", -1)).toBeNull();
    expect(stepTarget(IDS, "intro", 1)).toBeNull();
  });
});
