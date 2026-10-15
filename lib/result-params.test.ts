import { describe, expect, it } from "vitest";
import { IMPORT_REPORT_PARAM } from "@/constants/platform/pgn-import-messages.const";
import { withImportReport } from "@/services/shared/pgn-import-report";
import { withErrorParam } from "@/services/shared/safe-return-to";
import { ERROR_PARAM, NOTICE_PARAM, RESULT_PARAMS, withoutResultParams } from "./result-params";

const at = (path: string) => new URL(path, "https://plataforma.example");

describe("withoutResultParams", () => {
  it("son el error de una acción, el resultado de una importación y el aviso de un éxito", () => {
    expect(RESULT_PARAMS).toEqual([ERROR_PARAM, IMPORT_REPORT_PARAM, NOTICE_PARAM]);
    expect(withoutResultParams(at("/administracion/clases?aviso=paymentRegistered.4.3.1"))).toBe(
      "/administracion/clases",
    );
  });

  it("quita el error y el resultado de una importación", () => {
    expect(withoutResultParams(at("/estudios/a/partidas/b?error=throttled"))).toBe("/estudios/a/partidas/b");
    expect(withoutResultParams(at("/estudios/a/partidas/b?importadas=12.1.0"))).toBe("/estudios/a/partidas/b");
  });

  it("deja el resto de la dirección tal cual, codificación y ancla incluidas", () => {
    expect(withoutResultParams(at("/estudios/a?pagina=2&error=fen&q=caro%20kann#notas"))).toBe(
      "/estudios/a?pagina=2&q=caro%20kann#notas",
    );
  });

  it("quita el parámetro aunque venga repetido o codificado", () => {
    expect(withoutResultParams(at("/x?error=a&error=b"))).toBe("/x");
    expect(withoutResultParams(at("/x?%65rror=a&pagina=2"))).toBe("/x?pagina=2");
  });

  it("quita lo que escriben withErrorParam y withImportReport", () => {
    const report = { imported: 12, skippedEmpty: 1, overLimit: 0 };
    expect(withoutResultParams(at(withErrorParam(withImportReport("/x?pagina=2", report), "fen")))).toBe("/x?pagina=2");
  });

  it("sin nada que quitar no hay nada que reescribir", () => {
    expect(withoutResultParams(at("/estudios/a"))).toBeNull();
    expect(withoutResultParams(at("/estudios/a?pagina=2&errores=1"))).toBeNull();
  });
});
