import { describe, expect, it } from "vitest";
import { mapCourseSourceAdmin } from "./staff-sources.mapper";

describe("mapCourseSourceAdmin", () => {
  it("convierte los nulos en ausentes y lleva el tipo con su código y su nombre", () => {
    expect(
      mapCourseSourceAdmin({
        id: "s1",
        order: 2,
        originalTitle: "Mi sistema",
        authors: "Aron Nimzowitsch",
        url: null,
        publicationYear: 1925,
        edition: null,
        specificReference: "Capítulos 3 a 5",
        notes: null,
        sourceType: { code: "BOOK", label: "Libro" },
      }),
    ).toEqual({
      id: "s1",
      order: 2,
      sourceTypeCode: "BOOK",
      sourceTypeLabel: "Libro",
      originalTitle: "Mi sistema",
      authors: "Aron Nimzowitsch",
      url: undefined,
      publicationYear: 1925,
      edition: undefined,
      specificReference: "Capítulos 3 a 5",
      notes: undefined,
    });
  });

  it("una fuente que sólo tiene tipo conserva sus notas y nada más", () => {
    const mapped = mapCourseSourceAdmin({
      id: "s2",
      order: 1,
      originalTitle: null,
      authors: null,
      url: null,
      publicationYear: null,
      edition: null,
      specificReference: null,
      notes: "Elaborado en la academia",
      sourceType: { code: "OWN_MATERIAL", label: "Material de elaboración propia" },
    });
    expect(mapped.originalTitle).toBeUndefined();
    expect(mapped.authors).toBeUndefined();
    expect(mapped.notes).toBe("Elaborado en la academia");
  });
});
