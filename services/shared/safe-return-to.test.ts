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
