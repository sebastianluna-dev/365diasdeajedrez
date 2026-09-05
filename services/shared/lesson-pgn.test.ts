import { describe, expect, it } from "vitest";

import { lessonHasContent, lessonPgnOf } from "@/services/shared/lesson-pgn";

const OWN = "1. e4 e5 2. Nf3 *";
const LINKED = "1. d4 d5 2. c4 *";

describe("lessonPgnOf", () => {
  it("sin partida vinculada, manda el PGN propio", () => {
    expect(lessonPgnOf({ pgn: OWN, game: null })).toBe(OWN);
  });

  it("con partida vinculada, manda la partida", () => {
    expect(lessonPgnOf({ pgn: OWN, game: { pgn: LINKED } })).toBe(LINKED);
  });

  it("la partida manda aunque la lección conserve el suyo: desvincular lo devuelve", () => {
    const linked = { pgn: OWN, game: { pgn: LINKED } };
    expect(lessonPgnOf(linked)).toBe(LINKED);
    expect(lessonPgnOf({ ...linked, game: null })).toBe(OWN);
  });

  it("una partida vacía gana igual: es lo que dice la lección que hay que enseñar", () => {
    // Y no cae al PGN propio, que sería enseñar un contenido que nadie eligió.
    expect(lessonPgnOf({ pgn: OWN, game: { pgn: "" } })).toBe("");
  });
});

describe("lessonHasContent", () => {
  it("mira la fuente que manda, no las dos", () => {
    expect(lessonHasContent({ pgn: OWN, game: { pgn: "" } })).toBe(false);
    expect(lessonHasContent({ pgn: "", game: { pgn: LINKED } })).toBe(true);
  });

  it("el blanco no cuenta como contenido", () => {
    expect(lessonHasContent({ pgn: "   \n  ", game: null })).toBe(false);
    expect(lessonHasContent({ pgn: OWN, game: null })).toBe(true);
  });
});
