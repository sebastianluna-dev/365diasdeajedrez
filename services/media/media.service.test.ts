import { describe, expect, it } from "vitest";
import { pointsAt } from "./media.service";

const ID = "365-ajedrez/plataforma/k3x9foto";
const UPLOADED = `https://res.cloudinary.com/demo/image/upload/v1788629615/${ID}.webp`;
const CROPPED = `https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,ar_1:1/v1788629615/${ID}.webp`;

describe("si una columna apunta a la imagen", () => {
  it("la reconoce aunque la URL guardada lleve su recorte", () => {
    expect(pointsAt([null, CROPPED], ID)).toBe(true);
    expect(pointsAt([UPLOADED], ID)).toBe(true);
  });

  it("no la confunde con otra cuyo id empieza igual", () => {
    expect(pointsAt([UPLOADED.replace("k3x9foto", "k3x9fotografia")], ID)).toBe(false);
  });

  it("no cuenta las columnas vacías ni las imágenes que no son de la plataforma", () => {
    expect(pointsAt([null, null], ID)).toBe(false);
    expect(pointsAt([`https://example.com/${ID}.webp`], ID)).toBe(false);
  });
});
