import { describe, expect, it } from "vitest";
import { readDiagramPgn } from "@/lib/chess/diagram-notation";
import {
  duplicateBlock,
  insertAfter,
  markdownShortcut,
  matchKinds,
  moveTo,
  newBlock,
  type EditorBlock,
} from "./class-page-editor.model";

const text = (id: string): EditorBlock => ({ id, kind: "text", text: id });
const ids = (blocks: EditorBlock[]) => blocks.map((block) => block.id);

function counter() {
  let next = 0;
  return () => `n${++next}`;
}

describe("matchKinds", () => {
  it("offers every kind for an empty query", () => {
    expect(matchKinds("  ")).toHaveLength(14);
  });

  it("finds a kind by its name or its words, without accents", () => {
    expect(matchKinds("leccion").map((info) => info.kind)).toEqual(["lesson"]);
    expect(matchKinds("TABLERO").map((info) => info.kind)).toEqual(["diagram"]);
    expect(matchKinds("zzz")).toEqual([]);
  });
});

describe("markdownShortcut", () => {
  it("turns a paragraph that starts with a mark and a space into its kind", () => {
    expect(markdownShortcut("# Lucena")).toEqual({ kind: "heading", rest: "Lucena" });
    expect(markdownShortcut("## El puente")).toEqual({ kind: "subheading", rest: "El puente" });
    expect(markdownShortcut("- ")).toEqual({ kind: "list", rest: "" });
    expect(markdownShortcut("> Cita")).toEqual({ kind: "quote", rest: "Cita" });
  });

  it("leaves any other text alone", () => {
    expect(markdownShortcut("#hashtag")).toBeNull();
    expect(markdownShortcut("1-0")).toBeNull();
  });
});

describe("newBlock", () => {
  it("starts a diagram on the initial position, and a question with two options, the first right", () => {
    const diagram = newBlock("diagram", counter());
    expect(diagram.kind === "diagram" && readDiagramPgn(diagram.pgn)?.fen).toBe(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    );
    const question = newBlock("question", counter());
    expect(question.kind === "question" && question.options.map((option) => option.correct)).toEqual([true, false]);
  });
});

describe("the list operations", () => {
  const blocks = [text("a"), text("b"), text("c")];

  it("insert after a block, or at the end", () => {
    expect(ids(insertAfter(blocks, "a", text("x")))).toEqual(["a", "x", "b", "c"]);
    expect(ids(insertAfter(blocks, null, text("x")))).toEqual(["a", "b", "c", "x"]);
  });

  it("put a dragged block in the place of the one it is dropped on, up or down", () => {
    expect(ids(moveTo(blocks, "c", "a"))).toEqual(["c", "a", "b"]);
    expect(ids(moveTo(blocks, "a", "c"))).toEqual(["b", "c", "a"]);
    expect(moveTo(blocks, "a", "a")).toBe(blocks);
  });

  it("duplicate a block with ids of its own", () => {
    const question = newBlock("question", counter());
    const copied = duplicateBlock([question], question.id, () => "copy");
    expect(ids(copied)).toEqual([question.id, "copy"]);
    const copy = copied[1];
    expect(copy?.kind === "question" && copy.options.every((option) => option.id === "copy")).toBe(true);
  });
});
