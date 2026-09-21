import { describe, expect, it } from "vitest";
import { numericId } from "./numeric-id";

describe("numericId", () => {
  it("genera ocho dígitos, ceros a la izquierda incluidos", () => {
    for (let index = 0; index < 50; index++) {
      expect(numericId()).toMatch(/^\d{8}$/);
    }
    expect(numericId(3)).toMatch(/^\d{3}$/);
  });
});
