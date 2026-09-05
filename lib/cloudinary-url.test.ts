import { describe, expect, it } from "vitest";

import { withCoverCrop } from "@/lib/cloudinary-url";

const PLAIN = "https://res.cloudinary.com/demo/image/upload/v1788629615/365-ajedrez/plataforma/portada.jpg";

describe("withCoverCrop", () => {
  it("mete el recorte justo después de /upload/, conservando versión y ruta", () => {
    expect(withCoverCrop(PLAIN, "auto")).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_fill,ar_21:9,g_auto/v1788629615/365-ajedrez/plataforma/portada.jpg",
    );
  });

  it("SUSTITUYE el recorte anterior en vez de encadenarlo", () => {
    // Acumularlos aplicaría cada recorte sobre el resultado del anterior, y a
    // las dos o tres subidas la imagen sería un sello.
    const twice = withCoverCrop(withCoverCrop(PLAIN, "auto"), "auto");
    expect(twice.match(/c_fill/g)).toHaveLength(1);
    expect(twice).toBe(withCoverCrop(PLAIN, "auto"));
  });

  it("no confunde la versión con un tramo de transformaciones", () => {
    expect(withCoverCrop(PLAIN, "auto")).toContain("/v1788629615/");
  });

  it("deja en paz lo que no es de Cloudinary", () => {
    const otra = "https://example.com/imagen.jpg";
    expect(withCoverCrop(otra, "auto")).toBe(otra);
    expect(withCoverCrop("/portadas/local.jpg", "auto")).toBe("/portadas/local.jpg");
  });

  it("admite otra proporción", () => {
    expect(withCoverCrop(PLAIN, "auto", "16:9")).toContain("ar_16:9");
  });
});
