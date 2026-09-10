import { describe, expect, it } from "vitest";

import { buildNotationRows, sanToSpanish } from "@/lib/chess/notation";
import type { MoveAnnotations } from "@/lib/chess/types";

describe("buildNotationRows", () => {
  it("agrupa los SAN en filas numeradas de blancas y negras", () => {
    const rows = buildNotationRows(["e4", "c5", "Nf3", "d6"]);

    expect(rows).toHaveLength(2);
    expect(rows[0].number).toBe("1.");
    expect(rows[1].number).toBe("2.");
    expect(rows[0].white.label).toBe("e4");
    expect(rows[0].black?.label).toBe("c5");
    // The piece initial is extracted into the glyph, so the label goes without it.
    expect(rows[1].white).toMatchObject({ label: "f3", glyph: "knight" });
    expect(rows[1].black).toMatchObject({ label: "d6", glyph: null });
  });

  it("deja black en null cuando la última jugada es de blancas", () => {
    const rows = buildNotationRows(["e4", "c5", "Nf3"]);

    expect(rows).toHaveLength(2);
    expect(rows[1].white.label).toBe("f3");
    expect(rows[1].black).toBeNull();
  });

  it("numera los ply desde 1 y de forma correlativa", () => {
    const rows = buildNotationRows(["e4", "c5", "Nf3", "d6", "d4"]);

    expect(rows.flatMap((row) => [row.white.ply, row.black?.ply ?? []].flat())).toEqual([1, 2, 3, 4, 5]);
  });

  it("devuelve una lista vacía sin jugadas", () => {
    expect(buildNotationRows([])).toEqual([]);
  });

  it("asocia las anotaciones por la clave `${numero}w` / `${numero}b`", () => {
    const annotations: MoveAnnotations = { "1w": "book", "2b": "blunder" };
    const rows = buildNotationRows(["e4", "c5", "Nf3", "Nf6"], annotations);

    expect(rows[0].white.quality).toBe("book");
    expect(rows[0].black?.quality).toBeNull();
    expect(rows[1].white.quality).toBeNull();
    expect(rows[1].black?.quality).toBe("blunder");
  });

  it("deja la calidad en null cuando no se pasan anotaciones", () => {
    const rows = buildNotationRows(["e4", "e5"]);

    expect(rows[0].white.quality).toBeNull();
    expect(rows[0].black?.quality).toBeNull();
  });
});

describe("sanToSpanish", () => {
  it("traduce la inicial de pieza al castellano", () => {
    expect(sanToSpanish("Nf3")).toBe("Cf3");
    expect(sanToSpanish("Bb5")).toBe("Ab5");
    expect(sanToSpanish("Rd1+")).toBe("Td1+");
    expect(sanToSpanish("Qxd8#")).toBe("Dxd8#");
    expect(sanToSpanish("Ke2")).toBe("Re2");
  });

  it("no toca las jugadas de peón", () => {
    expect(sanToSpanish("e4")).toBe("e4");
    expect(sanToSpanish("cxd4")).toBe("cxd4");
  });

  it("no traduce los enroques", () => {
    expect(sanToSpanish("O-O")).toBe("O-O");
    expect(sanToSpanish("O-O-O")).toBe("O-O-O");
    expect(sanToSpanish("O-O+")).toBe("O-O+");
  });

  it("traduce la pieza de coronación", () => {
    expect(sanToSpanish("e8=Q")).toBe("e8=D");
    expect(sanToSpanish("b1=N+")).toBe("b1=C+");
    expect(sanToSpanish("axb8=R")).toBe("axb8=T");
  });

  it("mantiene la desambiguación de la jugada", () => {
    expect(sanToSpanish("Nbd7")).toBe("Cbd7");
    expect(sanToSpanish("R1a3")).toBe("T1a3");
  });
});
