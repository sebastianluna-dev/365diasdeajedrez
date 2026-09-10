import { describe, expect, it } from "vitest";
import { generateSlug } from "./generate-slug";

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
