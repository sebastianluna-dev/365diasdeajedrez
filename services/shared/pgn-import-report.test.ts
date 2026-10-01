import { describe, expect, it } from "vitest";
import { PGN_MAX_GAMES } from "@/constants/platform/content-limits.const";
import { readImportReport, withImportReport } from "./pgn-import-report";

describe("withImportReport", () => {
  it("abre la query si no la hay y la continúa si ya existe", () => {
    const report = { imported: 12, skippedEmpty: 1, overLimit: 0 };
    expect(withImportReport("/estudios/abc", report)).toBe("/estudios/abc?importadas=12.1.0");
    expect(withImportReport("/estudios/abc?pagina=2", report)).toBe("/estudios/abc?pagina=2&importadas=12.1.0");
  });
});

describe("readImportReport", () => {
  it("lee lo que escribió withImportReport", () => {
    const report = { imported: PGN_MAX_GAMES, skippedEmpty: 3, overLimit: 120 };
    const url = new URL(withImportReport("/estudios/abc", report), "http://localhost");
    expect(readImportReport(url.searchParams.get("importadas") ?? undefined)).toEqual(report);
  });

  it("sin parámetro, o repetido, no hay resultado", () => {
    expect(readImportReport(undefined)).toBeNull();
    expect(readImportReport(["1.0.0", "2.0.0"])).toBeNull();
  });

  it("lo que no tiene forma de resultado no es un resultado", () => {
    for (const raw of ["", "12", "12.1", "12.1.0.4", "doce.1.0", "-1.0.0", "1e3.0.0", " 12.1.0", "12.1.0<script>"]) {
      expect(readImportReport(raw), raw).toBeNull();
    }
  });

  it("no cree un resultado que no pudo ocurrir", () => {
    // Nothing imported is an error and never a notice; more than the limit
    // cannot be stored; and games only stay out when the limit was reached.
    expect(readImportReport("0.3.0")).toBeNull();
    expect(readImportReport(`${PGN_MAX_GAMES + 1}.0.0`)).toBeNull();
    expect(readImportReport("12.0.5")).toBeNull();
  });
});
