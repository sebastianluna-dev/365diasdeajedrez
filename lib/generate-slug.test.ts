import { describe, expect, it } from "vitest";
import { generateSlug, slugAfterRename, uniqueSlug } from "./generate-slug";

describe("generateSlug", () => {
  it("quita tildes y signos, y separa con un solo guion", () => {
    expect(generateSlug("Táctica y Estrategia: ¡Nivel 1!")).toBe("tactica-y-estrategia-nivel-1");
    expect(generateSlug("  Finales   de  torre  ")).toBe("finales-de-torre");
    expect(generateSlug("--Apertura--Española--")).toBe("apertura-espanola");
  });

  it("devuelve vacío si no queda nada utilizable", () => {
    expect(generateSlug("¡¿?!")).toBe("");
  });
});

describe("slugAfterRename", () => {
  it("al cambiar el nombre, el slug pasa a ser el del nombre nuevo", () => {
    expect(slugAfterRename("Finales de torre", "Finales de torre esenciales", "finales-de-torre")).toBe(
      "finales-de-torre-esenciales",
    );
  });

  it("pisa también un slug escrito a mano: manda el nombre nuevo", () => {
    expect(slugAfterRename("Finales de torre", "Finales de dama", "mi-slug-propio")).toBe("finales-de-dama");
  });

  it("si el nombre no cambió, el slug se queda como estaba", () => {
    expect(slugAfterRename("Finales de torre", "Finales de torre", "mi-slug-propio")).toBe("mi-slug-propio");
    expect(slugAfterRename("Finales de torre", "  Finales de torre ", "mi-slug-propio")).toBe("mi-slug-propio");
  });

  it("un nombre del que no sale ningún slug no vacía el campo", () => {
    expect(slugAfterRename("Finales de torre", "¡¿?!", "finales-de-torre")).toBe("finales-de-torre");
    expect(slugAfterRename("Finales de torre", "", "finales-de-torre")).toBe("finales-de-torre");
  });
});

describe("uniqueSlug", () => {
  it("deja el slug como está si nadie lo tiene", () => {
    expect(uniqueSlug("maria-gm", [])).toBe("maria-gm");
    expect(uniqueSlug("maria-gm", ["maria", "maria-gm-2"])).toBe("maria-gm");
  });

  it("busca el primer número libre", () => {
    expect(uniqueSlug("maria-gm", ["maria-gm"])).toBe("maria-gm-2");
    expect(uniqueSlug("maria-gm", ["maria-gm", "maria-gm-2", "maria-gm-4"])).toBe("maria-gm-3");
  });
});
