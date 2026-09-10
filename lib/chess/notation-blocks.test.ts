import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildNotationBlocks, type NotationBlock } from "./notation-blocks";
import { parsePgnTree } from "./pgn-tree";

// The game is real (Continental 2026) and brings everything: comments on the
// main line, variations of the very first move, forks inside a variation and
// three levels of nesting.
const PGN = readFileSync(join(__dirname, "__fixtures__", "continental-2026.pgn"), "utf8");

function blocks(): NotationBlock[] {
  const tree = parsePgnTree(PGN);
  expect(tree).not.toBeNull();
  return buildNotationBlocks(tree!);
}

/** One line, summarised as it would be read. */
function lineText(block: NotationBlock): string {
  if (block.kind !== "line") throw new Error("no es una línea");
  return block.items
    .map((item) => (item.type === "move" ? item.node.san : `{${item.text.slice(0, 12)}}`))
    .join(" ");
}

describe("buildNotationBlocks", () => {
  it("la línea principal va en filas de par blancas/negras", () => {
    const rows = blocks().filter((block) => block.kind === "row");

    expect(rows[0]).toMatchObject({ number: 1 });
    expect(rows[0].white?.san).toBe("d4");
    // d4 carries a comment and a variation, so its pair is split.
    expect(rows[0].black).toBeUndefined();
    expect(rows[0].pushedBlack).toBe(true);

    // The reply drops to the next row and is marked as a continuation.
    expect(rows[1]).toMatchObject({ number: 1, continuation: true });
    expect(rows[1].black?.san).toBe("Nf6");
    expect(rows[1].white).toBeUndefined();
  });

  it("empareja normalmente cuando no hay nada que se meta en medio", () => {
    const rows = blocks().filter((block) => block.kind === "row");
    const pair = rows.find((row) => row.number === 2);

    expect(pair?.white?.san).toBe("c4");
    expect(pair?.black?.san).toBe("g6");
    expect(pair?.pushedBlack).toBe(false);
  });

  it("el comentario de la línea principal va a lo ancho, sin sangrar", () => {
    const first = blocks()[1];
    expect(first.kind).toBe("comment");
    expect(first).toMatchObject({ text: "Ejemplo de comentario" });
  });

  it("corta la línea donde hay bifurcación y baja TODAS las opciones", () => {
    const lines = blocks().filter((block) => block.kind === "line");

    // 1.c4 is cut there because e5 and f5 come out of it.
    const c4 = lines.find((line) => lineText(line).startsWith("c4"));
    expect(c4?.depth).toBe(0);
    expect(lineText(c4!)).toBe("c4 {Comentario l}");

    // And the two continuations hang one level deeper.
    expect(lines.find((line) => lineText(line) === "e5")?.depth).toBe(1);
    expect(lines.find((line) => lineText(line).startsWith("f5"))?.depth).toBe(1);
  });

  it("la línea sigue de corrido mientras no haya dónde elegir", () => {
    const lines = blocks().filter((block) => block.kind === "line");
    const f5 = lines.find((line) => lineText(line).startsWith("f5"));

    // It runs up to Nc3, which is where it opens into d5 and g6.
    expect(lineText(f5!)).toBe("f5 d4 e6 a3 Nf6 Bg5 h6 Bxf6 Qxf6 Nc3");
    expect(lines.find((line) => lineText(line) === "d5")?.depth).toBe(2);
    expect(lines.find((line) => lineText(line).startsWith("g6 e4"))?.depth).toBe(2);
  });

  it("anida tres niveles sin perder la cuenta", () => {
    const lines = blocks().filter((block) => block.kind === "line");

    // 1...e6 2.Nf3 f5 is cut at f5: from there come Bg5, a3 and g4.
    expect(lines.find((line) => lineText(line) === "e6 Nf3 f5")?.depth).toBe(0);
    expect(lines.find((line) => lineText(line).startsWith("a3 Nf6 c4"))?.depth).toBe(1);
    // And within that one, c4 opens into Be7 and Ne4.
    expect(lines.find((line) => lineText(line) === "Be7 Nc3")?.depth).toBe(2);
    expect(lines.find((line) => lineText(line).startsWith("Ne4 Qc2"))?.depth).toBe(2);
  });

  it("una variante de la línea principal no se sangra", () => {
    const lines = blocks().filter((block) => block.kind === "line");
    const cxd5 = lines.find((line) => lineText(line).startsWith("cxd5"));

    expect(cxd5?.depth).toBe(0);
    expect(lineText(cxd5!)).toBe("cxd5 Nxd5 e4 Nxc3 bxc3 Bg7 Nf3 c5");
  });

  it("los bloques salen en el orden en que se leen", () => {
    const kinds = blocks()
      .slice(0, 6)
      .map((block) => (block.kind === "row" ? `row(${block.number})` : block.kind));

    // Row with d4 → its comment → its variation and what hangs from it → the reply.
    expect(kinds).toEqual(["row(1)", "comment", "line", "line", "line", "line"]);
  });
});
