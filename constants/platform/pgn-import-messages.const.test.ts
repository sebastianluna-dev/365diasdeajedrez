import { describe, expect, it } from "vitest";
import { isCompleteImport, pgnImportNotice } from "./pgn-import-messages.const";

describe("pgnImportNotice", () => {
  it("dice cuántas entraron cuando entraron todas", () => {
    expect(pgnImportNotice({ imported: 1, skippedEmpty: 0, overLimit: 0 })).toBe("Se importó 1 partida.");
    expect(pgnImportNotice({ imported: 12, skippedEmpty: 0, overLimit: 0 })).toBe("Se importaron 12 partidas.");
  });

  it("dice cuántas de cuántas y por qué se quedó fuera el resto", () => {
    expect(pgnImportNotice({ imported: 12, skippedEmpty: 1, overLimit: 0 })).toBe(
      "Se importaron 12 de 13 partidas: 1 no tenía jugadas.",
    );
    expect(pgnImportNotice({ imported: 500, skippedEmpty: 0, overLimit: 100 })).toBe(
      "Se importaron 500 de 600 partidas: 100 quedaron fuera, porque una importación admite hasta 500.",
    );
    expect(pgnImportNotice({ imported: 500, skippedEmpty: 2, overLimit: 1 })).toBe(
      "Se importaron 500 de 503 partidas: 2 no tenían jugadas y 1 quedó fuera, porque una importación admite hasta 500.",
    );
    expect(pgnImportNotice({ imported: 1, skippedEmpty: 1, overLimit: 0 })).toBe(
      "Se importó 1 de 2 partidas: 1 no tenía jugadas.",
    );
  });
});

describe("isCompleteImport", () => {
  it("sólo cuando nada se quedó fuera", () => {
    expect(isCompleteImport({ imported: 3, skippedEmpty: 0, overLimit: 0 })).toBe(true);
    expect(isCompleteImport({ imported: 3, skippedEmpty: 1, overLimit: 0 })).toBe(false);
    expect(isCompleteImport({ imported: 500, skippedEmpty: 0, overLimit: 1 })).toBe(false);
  });
});
