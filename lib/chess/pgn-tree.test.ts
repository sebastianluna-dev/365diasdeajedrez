import { describe, expect, it } from "vitest";

import {
  endPathOf,
  nagGlyph,
  nextPathOf,
  nodeAtPath,
  parentPathOf,
  parsePgnTree,
  type PgnTree,
} from "@/lib/chess/pgn-tree";

// PGN real de la lección «¿Qué es la Siciliana?» (prisma/seed-data.ts). Se copia
// como literal a propósito: los tests son unitarios y no deben tocar Prisma.
const SICILIANA_PGN = `1. e4 c5 {La Defensa Siciliana: el negro evita la simetría y lucha por la casilla d4 desde la primera jugada. [%csl Gc5,Gd4][%cal Gc5d4]} 2. Nf3 ( 2. Nc3 Nc6 3. g3 g6 {La Siciliana Cerrada: un plan completamente distinto, sin apertura del centro.} ) 2... d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 {La posición base de la Siciliana Abierta. El negro cambió un peón de flanco por un peón central. [%cal Gf6e4,Gc3e4]} *`;

// PGN de la lección «La posición de Lucena»: lleva cabecera FEN.
const LUCENA_FEN = "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1";
const LUCENA_PGN = `[FEN "${LUCENA_FEN}"]

1. Rd1+ {Primero se expulsa al rey enemigo de la zona de coronación.} 1... Ke7 2. Rd4 {La jugada clave de toda la técnica: la torre se prepara para construir el puente en la cuarta fila. [%csl Gd4]} 2... Ra1 3. Kc7 Rc1+ 4. Kb6 Rb1+ 5. Kc6 Rc1+ 6. Kb5 Rb1+ 7. Rb4 {El puente está construido: la torre corta los jaques y el peón corona sin remedio. [%cal Gb7b8][%csl Gb4]} *`;

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Ruta del último nodo de la línea principal siciliana (5. Nc3). */
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
    expect(c5?.children[0].san).toBe("Nf3"); // continuación principal
    expect(c5?.children[1].san).toBe("Nc3"); // variante
    expect(c5?.children[1].path).toBe("0.0.1");

    // La variante mantiene su propia numeración de ply y su propia línea.
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
    // Las flechas ([%cal]) se leen antes que las casillas ([%csl]).
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
    // Sin texto suelto, el comentario queda en undefined (no en cadena vacía).
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
    // Desde 1... c5 la «siguiente» es la principal (Nf3), nunca la variante.
    expect(nextPathOf(tree, "0.0")).toBe("0.0.0");
    expect(nextPathOf(tree, SICILIANA_MAINLINE_END)).toBeUndefined();
    expect(nextPathOf(tree, "0.0.1.0.0.0")).toBeUndefined();
    expect(nextPathOf(tree, "ruta-inexistente")).toBeUndefined();
  });

  it("endPathOf llega al final de la línea principal desde cualquier punto", () => {
    expect(endPathOf(tree, "")).toBe(SICILIANA_MAINLINE_END);
    expect(endPathOf(tree, "0.0")).toBe(SICILIANA_MAINLINE_END);
    expect(endPathOf(tree, SICILIANA_MAINLINE_END)).toBe(SICILIANA_MAINLINE_END);
    // Dentro de la variante, el final es el final de ESA rama.
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
    // Nf6 no es una jugada legal para el blanco en esa posición.
    const tree = parseOrFail("1. e4 e5 2. Nf6");
    expect([...tree.nodesByPath.keys()].sort()).toEqual(["0", "0.0"]);
    expect(nodeAtPath(tree, "0")?.san).toBe("e4");
    expect(nodeAtPath(tree, "0.0")?.san).toBe("e5");
    expect(tree.warnings).toHaveLength(1);
    expect(tree.warnings[0]).toContain("Nf6");
  });

  it("descarta sin aviso un SAN que ni siquiera tiene forma de jugada", () => {
    // Ojo: "Qz9" lo filtra el tokenizador de chessops antes de llegar a
    // parseSan, así que la rama se pierde y warnings queda vacío.
    const tree = parseOrFail("1. e4 e5 2. Qz9");
    expect([...tree.nodesByPath.keys()].sort()).toEqual(["0", "0.0"]);
    expect(tree.warnings).toEqual([]);
  });
});

describe("nagGlyph", () => {
  it("traduce los NAGs conocidos", () => {
    expect(nagGlyph(1)).toBe("!");
    expect(nagGlyph(4)).toBe("??");
    expect(nagGlyph(14)).toBe("⩲");
  });

  it("cae en $<n> para NAGs desconocidos", () => {
    expect(nagGlyph(140)).toBe("$140");
    expect(nagGlyph(0)).toBe("$0");
  });
});
