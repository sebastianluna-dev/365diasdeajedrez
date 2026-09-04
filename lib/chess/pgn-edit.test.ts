import { describe, expect, it } from "vitest";
import {
  addMove,
  commentTextAt,
  deleteFrom,
  emptyGame,
  nodeAtPathIn,
  parseEditableGame,
  pathOfNode,
  positionAtPath,
  promoteOneStep,
  promoteToMainLine,
  serializeGame,
  setCommentText,
  setNags,
  setShapes,
  variationPgn,
} from "./pgn-edit";
import { nodeAtPath, parsePgnTree } from "./pgn-tree";

/** Atajo: el árbol de lectura que verá la interfaz, desde el juego mutable. */
function treeOf(pgn: string) {
  const tree = parsePgnTree(pgn);
  if (!tree) throw new Error("PGN no parseable");
  return tree;
}

/** Sólo los movimientos, sin cabeceras, para comparar sin ruido. */
function movetext(pgn: string): string {
  return pgn
    .split("\n")
    .filter((line) => !line.startsWith("["))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

describe("addMove", () => {
  it("añade la jugada al final de la línea", () => {
    const game = parseEditableGame("1. e4 e5 *")!;

    const result = addMove(game, "0.0", "Nf3");

    expect(result).toEqual({ path: "0.0.0", created: true });
    expect(movetext(serializeGame(game))).toBe("1. e4 e5 2. Nf3 *");
  });

  it("abre una variante al jugar sobre un nodo que ya tiene continuación", () => {
    const game = parseEditableGame("1. e4 e5 2. Nf3 *")!;

    // Sobre 1.e4, que ya lleva 1...e5: la segunda respuesta es una variante.
    const result = addMove(game, "0", "c5");

    expect(result).toEqual({ path: "0.1", created: true });
    expect(movetext(serializeGame(game))).toBe("1. e4 e5 ( 1... c5 ) 2. Nf3 *");
  });

  it("no duplica una jugada que ya está: navega a ella", () => {
    const game = parseEditableGame("1. e4 e5 2. Nf3 *")!;

    const result = addMove(game, "0", "e5");

    expect(result).toEqual({ path: "0.0", created: false });
    // El árbol queda exactamente igual que antes.
    expect(movetext(serializeGame(game))).toBe("1. e4 e5 2. Nf3 *");
  });

  it("guarda el SAN canónico, para que la misma jugada no genere dos ramas", () => {
    const game = parseEditableGame('[FEN "7k/3P4/8/8/8/8/8/4K3 w - - 0 1"]\n*')!;

    // Se pide sin el «+» que la jugada realmente da; chessops lo canoniza.
    const first = addMove(game, "", "d8=Q");
    const second = addMove(game, "", "d8=Q+");

    expect(first?.created).toBe(true);
    expect(second).toEqual({ path: first!.path, created: false });
    expect(nodeAtPathIn(game, "0")!.data.san).toBe("d8=Q+");
  });

  it("rechaza una jugada ilegal sin tocar el árbol", () => {
    const game = parseEditableGame("1. e4 *")!;

    // Tras 1.e4 juegan las negras, y sus caballos (b8, g8) no llegan a f3.
    expect(addMove(game, "0", "Nf3")).toBeNull();
    expect(addMove(game, "0", "esto no es una jugada")).toBeNull();
    expect(movetext(serializeGame(game))).toBe("1. e4 *");
  });

  it("empieza una partida desde cero", () => {
    const game = emptyGame();

    addMove(game, "", "d4");
    addMove(game, "0", "Nf6");

    expect(movetext(serializeGame(game))).toBe("1. d4 Nf6 *");
  });

  it("respeta la posición y la numeración de una partida que empieza en un FEN", () => {
    const game = emptyGame("3b1kn1/6p1/3q1p2/4pPP1/pP2P1N1/3P1NQ1/1rr5/5RRK w - - 0 48")!;

    expect(addMove(game, "", "gxf6")).toEqual({ path: "0", created: true });

    const pgn = serializeGame(game);
    expect(pgn).toContain('[FEN "3b1kn1/6p1/3q1p2/4pPP1/pP2P1N1/3P1NQ1/1rr5/5RRK w - - 0 48"]');
    // La jugada 48, no la 1.
    expect(movetext(pgn)).toBe("48. gxf6 *");
  });
});

describe("promover y borrar", () => {
  const withVariations = "1. e4 e5 ( 1... c5 ) ( 1... e6 ) 2. Nf3 *";

  it("sube una variante una posición entre sus hermanas", () => {
    const game = parseEditableGame(withVariations)!;

    expect(promoteOneStep(game, "0.2")).toBe(true);

    expect(movetext(serializeGame(game))).toBe("1. e4 e5 ( 1... e6 ) ( 1... c5 ) 2. Nf3 *");
  });

  it("no sube la que ya es principal", () => {
    const game = parseEditableGame(withVariations)!;
    expect(promoteOneStep(game, "0.0")).toBe(false);
  });

  it("convierte una variante en la línea principal", () => {
    const game = parseEditableGame(withVariations)!;

    expect(promoteToMainLine(game, "0.1")).toBe(true);

    expect(movetext(serializeGame(game))).toBe("1. e4 c5 ( 1... e5 2. Nf3 ) ( 1... e6 ) *");
  });

  it("al promover arrastra también a los ancestros", () => {
    // La jugada a promover cuelga de una variante: subirla sola la dejaría
    // dentro del paréntesis igualmente.
    const game = parseEditableGame("1. e4 e5 ( 1... c5 2. Nf3 d6 ) 2. Nc3 *")!;
    const target = nodeAtPathIn(game, "0.1.0.0")!;

    expect(promoteToMainLine(game, "0.1.0.0")).toBe(true);

    expect(pathOfNode(game, target)).toBe("0.0.0.0");
    expect(movetext(serializeGame(game))).toBe("1. e4 c5 ( 1... e5 2. Nc3 ) 2. Nf3 d6 *");
  });

  it("borra el nodo y todo lo que cuelga de él", () => {
    const game = parseEditableGame("1. e4 e5 2. Nf3 Nc6 *")!;

    expect(deleteFrom(game, "0.0.0")).toBe(true);

    expect(movetext(serializeGame(game))).toBe("1. e4 e5 *");
  });

  it("devuelve false ante una ruta que no existe", () => {
    const game = parseEditableGame("1. e4 *")!;
    expect(deleteFrom(game, "9.9")).toBe(false);
    expect(promoteToMainLine(game, "9")).toBe(false);
  });
});

describe("pathOfNode", () => {
  it("encuentra la ruta nueva de un nodo después de mutar", () => {
    const game = parseEditableGame("1. e4 e5 ( 1... c5 ) *")!;
    const siciliana = nodeAtPathIn(game, "0.1")!;

    expect(pathOfNode(game, siciliana)).toBe("0.1");

    promoteToMainLine(game, "0.1");

    // La ruta vieja ya señala otra jugada; la referencia sigue valiendo.
    expect(pathOfNode(game, siciliana)).toBe("0.0");
    expect(nodeAtPathIn(game, "0.1")!.data.san).toBe("e5");
  });

  it("devuelve null si el nodo ya no está en el árbol", () => {
    const game = parseEditableGame("1. e4 e5 *")!;
    const node = nodeAtPathIn(game, "0.0")!;

    deleteFrom(game, "0.0");

    expect(pathOfNode(game, node)).toBeNull();
  });
});

describe("positionAtPath", () => {
  it("da la posición del final de la ruta", () => {
    const game = parseEditableGame("1. e4 e5 *")!;

    expect(positionAtPath(game, "")!.turn).toBe("white");
    expect(positionAtPath(game, "0")!.turn).toBe("black");
    expect(positionAtPath(game, "0.0")!.turn).toBe("white");
  });

  it("devuelve null ante una ruta rota", () => {
    const game = parseEditableGame("1. e4 *")!;
    expect(positionAtPath(game, "5")).toBeNull();
  });
});

describe("variationPgn", () => {
  it("copia la línea que pasa por la jugada, sin las hermanas", () => {
    const game = parseEditableGame("1. e4 e5 ( 1... c5 2. Nf3 d6 ) 2. Nf3 *")!;

    // Desde la siciliana: la línea entera hasta su final, con 1.e4 delante y
    // sin rastro de 1...e5.
    expect(movetext(variationPgn(game, "0.1")!)).toBe("1. e4 c5 2. Nf3 d6 *");
  });

  it("conserva comentarios, anotaciones y cabeceras", () => {
    const pgn = '[Event "Prueba"]\n\n1. e4 {Centro} e5 $1 *';
    const game = parseEditableGame(pgn)!;

    const copy = variationPgn(game, "0.0")!;

    expect(copy).toContain('[Event "Prueba"]');
    expect(movetext(copy)).toBe("1. e4 { Centro } e5 $1 *");
  });

  it("devuelve null en la posición inicial y ante una ruta rota", () => {
    const game = parseEditableGame("1. e4 *")!;

    expect(variationPgn(game, "")).toBeNull();
    expect(variationPgn(game, "7")).toBeNull();
  });

  it("no arranca los hijos de la partida original", () => {
    const game = parseEditableGame("1. e4 e5 2. Nf3 *")!;

    variationPgn(game, "0");

    expect(movetext(serializeGame(game))).toBe("1. e4 e5 2. Nf3 *");
  });
});

describe("comentarios y flechas", () => {
  it("cambia el comentario sin borrar las flechas", () => {
    const game = parseEditableGame("1. e4 {Avance central [%cal Ge2e4]} *")!;

    setCommentText(game, "0", "Ocupa el centro");

    const node = nodeAtPath(treeOf(serializeGame(game)), "0")!;
    expect(node.comment).toBe("Ocupa el centro");
    expect(node.shapes).toEqual([{ brush: "green", orig: "e2", dest: "e4" }]);
  });

  it("cambia las flechas sin borrar el comentario", () => {
    const game = parseEditableGame("1. e4 {Avance central [%cal Ge2e4]} *")!;

    setShapes(game, "0", [
      { brush: "red", orig: "d1", dest: "h5" },
      { brush: "blue", orig: "d4" },
    ]);

    const node = nodeAtPath(treeOf(serializeGame(game)), "0")!;
    expect(node.comment).toBe("Avance central");
    // El lector recoge primero [%cal] y después [%csl], así que las flechas
    // salen antes que los círculos sea cual sea el orden en que se escriban.
    expect(node.shapes).toEqual([
      { brush: "red", orig: "d1", dest: "h5" },
      { brush: "blue", orig: "d4" },
    ]);
  });

  it("quita el comentario dejando sólo las flechas, y al revés", () => {
    const game = parseEditableGame("1. e4 {Texto [%cal Ge2e4]} *")!;

    setCommentText(game, "0", "");
    expect(nodeAtPath(treeOf(serializeGame(game)), "0")!.comment).toBeUndefined();
    expect(nodeAtPath(treeOf(serializeGame(game)), "0")!.shapes).toHaveLength(1);

    setShapes(game, "0", []);
    expect(nodeAtPathIn(game, "0")!.data.comments).toBeUndefined();
  });

  it("comenta la posición inicial, antes de la primera jugada", () => {
    const game = parseEditableGame("1. e4 *")!;

    setCommentText(game, "", "Partida de ejemplo");

    expect(treeOf(serializeGame(game)).initialComment).toBe("Partida de ejemplo");
    expect(commentTextAt(game, "")).toBe("Partida de ejemplo");
  });

  it("lee el texto del comentario ya sin comandos", () => {
    const game = parseEditableGame("1. e4 {Buena [%cal Ge2e4][%csl Rd5]} *")!;
    expect(commentTextAt(game, "0")).toBe("Buena");
    expect(commentTextAt(game, "")).toBe("");
  });
});

describe("setNags", () => {
  it("pone y quita la anotación de calidad", () => {
    const game = parseEditableGame("1. e4 e5 *")!;

    setNags(game, "0.0", [4]);
    expect(nodeAtPath(treeOf(serializeGame(game)), "0.0")!.nags).toEqual([4]);

    setNags(game, "0.0", []);
    expect(nodeAtPath(treeOf(serializeGame(game)), "0.0")!.nags).toEqual([]);
  });
});

describe("ida y vuelta", () => {
  it("no pierde variantes anidadas, comentarios, NAGs ni flechas", () => {
    const original =
      '[Event "Prueba"]\n[FEN "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"]\n[SetUp "1"]\n\n' +
      "3... Bc5 $1 {Defensa clásica [%cal Gf8c5]} ( 3... Nf6 $6 ( 3... Be7 ) 4. Ng5 {Ataque [%csl Rf7]} ) 4. c3 *";

    const game = parseEditableGame(original)!;
    const once = serializeGame(game);
    const twice = serializeGame(parseEditableGame(once)!);

    // Estable: serializar dos veces da lo mismo, así que guardar y reabrir no
    // va degradando la partida.
    expect(twice).toBe(once);

    const tree = treeOf(once);
    expect(tree.initialFen).toBe("r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3");
    expect(once).toContain('[Event "Prueba"]');

    const main = nodeAtPath(tree, "0")!;
    expect(main.san).toBe("Bc5");
    expect(main.nags).toEqual([1]);
    expect(main.comment).toBe("Defensa clásica");
    expect(main.shapes).toEqual([{ brush: "green", orig: "f8", dest: "c5" }]);

    expect(nodeAtPath(tree, "1")!.san).toBe("Nf6");
    expect(nodeAtPath(tree, "1")!.nags).toEqual([6]);
    expect(nodeAtPath(tree, "2")!.san).toBe("Be7");
    expect(nodeAtPath(tree, "1.0")!.comment).toBe("Ataque");
  });

  it("devuelve null ante un PGN que no se puede leer", () => {
    expect(parseEditableGame("")).toBeNull();
  });
});
