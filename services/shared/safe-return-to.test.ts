import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { safeReturnTo, withErrorParam, withNoticeParam } from "./safe-return-to";

describe("safeReturnTo", () => {
  it("acepta rutas internas tal cual, con query incluida", () => {
    expect(safeReturnTo("/clases/abc?tab=2", "/inicio")).toBe("/clases/abc?tab=2");
  });

  it("cae al destino por defecto ante URLs absolutas o disfrazadas", () => {
    for (const raw of ["https://otro-sitio.com", "//otro-sitio.com", "/\\otro-sitio.com", "clases", ""]) {
      expect(safeReturnTo(raw, "/inicio"), raw).toBe("/inicio");
    }
  });
});

describe("withErrorParam", () => {
  it("abre la query si no la hay y la continúa si ya existe", () => {
    expect(withErrorParam("/administracion/alumnos/1", "throttled")).toBe("/administracion/alumnos/1?error=throttled");
    expect(withErrorParam("/clases?tab=2", "fen")).toBe("/clases?tab=2&error=fen");
  });

  it("escapa el código para que no pueda meter parámetros extra", () => {
    expect(withErrorParam("/x", "a&b=c")).toBe("/x?error=a%26b%3Dc");
  });
});

// A `?error=` written by hand is not escaped and does not look at the query the
// path already carries (`/x?pagina=2?error=…`), so every action goes through
// `withErrorParam`. This reads the actions from disk without their comments,
// which quote the parameter when they describe the pattern.
describe("withNoticeParam", () => {
  it("escribe el código y sus argumentos separados por puntos", () => {
    expect(withNoticeParam("/administracion/clases", "paymentRegistered", [4, 3, 1])).toBe(
      "/administracion/clases?aviso=paymentRegistered.4.3.1",
    );
    expect(withNoticeParam("/x?pagina=2", "paymentUpdated")).toBe("/x?pagina=2&aviso=paymentUpdated");
    expect(withNoticeParam("/x", "gameSaved", ["demoAtaq", "a1b2c3d4-0000-4000-8000-000000000001"])).toContain(
      "aviso=gameSaved.demoAtaq.a1b2c3d4-0000-4000-8000-000000000001",
    );
  });

  it("rechaza un argumento que no sea un número ni un id: un nombre nunca viaja", () => {
    expect(() => withNoticeParam("/x", "attendanceChanged", ["Valentina Cruz"])).toThrow(/numbers or ids/);
  });
});

describe("las server actions", () => {
  const services = fileURLToPath(new URL("../", import.meta.url));
  const actions = readdirSync(services, { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(".actions.ts"))
    .map((path) => join(services, path));

  /** The code of a file without its comments: whole comment lines, and the tail of a line after `// `. */
  function codeOf(source: string): string {
    return source
      .split("\n")
      .filter((line) => !/^\s*(?:\/\/|\/\*|\*)/.test(line))
      .map((line) => line.replace(/\s\/\/\s.*$/, ""))
      .join("\n");
  }

  it("se leen del disco", () => {
    expect(actions.length).toBeGreaterThan(10);
  });

  it("construyen su ?error= con withErrorParam, nunca a mano", () => {
    const byHand = actions.filter((path) => /error=/.test(codeOf(readFileSync(path, "utf8"))));
    expect(byHand.map((path) => path.slice(services.length))).toEqual([]);
  });

  it("construyen su ?aviso= con withNoticeParam, nunca a mano", () => {
    const byHand = actions.filter((path) => /aviso=/.test(codeOf(readFileSync(path, "utf8"))));
    expect(byHand.map((path) => path.slice(services.length))).toEqual([]);
  });
});
