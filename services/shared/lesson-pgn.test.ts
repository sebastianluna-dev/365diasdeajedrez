import { describe, expect, it } from "vitest";

import {
  lessonHasContent,
  lessonPgnNotEmptyWhere,
  lessonPgnOf,
  lessonStartFenOf,
  type LessonPgnSource,
} from "@/services/shared/lesson-pgn";

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
    // And it does not fall back to the own PGN, which would be showing content
    // nobody chose.
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

/**
 * What PostgreSQL answers to a lesson `where` for one row: `OR`, a to-one
 * relation's `is` (null: there is no related row) and a column's `not`. Any
 * other key throws, so a `where` that grows past what this reads fails here
 * instead of passing by omission.
 */
function rowPasses(where: object, row: object | null): boolean {
  return Object.entries(where).every(([key, condition]) => {
    if (key === "OR") return (condition as object[]).some((branch) => rowPasses(branch, row));
    const value: unknown = row === null ? undefined : (row as Record<string, unknown>)[key];
    const { is, not, ...rest } = condition as { is?: object | null; not?: unknown };
    if (Object.keys(rest).length > 0) throw new Error(`rowPasses does not read ${Object.keys(rest).join(", ")}`);
    if (is === null) return value === null;
    if (is !== undefined) return value !== null && rowPasses(is, value as object);
    return value !== not;
  });
}

describe("lessonPgnNotEmptyWhere", () => {
  // Every pairing of an own PGN with a linked game: empty, blank, with content.
  const OWN_PGNS = ["", " \n\t", "\u00a0\u3000\ufeff", OWN];
  const GAMES = [null, { pgn: "" }, { pgn: "  \n" }, { pgn: LINKED }];
  const LESSONS: LessonPgnSource[] = OWN_PGNS.flatMap((pgn) => GAMES.map((game) => ({ pgn, game })));

  it("deja pasar justo las lecciones cuyo PGN, el que manda, no es la cadena vacía", () => {
    for (const lesson of LESSONS) {
      expect(rowPasses(lessonPgnNotEmptyWhere, lesson), JSON.stringify(lesson)).toBe(lessonPgnOf(lesson) !== "");
    }
  });

  it("no deja fuera ninguna lección con contenido: estrecha la búsqueda sin decidirla", () => {
    for (const lesson of LESSONS.filter(lessonHasContent)) {
      expect(rowPasses(lessonPgnNotEmptyWhere, lesson), JSON.stringify(lesson)).toBe(true);
    }
  });

  it("mira la partida aunque la lección conserve el suyo, como lessonPgnOf", () => {
    expect(rowPasses(lessonPgnNotEmptyWhere, { pgn: OWN, game: { pgn: "" } })).toBe(false);
    expect(rowPasses(lessonPgnNotEmptyWhere, { pgn: "", game: { pgn: LINKED } })).toBe(true);
  });

  it("un PGN en blanco pasa: lo que la base no distingue lo rechaza lessonHasContent", () => {
    const blank = { pgn: " \n\t", game: null };
    expect(rowPasses(lessonPgnNotEmptyWhere, blank)).toBe(true);
    expect(lessonHasContent(blank)).toBe(false);
  });
});

describe("lessonStartFenOf", () => {
  const DIAGRAMA = "1brr2k1/1b3pp1/pp2pqnp/4N2Q/3P4/1B4R1/PP1B1PPP/4R1K1 w - - 0 1";
  const conFen = (fen: string) => `[SetUp "1"]\n[FEN "${fen}"]\n\n*`;

  it("sale de la partida vinculada, no del PGN dormido de la lección", () => {
    // It is the bug this fixes: freezing an exercise against the wrong FEN
    // validates the moves over a board the student never sees.
    const otro = "8/8/8/8/8/5k2/6q1/7K b - - 0 1";
    expect(lessonStartFenOf({ pgn: conFen(otro), game: { pgn: conFen(DIAGRAMA) } })).toBe(DIAGRAMA);
  });

  it("sin partida vinculada, sale del suyo", () => {
    expect(lessonStartFenOf({ pgn: conFen(DIAGRAMA), game: null })).toBe(DIAGRAMA);
  });

  it("es null cuando el contenido arranca en la posición de partida", () => {
    expect(lessonStartFenOf({ pgn: "1. e4 e5 *", game: null })).toBeNull();
  });
});
