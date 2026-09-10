import { describe, expect, it } from "vitest";

import {
  endPathOf,
  MOVE_REMARK_NAGS,
  nagCodeFor,
  nagCodesOf,
  nagGlyph,
  nextPathOf,
  nodeAtPath,
  parentPathOf,
  parsePgnTree,
  sansAlongPath,
  type PgnTree,
} from "@/lib/chess/pgn-tree";

// Real PGN of the lesson "¿Qué es la Siciliana?" (prisma/seed-data.ts). It is
// copied as a literal on purpose: the tests are unit tests and must not touch Prisma.
const SICILIANA_PGN = `1. e4 c5 {La Defensa Siciliana: el negro evita la simetría y lucha por la casilla d4 desde la primera jugada. [%csl Gc5,Gd4][%cal Gc5d4]} 2. Nf3 ( 2. Nc3 Nc6 3. g3 g6 {La Siciliana Cerrada: un plan completamente distinto, sin apertura del centro.} ) 2... d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 {La posición base de la Siciliana Abierta. El negro cambió un peón de flanco por un peón central. [%cal Gf6e4,Gc3e4]} *`;

// PGN of the lesson "La posición de Lucena": it carries a FEN header.
const LUCENA_FEN = "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1";
const LUCENA_PGN = `[FEN "${LUCENA_FEN}"]

1. Rd1+ {Primero se expulsa al rey enemigo de la zona de coronación.} 1... Ke7 2. Rd4 {La jugada clave de toda la técnica: la torre se prepara para construir el puente en la cuarta fila. [%csl Gd4]} 2... Ra1 3. Kc7 Rc1+ 4. Kb6 Rb1+ 5. Kc6 Rc1+ 6. Kb5 Rb1+ 7. Rb4 {El puente está construido: la torre corta los jaques y el peón corona sin remedio. [%cal Gb7b8][%csl Gb4]} *`;

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Path of the last node of the Sicilian main line (5. Nc3). */
const SICILIANA_MAINLINE_END = "0.0.0.0.0.0.0.0.0";

function parseOrFail(pgn: string): PgnTree {
  const tree = parsePgnTree(pgn);
  expect(tree).not.toBeNull();
  return tree as PgnTree;
}

describe("parsePgnTree — PGN con variante, comentarios y anotaciones visuales", () => {
  const tree = parseOrFail(SICILIANA_PGN);

  it("encadena la línea principal por children[0] con rutas punteadas", () => {
    expect(tree.initialFen).toBe(STARTING_FEN);
    expect(tree.children).toHaveLength(1);

    const mainline = ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3"];
    let path = "";
    mainline.forEach((san, index) => {
      path = index === 0 ? "0" : `${path}.0`;
      const node = nodeAtPath(tree, path);
      expect(node?.path).toBe(path);
      expect(node?.san).toBe(san);
      expect(node?.ply).toBe(index + 1);
    });
    expect(path).toBe(SICILIANA_MAINLINE_END);
    expect(nodeAtPath(tree, SICILIANA_MAINLINE_END)?.children).toHaveLength(0);
  });

  it("cuelga la variante 2. Nc3 como children[1] del nodo 1... c5", () => {
    const c5 = nodeAtPath(tree, "0.0");
    expect(c5?.san).toBe("c5");
    expect(c5?.children).toHaveLength(2);
    expect(c5?.children[0].san).toBe("Nf3"); // main continuation
    expect(c5?.children[1].san).toBe("Nc3"); // variation
    expect(c5?.children[1].path).toBe("0.0.1");

    // The variation keeps its own ply numbering and its own line.
    const variante = ["Nc3", "Nc6", "g3", "g6"];
    let path = "0.0";
    variante.forEach((san, index) => {
      path = index === 0 ? "0.0.1" : `${path}.0`;
      const node = nodeAtPath(tree, path);
      expect(node?.san).toBe(san);
      expect(node?.ply).toBe(index + 3);
    });
    expect(nodeAtPath(tree, "0.0.1.0.0.0")?.comment).toBe(
      "La Siciliana Cerrada: un plan completamente distinto, sin apertura del centro.",
    );
  });

  it("limpia el comentario de los comandos [%cal] y [%csl]", () => {
    const c5 = nodeAtPath(tree, "0.0");
    expect(c5?.comment).toBe(
      "La Defensa Siciliana: el negro evita la simetría y lucha por la casilla d4 desde la primera jugada.",
    );
    expect(c5?.comment).not.toContain("%cal");
    expect(c5?.comment).not.toContain("%csl");
    expect(c5?.showDiagram).toBe(false);
  });

  it("convierte [%cal] en flechas y [%csl] en casillas con el brush correcto", () => {
    const c5 = nodeAtPath(tree, "0.0");
    // The arrows ([%cal]) are read before the squares ([%csl]).
    expect(c5?.shapes).toEqual([
      { brush: "green", orig: "c5", dest: "d4" },
      { brush: "green", orig: "c5" },
      { brush: "green", orig: "d4" },
    ]);

    const nc3 = nodeAtPath(tree, SICILIANA_MAINLINE_END);
    expect(nc3?.shapes).toEqual([
      { brush: "green", orig: "f6", dest: "e4" },
      { brush: "green", orig: "c3", dest: "e4" },
    ]);
  });

  it("traduce la letra del comando al brush de chessground", () => {
    const anotado = parseOrFail("1. e4 {[%cal Re1e2,Bd1d2][%csl Ye4,Ga1]} *");
    expect(anotado.children[0].shapes).toEqual([
      { brush: "red", orig: "e1", dest: "e2" },
      { brush: "blue", orig: "d1", dest: "d2" },
      { brush: "yellow", orig: "e4" },
      { brush: "green", orig: "a1" },
    ]);
    // Without loose text, the comment stays undefined (not an empty string).
    expect(anotado.children[0].comment).toBeUndefined();
  });

  it("no arrastra comentario ni shapes a la posición inicial", () => {
    expect(tree.initialComment).toBeUndefined();
    expect(tree.initialShapes).toEqual([]);
    expect(tree.warnings).toEqual([]);
  });
});

describe("navegación por rutas", () => {
  const tree = parseOrFail(SICILIANA_PGN);

  it("nodeAtPath devuelve undefined para la raíz y para rutas rotas", () => {
    expect(nodeAtPath(tree, "")).toBeUndefined();
    expect(nodeAtPath(tree, "9.9")).toBeUndefined();
    expect(nodeAtPath(tree, "0")?.san).toBe("e4");
  });

  it("parentPathOf sube un nivel y devuelve la raíz para los hijos de primer nivel", () => {
    expect(parentPathOf("0")).toBe("");
    expect(parentPathOf("0.0")).toBe("0");
    expect(parentPathOf("0.0.1")).toBe("0.0");
    expect(parentPathOf("")).toBe("");
  });

  it("nextPathOf sigue el hijo principal y es undefined al final de la línea", () => {
    expect(nextPathOf(tree, "")).toBe("0");
    expect(nextPathOf(tree, "0")).toBe("0.0");
    // From 1... c5 the "next" one is the main line (Nf3), never the variation.
    expect(nextPathOf(tree, "0.0")).toBe("0.0.0");
    expect(nextPathOf(tree, SICILIANA_MAINLINE_END)).toBeUndefined();
    expect(nextPathOf(tree, "0.0.1.0.0.0")).toBeUndefined();
    expect(nextPathOf(tree, "ruta-inexistente")).toBeUndefined();
  });

  it("endPathOf llega al final de la línea principal desde cualquier punto", () => {
    expect(endPathOf(tree, "")).toBe(SICILIANA_MAINLINE_END);
    expect(endPathOf(tree, "0.0")).toBe(SICILIANA_MAINLINE_END);
    expect(endPathOf(tree, SICILIANA_MAINLINE_END)).toBe(SICILIANA_MAINLINE_END);
    // Inside the variation, the end is the end of THAT branch.
    expect(endPathOf(tree, "0.0.1")).toBe("0.0.1.0.0.0");
  });
});

describe("parsePgnTree — cabecera FEN", () => {
  it("respeta el FEN de la cabecera como posición inicial", () => {
    const tree = parseOrFail(LUCENA_PGN);
    expect(tree.initialFen).toBe(LUCENA_FEN);
  });

  it("numera el primer ply como 1 aunque la partida arranque de un FEN", () => {
    const tree = parseOrFail(LUCENA_PGN);
    const first = tree.children[0];
    expect(first.san).toBe("Rd1+");
    expect(first.ply).toBe(1);
    expect(first.check).toBe(true);
    expect(first.lastMove).toEqual(["c1", "d1"]);
    expect(first.comment).toBe("Primero se expulsa al rey enemigo de la zona de coronación.");
  });

  it("mantiene las anotaciones visuales de la línea del puente", () => {
    const tree = parseOrFail(LUCENA_PGN);
    expect(nodeAtPath(tree, "0.0.0")?.shapes).toEqual([{ brush: "green", orig: "d4" }]);
    expect(nodeAtPath(tree, endPathOf(tree, ""))?.shapes).toEqual([
      { brush: "green", orig: "b7", dest: "b8" },
      { brush: "green", orig: "b4" },
    ]);
  });
});

describe("parsePgnTree — entradas inválidas", () => {
  it("devuelve null con un PGN vacío, sin lanzar", () => {
    expect(() => parsePgnTree("")).not.toThrow();
    expect(parsePgnTree("")).toBeNull();
  });

  it("devuelve un árbol sin hijos con texto que no es PGN, sin lanzar", () => {
    const tree = parseOrFail("esto no es un pgn");
    expect(tree.children).toEqual([]);
    expect(tree.nodesByPath.size).toBe(0);
    expect(tree.initialFen).toBe(STARTING_FEN);
  });

  it("conserva el prefijo legal y avisa cuando un SAN es ilegal", () => {
    // Nf6 is not a legal move for White in that position.
    const tree = parseOrFail("1. e4 e5 2. Nf6");
    expect([...tree.nodesByPath.keys()].sort()).toEqual(["0", "0.0"]);
    expect(nodeAtPath(tree, "0")?.san).toBe("e4");
    expect(nodeAtPath(tree, "0.0")?.san).toBe("e5");
    expect(tree.warnings).toHaveLength(1);
    expect(tree.warnings[0]).toContain("Nf6");
  });

  it("avisa de un SAN que ni siquiera tiene forma de jugada", () => {
    // "Qz9" is filtered by chessops's tokeniser before reaching parseSan, so the
    // branch is lost all the same; the warning comes from scanning the raw text
    // (lib/chess/movetext-scan.ts).
    const tree = parseOrFail("1. e4 e5 2. Qz9");
    expect([...tree.nodesByPath.keys()].sort()).toEqual(["0", "0.0"]);
    expect(tree.warnings).toHaveLength(1);
    expect(tree.warnings[0]).toContain("Qz9");
  });
});

describe("sansAlongPath", () => {
  const tree = parseOrFail(SICILIANA_PGN);

  it("da las jugadas que llevan hasta la posición, en orden", () => {
    expect(sansAlongPath(tree, "0.0.0")).toEqual(["e4", "c5", "Nf3"]);
    // Inside a variation, its own: it is the real path, not the main one.
    expect(sansAlongPath(tree, "0.0.1.0")).toEqual(["e4", "c5", "Nc3", "Nc6"]);
  });

  it("en la posición inicial no hay ninguna", () => {
    expect(sansAlongPath(tree, "")).toEqual([]);
  });

  it("ante una ruta rota no devuelve media línea", () => {
    expect(sansAlongPath(tree, "0.0.9")).toEqual([]);
  });
});

describe("nagGlyph", () => {
  it("traduce los NAGs conocidos", () => {
    expect(nagGlyph(1)).toBe("!");
    expect(nagGlyph(4)).toBe("??");
    expect(nagGlyph(14)).toBe("⩲");
    expect(nagGlyph(146)).toBe("N");
  });

  it("da el mismo símbolo a las dos mitades de una pareja", () => {
    // $36 is "White has the initiative" and $37 the black equivalent: whose it is
    // is known from the move, so there is a single symbol.
    expect(nagGlyph(36)).toBe(nagGlyph(37));
    expect(nagGlyph(132)).toBe("⇆");
  });

  it("cae en $<n> para NAGs desconocidos", () => {
    expect(nagGlyph(250)).toBe("$250");
    expect(nagGlyph(0)).toBe("$0");
  });
});

describe("nagCodeFor", () => {
  const initiative = MOVE_REMARK_NAGS.find((option) => option.glyph === "↑")!;
  const novelty = MOVE_REMARK_NAGS.find((option) => option.glyph === "N")!;

  it("escribe el código del bando que juega", () => {
    expect(nagCodeFor(initiative, true)).toBe(36);
    expect(nagCodeFor(initiative, false)).toBe(37);
  });

  it("usa el único que hay cuando el signo no distingue bando", () => {
    expect(nagCodeFor(novelty, true)).toBe(146);
    expect(nagCodeFor(novelty, false)).toBe(146);
    expect(nagCodesOf(novelty)).toEqual([146]);
    expect(nagCodesOf(initiative)).toEqual([36, 37]);
  });
});

describe("numeración cuando la partida arranca en un FEN", () => {
  const FEN = "8/Q3ppk1/1p2r1p1/4b3/P5Pp/1PB1P3/5P1q/2R3K1 w - - 2 44";
  const numberOf = (ply: number) => Math.ceil(ply / 2);
  const isWhite = (ply: number) => ply % 2 === 1;

  it("la primera jugada lleva el número del FEN, no el 1", () => {
    const tree = parsePgnTree(`[FEN "${FEN}"]\n[SetUp "1"]\n\n1. Kf1 Qh1+ 2. Ke2 Qxc1 *`);
    const [first] = tree!.children;
    expect(numberOf(first.ply)).toBe(44);
    expect(isWhite(first.ply)).toBe(true);
  });

  it("y la siguiente sigue contando desde ahí", () => {
    const tree = parsePgnTree(`[FEN "${FEN}"]\n[SetUp "1"]\n\n1. Kf1 Qh1+ 2. Ke2 Qxc1 *`);
    const plies: number[] = [];
    let node = tree!.children[0];
    while (node) {
      plies.push(node.ply);
      node = node.children[0];
    }
    expect(plies.map(numberOf)).toEqual([44, 44, 45, 45]);
    expect(plies.map(isWhite)).toEqual([true, false, true, false]);
  });

  it("si en el FEN mueven las negras, la primera jugada es de las negras", () => {
    // Same position one ply later: 44… Qh1+ and not "44. Qh1+".
    const black = "8/Q3ppk1/1p2r1p1/4b3/P5Pp/1PB1P3/5P1q/2R2K2 b - - 3 44";
    const tree = parsePgnTree(`[FEN "${black}"]\n[SetUp "1"]\n\n1... Qh1+ *`);
    const [first] = tree!.children;
    expect(numberOf(first.ply)).toBe(44);
    expect(isWhite(first.ply)).toBe(false);
  });

  it("sin FEN se sigue empezando en 1", () => {
    const tree = parsePgnTree("1. e4 e5 *");
    expect(tree!.children[0].ply).toBe(1);
  });
});
