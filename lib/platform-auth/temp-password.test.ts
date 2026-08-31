import { describe, expect, it } from "vitest";
import { generateTempPassword, TEMP_PASSWORD_LENGTH } from "./temp-password";
import { PASSWORD_MIN_LENGTH, passwordProblem } from "./password";

describe("generateTempPassword", () => {
  it("tiene siempre la longitud esperada", () => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      expect(generateTempPassword()).toHaveLength(TEMP_PASSWORD_LENGTH);
    }
  });

  it("usa sólo el alfabeto base64url (nada que se rompa al copiar o en una URL)", () => {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      expect(generateTempPassword()).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("es aceptable para la política de contraseñas de la plataforma", () => {
    expect(TEMP_PASSWORD_LENGTH).toBeGreaterThanOrEqual(PASSWORD_MIN_LENGTH);
    expect(passwordProblem(generateTempPassword())).toBeNull();
  });

  it("no repite valores (es aleatoria, no un contador)", () => {
    const generated = new Set(Array.from({ length: 500 }, () => generateTempPassword()));
    expect(generated.size).toBe(500);
  });
});
