import { createElement, Fragment } from "react";
import { describe, expect, it } from "vitest";
import { isOptionalControl } from "./optional-control";

// A stand-in for any component child (a select, a date picker, cards): the
// rule never marks one, whatever its props say.
function Picker(props: { required?: boolean }) {
  return createElement("span", props);
}

describe("isOptionalControl", () => {
  it("marca un área de texto y un campo en el que se escribe, si no son obligatorios", () => {
    expect(isOptionalControl(createElement("textarea"))).toBe(true);
    expect(isOptionalControl(createElement("input"))).toBe(true);
    for (const type of ["text", "email", "password", "url", "tel", "number", "date", "datetime-local", "time"]) {
      expect(isOptionalControl(createElement("input", { type }))).toBe(true);
    }
  });

  it("no marca lo obligatorio", () => {
    expect(isOptionalControl(createElement("input", { required: true }))).toBe(false);
    expect(isOptionalControl(createElement("textarea", { required: true }))).toBe(false);
    expect(isOptionalControl(createElement("input", { required: false }))).toBe(true);
  });

  it("no marca una búsqueda, una casilla, un radio, un campo oculto ni un archivo", () => {
    for (const type of ["search", "checkbox", "radio", "hidden", "file"]) {
      expect(isOptionalControl(createElement("input", { type }))).toBe(false);
    }
  });

  it("no marca un componente, un fragmento ni lo que no es un elemento", () => {
    expect(isOptionalControl(createElement(Picker))).toBe(false);
    expect(isOptionalControl(createElement(Fragment, null, createElement("input")))).toBe(false);
    expect(isOptionalControl([createElement("input"), createElement("input")])).toBe(false);
    expect(isOptionalControl(null)).toBe(false);
    expect(isOptionalControl("texto")).toBe(false);
  });
});
