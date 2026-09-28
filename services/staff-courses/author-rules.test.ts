import { describe, expect, it } from "vitest";
import { authorInitials, authorSlugFor, authorTone, suggestAuthors } from "./author-rules";

describe("authorInitials", () => {
  it("toma la primera letra de las dos primeras palabras", () => {
    expect(authorInitials("Equipo 365")).toBe("E3");
    expect(authorInitials("María GM")).toBe("MG");
    expect(authorInitials("josé raúl capablanca")).toBe("JR");
  });

  it("con una sola palabra, una sola letra; sin nombre, nada", () => {
    expect(authorInitials("  Kotov ")).toBe("K");
    expect(authorInitials("ángel")).toBe("Á");
    expect(authorInitials("   ")).toBe("");
  });
});

describe("authorTone", () => {
  it("sale del nombre: el mismo autor, siempre el mismo tono", () => {
    expect(authorTone("Equipo 365")).toBe(authorTone("  Equipo 365 "));
    expect(["ink", "soft"]).toContain(authorTone("María GM"));
  });

  it("no todos los autores caen en el mismo tono", () => {
    const tones = new Set(["Equipo 365", "María GM", "Kotov", "Ana", "Luis"].map(authorTone));
    expect(tones.size).toBe(2);
  });
});

describe("authorSlugFor", () => {
  it("es el slug del nombre cuando nadie más lo tiene", () => {
    expect(authorSlugFor("María GM", ["equipo-365"])).toBe("maria-gm");
  });

  it("añade un número cuando otro autor ya lo tiene", () => {
    expect(authorSlugFor("María GM", ["maria-gm"])).toBe("maria-gm-2");
    expect(authorSlugFor("María GM", ["maria-gm", "maria-gm-2"])).toBe("maria-gm-3");
  });

  it("un nombre del que no sale nada no tiene slug", () => {
    expect(authorSlugFor("¡¿?!", [])).toBe("");
  });
});

describe("suggestAuthors", () => {
  const AUTHORS = [{ name: "Ana María Ruiz" }, { name: "Equipo 365" }, { name: "María GM" }, { name: "Mario Pérez" }];

  it("sin nada escrito no sugiere a nadie", () => {
    expect(suggestAuthors(AUTHORS, "")).toEqual([]);
    expect(suggestAuthors(AUTHORS, "   ")).toEqual([]);
  });

  it("ignora mayúsculas y tildes, y pone delante a quien empieza por lo escrito", () => {
    expect(suggestAuthors(AUTHORS, "mar").map((author) => author.name)).toEqual([
      "María GM",
      "Mario Pérez",
      "Ana María Ruiz",
    ]);
    expect(suggestAuthors(AUTHORS, "MARÍA").map((author) => author.name)).toEqual(["María GM", "Ana María Ruiz"]);
  });

  it("corta la lista en el límite, y nadie coincide si nadie coincide", () => {
    expect(suggestAuthors(AUTHORS, "a", 2)).toHaveLength(2);
    expect(suggestAuthors(AUTHORS, "kotov")).toEqual([]);
  });
});
