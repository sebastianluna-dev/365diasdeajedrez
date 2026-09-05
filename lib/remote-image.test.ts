import { describe, expect, it } from "vitest";

import { isDisplayableImage } from "@/lib/remote-image";

describe("isDisplayableImage", () => {
  it("acepta el host configurado en next.config", () => {
    expect(isDisplayableImage("https://res.cloudinary.com/demo/image/upload/a.jpg")).toBe(true);
  });

  it("acepta rutas propias de la app", () => {
    expect(isDisplayableImage("/portadas/finales.jpg")).toBe(true);
  });

  it("rechaza cualquier otro host, que es lo que tumbaría la página", () => {
    expect(isDisplayableImage("https://example.com/a.jpg")).toBe(false);
    expect(isDisplayableImage("http://res.cloudinary.com/a.jpg")).toBe(false);
  });

  it("rechaza lo que no es una URL, sin lanzar", () => {
    expect(isDisplayableImage("no es una url")).toBe(false);
    expect(isDisplayableImage("")).toBe(false);
    expect(isDisplayableImage(undefined)).toBe(false);
    expect(isDisplayableImage(null)).toBe(false);
  });
});
