import { describe, expect, it } from "vitest";
import { buildProseBlocks, type ProseBlock, type ProseItem } from "./notation-prose";
import { parsePgnTree } from "./pgn-tree";

function blocksOf(movetext: string): ProseBlock[] {
  const tree = parsePgnTree(`[Event "Test"]\n\n${movetext}`);
  expect(tree).not.toBeNull();
  return buildProseBlocks(tree!.children);
}

/** A run summarised as it is read, with variations in parentheses. */
function runText(block: ProseBlock | undefined): string {
  if (block?.kind !== "moves") throw new Error("no es una tirada de jugadas");
  const text = (items: ProseItem[]): string =>
    items
      .map((item) => {
        if (item.kind === "move") return item.label.trim();
        if (item.kind === "aside") return `{${item.text}}`;
        return `(${text(item.items)})`;
      })
      .join(" ");
  return text(block.items);
}

describe("buildProseBlocks", () => {
  it("sin comentarios, toda la partida es una sola tirada de jugadas", () => {
    const blocks = blocksOf("1. d4 Nf6 2. c4 e6 3. Nc3 *");

    expect(blocks).toHaveLength(1);
    expect(runText(blocks[0])).toBe("1. d4 Cf6 2. c4 e6 3. Cc3");
  });

  it("un comentario cierra la tirada, llevándose la jugada que explica", () => {
    const blocks = blocksOf("1. d4 Nf6 2. c4 e6 3. Nc3 {Una jugada lógica.} Bb4 4. Qc2 *");

    expect(blocks.map((block) => block.kind)).toEqual(["moves", "comment", "moves"]);
    expect(runText(blocks[0])).toBe("1. d4 Cf6 2. c4 e6 3. Cc3");
    expect(blocks[1]).toMatchObject({ kind: "comment", text: "Una jugada lógica." });
    // Black resumes the line, so it says its number again.
    expect(runText(blocks[2])).toBe("3... Ab4 4. Dc2");
  });

  it("dos comentarios seguidos dejan cada jugada en su propia tirada", () => {
    const blocks = blocksOf("1. d4 {Primero.} d5 {Después.} 2. c4 *");

    expect(blocks.map((block) => block.kind)).toEqual(["moves", "comment", "moves", "comment", "moves"]);
    expect(runText(blocks[0])).toBe("1. d4");
    expect(runText(blocks[2])).toBe("1... d5");
    expect(runText(blocks[4])).toBe("2. c4");
  });

  it("una variación se queda dentro de la tirada, antes del comentario", () => {
    const blocks = blocksOf("1. d4 (1. e4 e5) 1... d5 {Simétrico.} 2. c4 *");

    expect(blocks.map((block) => block.kind)).toEqual(["moves", "comment", "moves"]);
    // The variation hangs from d4 and the line resumes numbered after it.
    expect(runText(blocks[0])).toBe("1. d4 (1. e4 e5) 1... d5");
    expect(runText(blocks[2])).toBe("2. c4");
  });

  it("el comentario de una variación no parte la página: se queda entre paréntesis", () => {
    const blocks = blocksOf("1. d4 (1. e4 {Lo otro.} e5) d5 *");

    expect(blocks).toHaveLength(1);
    expect(runText(blocks[0])).toBe("1. d4 (1. e4 {Lo otro.} 1... e5) 1... d5");
  });

  it("cada bloque trae una clave distinta, que es la que ordena el dibujado", () => {
    const blocks = blocksOf("1. d4 {Primero.} d5 {Después.} *");
    const keys = blocks.map((block) => block.key);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
