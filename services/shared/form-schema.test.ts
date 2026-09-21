import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  formCheckbox,
  formCode,
  formEmail,
  formInt,
  formOptionalText,
  formOptionalUrl,
  formText,
  parseForm,
} from "./form-schema";

function form(entries: Record<string, string | string[] | Blob>): FormData {
  const data = new FormData();
  for (const [field, value] of Object.entries(entries)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(field, item);
  }
  return data;
}

describe("parseForm", () => {
  const schema = z.object({
    name: formText(10),
    bio: formOptionalText(20),
    site: formOptionalUrl(),
    minutes: formInt(1, 120),
    priority: formCheckbox(),
    kind: formCode(["STUDY", "TOURNAMENT"]),
    studentIds: z.array(z.string().min(1)),
  });

  it("lee sólo los campos declarados, recortando y tipando cada uno", () => {
    const data = parseForm(
      schema,
      form({
        name: "  Ana ",
        bio: "   ",
        site: " https://ejemplo.com/x ",
        minutes: "30",
        priority: "on",
        kind: "STUDY",
        studentIds: ["a", "b"],
        extra: "ignorado",
      }),
    );
    expect(data).toEqual({
      ok: true,
      data: {
        name: "Ana",
        bio: null,
        site: "https://ejemplo.com/x",
        minutes: 30,
        priority: true,
        kind: "STUDY",
        studentIds: ["a", "b"],
      },
    });
  });

  it("un campo ausente es opcional o inválido según el esquema", () => {
    const data = parseForm(schema, form({ name: "Ana", minutes: "5", kind: "TOURNAMENT" }));
    expect(data).toMatchObject({ ok: true, data: { bio: null, site: null, priority: false, studentIds: [] } });
  });

  it("nombra el primer campo que falla y el tipo de fallo", () => {
    const valid = { name: "Ana", minutes: "5", kind: "STUDY" };
    expect(parseForm(schema, form({ ...valid, name: "  " }))).toEqual({ ok: false, field: "name", code: "too_small" });
    expect(parseForm(schema, form({ ...valid, minutes: "121" }))).toMatchObject({ ok: false, field: "minutes" });
    expect(parseForm(schema, form({ ...valid, minutes: "5.5" }))).toMatchObject({ ok: false, field: "minutes" });
    expect(parseForm(schema, form({ ...valid, kind: "MY_GAMES" }))).toMatchObject({ ok: false, field: "kind" });
    expect(parseForm(schema, form({ ...valid, name: new Blob(["x"]) }))).toMatchObject({ ok: false, field: "name" });
  });

  it("acota la longitud en vez de recortarla en silencio", () => {
    expect(parseForm(schema, form({ name: "12345678901", minutes: "5", kind: "STUDY" }))).toEqual({
      ok: false,
      field: "name",
      code: "too_big",
    });
    expect(parseForm(schema, form({ name: "Ana", bio: "x".repeat(21), minutes: "5", kind: "STUDY" }))).toMatchObject({
      ok: false,
      field: "bio",
    });
  });
});

describe("formOptionalUrl", () => {
  it("acepta http(s) y rechaza otros esquemas o basura", () => {
    const schema = z.object({ url: formOptionalUrl() });
    expect(parseForm(schema, form({ url: "http://a.b/c" }))).toEqual({ ok: true, data: { url: "http://a.b/c" } });
    expect(parseForm(schema, form({ url: "javascript:alert(1)" }))).toMatchObject({ ok: false, field: "url" });
    expect(parseForm(schema, form({ url: "no es una url" }))).toMatchObject({ ok: false, field: "url" });
    expect(parseForm(schema, form({}))).toEqual({ ok: true, data: { url: null } });
  });
});

describe("formEmail", () => {
  it("normaliza a minúsculas y exige la forma de un correo", () => {
    const schema = z.object({ email: formEmail() });
    expect(parseForm(schema, form({ email: "  Ana@Ejemplo.COM " }))).toEqual({
      ok: true,
      data: { email: "ana@ejemplo.com" },
    });
    expect(parseForm(schema, form({ email: "sin arroba" }))).toMatchObject({ ok: false, field: "email" });
  });
});
