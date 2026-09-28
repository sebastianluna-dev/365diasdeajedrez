import { describe, expect, it } from "vitest";
import { AUTHOR_ROLE } from "@/constants/platform/course-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { SOURCE_TYPE } from "@/constants/platform/source-codes.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { MY_60_MEMORABLE_GAMES as course } from "./my-60-memorable-games";

const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
const lessonNamed = (start: string) => lessons.find((lesson) => lesson.name.startsWith(start));

describe("course «Mis 60 memorables partidas»", () => {
  it("spreads the study's 61 games over the three stages", () => {
    expect(course.chapters.map((chapter) => chapter.lessons.length)).toEqual([17, 26, 18]);
    expect(lessons).toHaveLength(61);
  });

  it("numbers the lessons of each chapter from 1, without gaps", () => {
    for (const chapter of course.chapters) {
      expect(chapter.lessons.map((lesson) => lesson.order)).toEqual(chapter.lessons.map((_, index) => index + 1));
    }
  });

  it("gives every lesson an id of its own", () => {
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(lessons.length);
  });

  it("carries 58 games of the book and three reference games, not the sixty", () => {
    const numbered = lessons.filter((lesson) => /^Partida \d+ · /.test(lesson.name));
    const reference = lessons.filter((lesson) => lesson.name.startsWith("Partida de referencia"));

    expect(numbered).toHaveLength(58);
    expect(reference).toHaveLength(3);
    // The study stops at 58: the day 59 and 60 arrive this has to be looked at.
    expect(lessonNamed("Partida 59 ·")).toBeUndefined();
    expect(lessonNamed("Partida 60 ·")).toBeUndefined();
  });

  it("names the players as they are called, not as the study misspells them", () => {
    // The one that changes the player: the study says Donald Byrne.
    expect(lessonNamed("Partida 48 ·")?.name).toBe("Partida 48 · Byrne – Fischer, 1963");
    expect(lessonNamed("Partida 48 ·")?.description).toContain("Robert Byrne");

    expect(lessonNamed("Partida 36 ·")?.description).toContain("Viktor Korchnoi");
    expect(lessonNamed("Partida 12 ·")?.name).toBe("Partida 12 · Gligoric – Fischer, 1959");
    expect(lessonNamed("Partida 51 ·")?.name).toBe("Partida 51 · Fischer – Smyslov, 1965");
  });

  it("leaves the PGN as the study exports it, typos included", () => {
    // The correction is of the TITLE: the study's own header travels untouched.
    expect(lessonNamed("Partida 48 ·")?.pgn).toContain('[ChapterName "48. Donald Byrne - Robert James Fischer 1963"]');
  });

  it("marks the five games the book is known for", () => {
    expect(lessons.filter((lesson) => lesson.isPriority).map((lesson) => lesson.name)).toEqual([
      "Partida 17 · Fischer – Tal, 1959",
      "Partida 18 · Spassky – Fischer, 1960",
      "Partida 39 · Botvinnik – Fischer, 1962",
      "Partida 48 · Byrne – Fischer, 1963",
      "Partida 58 · Fischer – Geller, 1967",
    ]);
  });

  it("sets the board from Fischer's side", () => {
    expect(lessonNamed("Partida 1 ·")?.orientation).toBe(BOARD_ORIENTATION.WHITE);
    expect(lessonNamed("Partida 18 ·")?.orientation).toBe(BOARD_ORIENTATION.BLACK);
  });

  it("brings games the platform's own parser reads whole, without an illegal move", () => {
    // An amateur transcription is where a mistyped move would be. The viewer
    // drops the branch that has one and says so in `warnings`: none may.
    for (const lesson of lessons) {
      const tree = parsePgnTree(lesson.pgn);
      expect(tree, lesson.name).not.toBeNull();
      expect(tree?.children.length, lesson.name).toBeGreaterThan(0);
      expect(tree?.warnings, lesson.name).toEqual([]);
    }
  });

  it("signs the course as a digital adaptation, not as the content's author", () => {
    expect(course.authorRole).toBe(AUTHOR_ROLE.DIGITAL_ADAPTATION);
  });

  it("keeps the original work, the Spanish edition and the study as three sources", () => {
    const [original, spanish, study] = course.sources ?? [];

    expect(course.sources).toHaveLength(3);
    expect(original).toMatchObject({ originalTitle: "My 60 Memorable Games", publicationYear: 1969 });
    expect(original?.edition).toContain("Simon & Schuster");

    // The edition's data does not leak into the original work, nor the other way round.
    expect(original?.edition).not.toContain("9788412510034");
    expect(spanish?.edition).toContain("9788412510034");
    expect(spanish?.authors).toContain("Antonio Gude");

    // Two sources give two years for the same ISBN: none is taken as the fact.
    expect(spanish?.publicationYear).toBeNull();
    expect(spanish?.notes).toContain("2023");
    expect(spanish?.notes).toContain("2022");

    expect(study).toMatchObject({ sourceType: SOURCE_TYPE.INTERACTIVE_STUDY, url: "https://lichess.org/study/Wq1xlajv" });
  });
});
