import { describe, expect, it } from "vitest";
import { databaseTargetOf, describeDatabaseTarget, isLocalDatabase } from "./database-target";

describe("databaseTargetOf", () => {
  it("lee el host y la base, y nada de las credenciales", () => {
    const target = databaseTargetOf("postgres://usuario:secreto@db.ejemplo.com:5432/plataforma?sslmode=verify-full");
    expect(target).toEqual({ host: "db.ejemplo.com", database: "plataforma", isLocal: false });
    expect(JSON.stringify(target)).not.toContain("secreto");
  });

  it("reconoce el contenedor de desarrollo en todas sus formas", () => {
    for (const host of ["localhost", "127.0.0.1", "[::1]"]) {
      expect(databaseTargetOf(`postgres://ajedrez:ajedrez@${host}:5432/payload`)?.isLocal, host).toBe(true);
    }
  });

  it("lo que no es una URL no es un destino", () => {
    expect(databaseTargetOf(undefined)).toBeNull();
    expect(databaseTargetOf("")).toBeNull();
    expect(databaseTargetOf("esto no es una url")).toBeNull();
  });
});

describe("isLocalDatabase", () => {
  it("sólo dice que sí de lo que puede leer y es esta máquina", () => {
    expect(isLocalDatabase("postgres://a:b@localhost:5432/plataforma")).toBe(true);
    expect(isLocalDatabase("postgres://a:b@db.ejemplo.com/plataforma")).toBe(false);
    expect(isLocalDatabase("no es una url")).toBe(false);
    expect(isLocalDatabase(undefined)).toBe(false);
  });
});

describe("describeDatabaseTarget", () => {
  it("dice el host, la base y si es la gestionada", () => {
    expect(describeDatabaseTarget({ host: "localhost", database: "plataforma", isLocal: true })).toBe(
      "localhost / plataforma (local)",
    );
    expect(describeDatabaseTarget({ host: "db.ejemplo.com", database: "postgres", isLocal: false })).toBe(
      "db.ejemplo.com / postgres (gestionada)",
    );
  });
});
