import { describe, expect, it } from "vitest";
import { isNumericId, NUMERIC_ID_DIGITS, numericId } from "./numeric-id";

describe("numericId", () => {
  it("genera ocho dígitos, ceros a la izquierda incluidos", () => {
    const eightDigits = new RegExp(`^\\d{${NUMERIC_ID_DIGITS}}$`);
    for (let index = 0; index < 50; index++) {
      expect(numericId()).toMatch(eightDigits);
    }
    expect(numericId(3)).toMatch(/^\d{3}$/);
  });
});

describe("isNumericId", () => {
  it("sólo acepta exactamente ocho dígitos", () => {
    expect(isNumericId("00020212")).toBe(true);
    for (const value of ["0002021", "000202120", "abcdefgh", "0002021x", ""]) {
      expect(isNumericId(value), value).toBe(false);
    }
  });
});
