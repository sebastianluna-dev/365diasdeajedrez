import { describe, expect, it } from "vitest";
import { avatarToneOf, initialsOf } from "./avatar-tone";

describe("avatarToneOf", () => {
  it("gives the same tone to the same seed, one of six", () => {
    expect(avatarToneOf("don-chuy")).toBe(avatarToneOf("don-chuy"));
    const tones = new Set(
      ["tere", "beto", "lupita", "don-chuy", "mariana", "sofia", "ivan", "carlsen", "ana-torres", "tal"].map(
        avatarToneOf,
      ),
    );
    for (const tone of tones) expect([1, 2, 3, 4, 5, 6]).toContain(tone);
    expect(tones.size).toBeGreaterThan(2);
  });
});

describe("initialsOf", () => {
  it("takes the first and last words' initials, upper-cased", () => {
    expect(initialsOf("Don Chuy")).toBe("DC");
    expect(initialsOf("José Raúl Capablanca")).toBe("JC");
    expect(initialsOf("Sofía")).toBe("S");
    expect(initialsOf("Ñoño Íñiguez")).toBe("ÑÍ");
    expect(initialsOf("  ")).toBe("?");
  });
});
