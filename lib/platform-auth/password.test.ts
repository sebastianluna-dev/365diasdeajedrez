import { describe, expect, it } from "vitest";
import { DUMMY_PASSWORD_HASH, hashPassword, PASSWORD_MIN_LENGTH, passwordProblem, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("acepta la contraseña correcta", async () => {
    const hash = await hashPassword("caballo-f3-siempre");
    expect(await verifyPassword("caballo-f3-siempre", hash)).toBe(true);
  });

  it("rechaza una contraseña distinta", async () => {
    const hash = await hashPassword("caballo-f3-siempre");
    expect(await verifyPassword("caballo-f3-nunca", hash)).toBe(false);
  });

  it("nunca produce el mismo hash dos veces (sal aleatoria)", async () => {
    const [first, second] = await Promise.all([hashPassword("misma"), hashPassword("misma")]);
    expect(first).not.toBe(second);
    expect(await verifyPassword("misma", first)).toBe(true);
    expect(await verifyPassword("misma", second)).toBe(true);
  });

  it("guarda los parámetros de coste junto al hash", async () => {
    const hash = await hashPassword("cualquiera");
    const [algorithm, n, r, p] = hash.split("$");
    expect(algorithm).toBe("scrypt");
    expect(Number(n)).toBeGreaterThanOrEqual(16384);
    expect(Number(r)).toBeGreaterThan(0);
    expect(Number(p)).toBeGreaterThan(0);
  });

  it("verifica hashes creados con parámetros distintos a los actuales", async () => {
    // Real hash of "historica" with N=16384 (lower cost than the current one). It
    // is the reason for storing N/r/p inside the hash: raising the cost must not
    // lock out whoever registered earlier.
    const legacy =
      "scrypt$16384$8$1$0f1e2d3c4b5a69788796a5b4c3d2e1f0$f13665439682794e1a0240536a992d906ac5cee03e3738c898bad5ae163b036f2302cd2ee5485f82d67e4de2a9cfe3b3db919a7c29a651765f8b51f4858160db";
    expect(await verifyPassword("historica", legacy)).toBe(true);
    expect(await verifyPassword("otra", legacy)).toBe(false);
  });

  it("devuelve false ante un hash corrupto en vez de lanzar", async () => {
    for (const corrupt of ["", "no-es-un-hash", "scrypt$a$b$c$d$e", "bcrypt$1$2$3$aa$bb"]) {
      expect(await verifyPassword("da-igual", corrupt)).toBe(false);
    }
  });

  it("el hash de descarte no valida ninguna contraseña", async () => {
    expect(await verifyPassword("", DUMMY_PASSWORD_HASH)).toBe(false);
    expect(await verifyPassword("intento", DUMMY_PASSWORD_HASH)).toBe(false);
  });
});

describe("passwordProblem", () => {
  it("acepta una contraseña de longitud suficiente", () => {
    expect(passwordProblem("a".repeat(PASSWORD_MIN_LENGTH))).toBeNull();
  });

  it("rechaza las demasiado cortas y las desmesuradas", () => {
    expect(passwordProblem("a".repeat(PASSWORD_MIN_LENGTH - 1))).toContain("al menos");
    expect(passwordProblem("a".repeat(1000))).toContain("no puede pasar");
  });
});
