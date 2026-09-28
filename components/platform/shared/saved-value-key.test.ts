import { describe, expect, it } from "vitest";
import { savedValueKey } from "./saved-value-key";

describe("savedValueKey", () => {
  it("changes when the saved value changes, which is what mounts the control again", () => {
    expect(savedValueKey("WHITE")).not.toBe(savedValueKey("BLACK"));
    expect(savedValueKey(["intermedio", "avanzado"])).not.toBe(savedValueKey(["intermedio", "avanzado", "experto"]));
  });

  it("stays the same for the same set in another order", () => {
    expect(savedValueKey(["avanzado", "intermedio"])).toBe(savedValueKey(["intermedio", "avanzado"]));
  });

  it("tells an empty set from one with an empty value, and two values from one that joins them", () => {
    expect(savedValueKey([])).toBe(savedValueKey([]));
    expect(savedValueKey(["a", "b"])).not.toBe(savedValueKey(["a,b"]));
    expect(savedValueKey(["ab"])).not.toBe(savedValueKey(["a", "b"]));
  });

  it("is one and the same for a control whose parent holds the value", () => {
    expect(savedValueKey(undefined)).toBe("");
  });
});
