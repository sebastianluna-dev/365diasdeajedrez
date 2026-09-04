import { describe, expect, it } from "vitest";
import { plainMovetext } from "./plain-movetext";

describe("plainMovetext", () => {
  it("deja sólo las jugadas de la línea principal", () => {
    const pgn = `[Event "Prueba"]
[White "Ana"]
[Black "Beto"]
[Result "1-0"]

1. e4 {Avance central} e5 $1 ( 1... c5 2. Nf3 ) 2. Nf3 Nc6 1-0`;

    expect(plainMovetext(pgn)).toBe("1. e4 e5 2. Nf3 Nc6");
  });

  it("no arrastra cabeceras, comentarios ni anotaciones", () => {
    const copy = plainMovetext('[White "Ana"]\n\n1. d4 {Comentario} d5 $2 *') ?? "";

    expect(copy).not.toContain("[");
    expect(copy).not.toContain("{");
    expect(copy).not.toContain("$");
    expect(copy).toBe("1. d4 d5");
  });

  it("conserva la posición de partida cuando no es la inicial", () => {
    // Sin el FEN, las jugadas no se pueden reproducir en ningún sitio: eso es
    // peor que llevar dos líneas de cabecera.
    const fen = "4k3/8/8/8/8/8/4P3/4K3 w - - 0 40";
    const copy = plainMovetext(`[SetUp "1"]\n[FEN "${fen}"]\n\n40. e4 Kd7 *`) ?? "";

    expect(copy).toContain(`[FEN "${fen}"]`);
    expect(copy.trimEnd().endsWith("40. e4 Kd7")).toBe(true);
  });

  it("numera desde donde arranca la partida, no desde uno", () => {
    const fen = "4k3/8/8/8/8/8/4P3/4K3 b - - 0 24";
    const copy = plainMovetext(`[SetUp "1"]\n[FEN "${fen}"]\n\n24... Kd7 25. e4 *`) ?? "";

    expect(copy).toContain("24... Kd7 25. e4");
  });

  it("devuelve null cuando no hay ninguna jugada que copiar", () => {
    expect(plainMovetext('[White "Ana"]\n\n*')).toBeNull();
    expect(plainMovetext("")).toBeNull();
  });
});
