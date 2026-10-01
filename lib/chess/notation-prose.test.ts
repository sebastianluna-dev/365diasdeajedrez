import { describe, expect, it } from "vitest";
import { buildProseBlocks, type ProseBlock } from "./notation-prose";

type VariationBlock = Extract<ProseBlock, { kind: "variation" }>;

/** Narrows as it filters, so a block's brackets can be read off it. */
const isVariation = (block: ProseBlock): block is VariationBlock => block.kind === "variation";
import { parsePgnTree } from "./pgn-tree";

function blocksOf(movetext: string): ProseBlock[] {
  const tree = parsePgnTree(`[Event "Test"]\n\n${movetext}`);
  expect(tree).not.toBeNull();
  return buildProseBlocks(tree!.children);
}

/** A paragraph of moves summarised as it is read, comments in braces. */
function text(block: ProseBlock | undefined): string {
  if (block?.kind === "comment") throw new Error("es un comentario, no una tirada");
  if (!block) throw new Error("no hay bloque");
  return block.items.map((item) => (item.kind === "move" ? item.label.trim() : `{${item.text}}`)).join(" ");
}

describe("buildProseBlocks", () => {
  it("sin comentarios, toda la partida es una sola tirada de jugadas", () => {
    const blocks = blocksOf("1. d4 Nf6 2. c4 e6 3. Nc3 *");

    expect(blocks).toHaveLength(1);
    expect(text(blocks[0])).toBe("1. d4 Cf6 2. c4 e6 3. Cc3");
  });

  it("un comentario cierra la tirada, llevándose la jugada que explica", () => {
    const blocks = blocksOf("1. d4 Nf6 2. c4 e6 3. Nc3 {Una jugada lógica.} Bb4 4. Qc2 *");

    expect(blocks.map((block) => block.kind)).toEqual(["moves", "comment", "moves"]);
    expect(text(blocks[0])).toBe("1. d4 Cf6 2. c4 e6 3. Cc3");
    expect(blocks[1]).toMatchObject({ kind: "comment", text: "Una jugada lógica." });
    // Black resumes the line, so it says its number again.
    expect(text(blocks[2])).toBe("3... Ab4 4. Dc2");
  });

  it("dos comentarios seguidos dejan cada jugada en su propia tirada", () => {
    const blocks = blocksOf("1. d4 {Primero.} d5 {Después.} 2. c4 *");

    expect(blocks.map((block) => block.kind)).toEqual(["moves", "comment", "moves", "comment", "moves"]);
    expect(text(blocks[0])).toBe("1. d4");
    expect(text(blocks[2])).toBe("1... d5");
    expect(text(blocks[4])).toBe("2. c4");
  });

  it("una variación es un párrafo propio, y la línea principal sigue debajo", () => {
    const blocks = blocksOf("1. d4 (1. e4 e5 2. Nf3) 1... d5 2. c4 *");

    expect(blocks.map((block) => block.kind)).toEqual(["moves", "variation", "moves"]);
    expect(text(blocks[0])).toBe("1. d4");
    expect(text(blocks[1])).toBe("1. e4 e5 2. Cf3");
    // The main line comes back numbered: it is no longer next to its move.
    expect(text(blocks[2])).toBe("1... d5 2. c4");
  });

  it("primero lo que se dice de la jugada y después la alternativa", () => {
    const blocks = blocksOf("1. d4 {Ocupa el centro.} (1. e4 e5) 1... d5 2. c4 *");

    // The alternative only means anything once the move has been explained.
    expect(blocks.map((block) => block.kind)).toEqual(["moves", "comment", "variation", "moves"]);
    expect(blocks[1]).toMatchObject({ text: "Ocupa el centro." });
    expect(text(blocks[2])).toBe("1. e4 e5");
    expect(text(blocks[3])).toBe("1... d5 2. c4");
  });

  it("el comentario de una variación se queda en su párrafo", () => {
    const blocks = blocksOf("1. d4 (1. e4 {Otra forma de jugar la posición.} e5) d5 *");

    const variation = blocks.find((block) => block.kind === "variation");
    expect(text(variation)).toBe("1. e4 {Otra forma de jugar la posición.} 1... e5");
  });

  it("una variación de la variación baja un escalón, y la de arriba sigue", () => {
    const blocks = blocksOf("1. d4 (1. e4 e5 (1... c5 2. Nf3) 2. Nc3) d5 *");

    const variations = blocks.filter(isVariation);
    expect(variations.map((block) => block.depth)).toEqual([0, 1, 0]);
    expect(text(variations[0])).toBe("1. e4 e5");
    expect(text(variations[1])).toBe("1... c5 2. Cf3");
    expect(text(variations[2])).toBe("2. Cc3");
  });

  it("solo las variaciones anidadas llevan paréntesis", () => {
    const blocks = blocksOf("1. d4 (1. e4 e5 (1... c5 2. Nf3) 2. Nc3) d5 *");
    const variations = blocks.filter(isVariation);

    // The one hanging from the main line is told by its colour, not by brackets.
    expect(variations[0]?.depth).toBe(0);
    expect(variations[0]?.opens).toBeUndefined();
    expect(variations[0]?.closes).toBeUndefined();
    // The nested one opens and closes in its own paragraph.
    expect(variations[1]).toMatchObject({ depth: 1, opens: true, closes: 1 });
    // And the rest of the first-level line carries nothing either.
    expect(variations[2]?.depth).toBe(0);
    expect(variations[2]?.opens).toBeUndefined();
    expect(variations[2]?.closes).toBeUndefined();
  });

  it("una variación partida en varios párrafos abre en el primero y cierra en el último", () => {
    // The nested line has one of its own hanging from a later move, so it is
    // cut into two paragraphs.
    const blocks = blocksOf("1. d4 (1. e4 e5 (1... c5 2. Nf3 (2. Nc3 Nc6) 2... d6) 2. Nc3) d5 *");
    const nested = blocks.filter(isVariation).filter((block) => block.depth >= 1);

    expect(text(nested[0])).toBe("1... c5 2. Cf3");
    expect(nested[0]).toMatchObject({ depth: 1, opens: true });
    expect(nested[0]?.closes).toBeUndefined();
    // The deeper one opens and closes in its own paragraph.
    expect(nested[1]).toMatchObject({ depth: 2, opens: true, closes: 1 });
    // And the first-level line closes where its own last move fell.
    expect(text(nested[2])).toBe("2... d6");
    expect(nested[2]).toMatchObject({ depth: 1, closes: 1 });
  });

  it("dos variaciones que acaban en el mismo párrafo lo cierran dos veces", () => {
    const blocks = blocksOf("1. d4 (1. e4 e5 (1... c5 2. Nf3 (2. Nc3 Nc6))) d5 *");
    const nested = blocks.filter(isVariation).filter((block) => block.depth >= 1);

    expect(nested.at(-1)).toMatchObject({ depth: 2, closes: 2 });
  });

  it("cada bloque trae una clave distinta, que es la que ordena el dibujado", () => {
    const blocks = blocksOf("1. d4 {Primero.} (1. e4 e5) 1... d5 {Después.} *");
    const keys = blocks.map((block) => block.key);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
