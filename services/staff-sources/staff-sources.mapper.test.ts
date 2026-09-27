import { describe, expect, it } from "vitest";
import { mapCourseSourceAdmin, mapSourceEntityAdmin } from "./staff-sources.mapper";

describe("mapCourseSourceAdmin", () => {
  it("convierte los nulos en ausentes y toma el nombre de la entidad", () => {
    expect(
      mapCourseSourceAdmin({
        id: "s1",
        order: 2,
        originalTitle: "Mi sistema",
        authors: "Aron Nimzowitsch",
        entityId: "e1",
        url: null,
        publicationYear: 1925,
        edition: null,
        specificReference: "Capítulos 3 a 5",
        notes: null,
        sourceType: { code: "BOOK", label: "Libro" },
        entity: { name: "Quality Chess" },
      }),
    ).toEqual({
      id: "s1",
      order: 2,
      sourceTypeCode: "BOOK",
      sourceTypeLabel: "Libro",
      originalTitle: "Mi sistema",
      authors: "Aron Nimzowitsch",
      entityId: "e1",
      entityName: "Quality Chess",
      url: undefined,
      publicationYear: 1925,
      edition: undefined,
      specificReference: "Capítulos 3 a 5",
      notes: undefined,
    });
  });

  it("una fuente sin entidad no tiene nombre de entidad", () => {
    const mapped = mapCourseSourceAdmin({
      id: "s2",
      order: 1,
      originalTitle: null,
      authors: null,
      entityId: null,
      url: null,
      publicationYear: null,
      edition: null,
      specificReference: null,
      notes: "Elaborado en la academia",
      sourceType: { code: "OWN_MATERIAL", label: "Material de elaboración propia" },
      entity: null,
    });
    expect(mapped.entityName).toBeUndefined();
    expect(mapped.notes).toBe("Elaborado en la academia");
  });
});

describe("mapSourceEntityAdmin", () => {
  it("separa los códigos y las etiquetas de sus tipos y cuenta las fuentes", () => {
    expect(
      mapSourceEntityAdmin({
        id: "e1",
        name: "Chessable",
        website: "https://www.chessable.com/",
        description: null,
        kinds: [
          { kind: { code: "DIGITAL_PLATFORM", label: "Plataforma digital" } },
          { kind: { code: "CONTENT_PROVIDER", label: "Proveedor de contenido" } },
        ],
        _count: { sources: 3 },
      }),
    ).toEqual({
      id: "e1",
      name: "Chessable",
      website: "https://www.chessable.com/",
      description: undefined,
      kindCodes: ["DIGITAL_PLATFORM", "CONTENT_PROVIDER"],
      kindLabels: ["Plataforma digital", "Proveedor de contenido"],
      sourceCount: 3,
    });
  });
});
