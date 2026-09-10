import { describe, expect, it } from "vitest";
import { readBoolean, readClampedInt, readOptionalText, readText, readUrl } from "./form-data";

function form(entries: Record<string, string | Blob>): FormData {
  const data = new FormData();
  for (const [field, value] of Object.entries(entries)) data.append(field, value);
  return data;
}

describe("readText", () => {
  it("recorta el texto y devuelve vacío si el campo falta o no es texto", () => {
    expect(readText(form({ name: "  Ana  " }), "name")).toBe("Ana");
    expect(readText(form({}), "name")).toBe("");
    expect(readText(form({ name: new Blob(["x"]) }), "name")).toBe("");
  });
});

describe("readOptionalText", () => {
  it("devuelve null cuando está vacío y acota la longitud", () => {
    expect(readOptionalText(form({ bio: "   " }), "bio", 10)).toBeNull();
    expect(readOptionalText(form({ bio: "abcdefghijklmnop" }), "bio", 5)).toBe("abcde");
  });
});

describe("readUrl", () => {
  it("acepta sólo http(s) y la normaliza", () => {
    expect(readUrl(form({ url: "https://ejemplo.com" }), "url")).toBe("https://ejemplo.com/");
    expect(readUrl(form({ url: "http://ejemplo.com/a?b=1" }), "url")).toBe("http://ejemplo.com/a?b=1");
  });

  it("rechaza otros esquemas y lo que no es una URL", () => {
    for (const raw of ["javascript:alert(1)", "data:text/html,hola", "ftp://x", "no es url", ""]) {
      expect(readUrl(form({ url: raw }), "url"), raw).toBeNull();
    }
  });
});

describe("readClampedInt", () => {
  it("acepta enteros dentro del rango, extremos incluidos", () => {
    expect(readClampedInt(form({ n: "7" }), "n", 0, 10)).toBe(7);
    expect(readClampedInt(form({ n: "0" }), "n", 0, 10)).toBe(0);
    expect(readClampedInt(form({ n: "10" }), "n", 0, 10)).toBe(10);
    expect(readClampedInt(form({ n: "-3" }), "n", -5, 5)).toBe(-3);
  });

  it("devuelve null fuera de rango o si no es un entero", () => {
    for (const raw of ["11", "-1", "1.5", "abc", "", "1e3"]) {
      expect(readClampedInt(form({ n: raw }), "n", 0, 10), raw).toBeNull();
    }
  });
});

describe("readBoolean", () => {
  it("es true sólo si el checkbox vino en el formulario", () => {
    expect(readBoolean(form({ agree: "on" }), "agree")).toBe(true);
    expect(readBoolean(form({}), "agree")).toBe(false);
  });
});
