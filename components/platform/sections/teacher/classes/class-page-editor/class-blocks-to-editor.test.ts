import { describe, expect, it } from "vitest";
import { readDiagramPgn } from "@/lib/chess/diagram-notation";
import type { ClassBlockView } from "@/services/classes/classes.types";
import type { TeacherClassBlock } from "@/services/teacher-classes/teacher-classes.types";
import { editorBlocksOf, editorOptionsOf } from "./class-blocks-to-editor";

const stored = (id: string, order: number): TeacherClassBlock => ({
  id,
  order,
  kind: "TEXT",
  visibility: "BEFORE",
  isMovePathBroken: false,
});

describe("editorBlocksOf", () => {
  it("reads every block in the class's order, whatever section it was stored in", () => {
    const views: ClassBlockView[] = [
      { id: "a", kind: "TEXT", visibility: "AFTER", text: "Después" },
      { id: "b", kind: "TEXT", visibility: "TEACHER", text: "Guion" },
      { id: "c", kind: "TEXT", visibility: "BEFORE", text: "Antes" },
    ];
    const blocks = editorBlocksOf([stored("a", 3), stored("b", 2), stored("c", 1)], views);
    expect(blocks.map((block) => (block.kind === "text" ? block.text : ""))).toEqual(["Antes", "Guion", "Después"]);
  });

  it("turns a text's title into a heading and each of its paragraphs into a block", () => {
    const views: ClassBlockView[] = [
      { id: "t", kind: "TEXT", visibility: "BEFORE", title: "El puente", text: "Uno\nsigue.\n\nDos." },
    ];
    expect(editorBlocksOf([stored("t", 1)], views)).toEqual([
      { id: "t:title", kind: "heading", text: "El puente" },
      { id: "t:0", kind: "text", text: "Uno sigue." },
      { id: "t:1", kind: "text", text: "Dos." },
    ]);
  });

  it("draws a position as a diagram with its title for a caption, and leaves out a lesson that is gone", () => {
    const views: ClassBlockView[] = [
      {
        id: "p",
        kind: "POSITION_REF",
        visibility: "BEFORE",
        position: { fen: "8/8/8/8/8/8/8/K6k w - - 0 1", orientation: "white", title: "Rey solo" },
      },
      {
        id: "l",
        kind: "LESSON_REF",
        visibility: "BEFORE",
        lesson: { id: "x", name: "Gone", pgn: "*", orientation: "white", href: "/", missing: true },
      },
    ];
    const [diagram, ...rest] = editorBlocksOf([stored("p", 1), stored("l", 2)], views);
    expect(diagram?.kind === "diagram" && readDiagramPgn(diagram.pgn)?.caption).toBe("Rey solo");
    expect(rest).toEqual([]);
  });
});

describe("editorOptionsOf", () => {
  it("offers the teacher's games by their players and study, and each exercise", () => {
    const options = editorOptionsOf(
      [
        {
          studyId: "s",
          isOwn: true,
          ownerLabel: "Mis estudios",
          studyName: "Finales",
          games: [{ id: "g", label: "Luis M. – Sofía R." }],
        },
      ],
      [{ id: "e", title: "Mate del pasillo", facts: "Mate en 1 · 900", topics: "Táctica" }],
    );
    expect(options.games).toEqual([
      { id: "g", white: "Luis M.", black: "Sofía R.", event: "Mis estudios · Finales", result: "" },
    ]);
    expect(options.series).toEqual([{ id: "e", title: "Mate del pasillo", exercises: ["Mate del pasillo"] }]);
  });
});
