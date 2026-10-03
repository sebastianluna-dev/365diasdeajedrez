import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { safeReturnTo, withErrorParam } from "./safe-return-to";

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
});
