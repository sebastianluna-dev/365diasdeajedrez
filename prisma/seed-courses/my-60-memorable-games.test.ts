import { describe, expect, it } from "vitest";
import { AUTHOR_ROLE } from "@/constants/platform/course-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { SOURCE_TYPE } from "@/constants/platform/source-codes.const";
import { GAME_RESULT } from "@/constants/platform/study-codes.const";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { parseImportedGames } from "@/services/shared/pgn-import";
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

  it("leaves the study's own headers, moves and commentary as exported, typos included", () => {
    const pgn = lessonNamed("Partida 48 ·")?.pgn ?? "";

    // What is corrected is the game's record: the study's headers travel untouched.
    expect(pgn).toContain('[ChapterName "48. Donald Byrne - Robert James Fischer 1963"]');
    expect(pgn).toContain('[ChapterURL "https://lichess.org/study/Wq1xlajv/');
    expect(pgn).toContain("1. d4 Nf6 2. c4 g6 3. g3 c6 4. Bg2 { En el Campeonato de Estados Unidos 1962-1963");
  });

  describe("the game the platform files each lesson as", () => {
    const gameOf = (start: string) => parseImportedGames(lessonNamed(start)?.pgn ?? "")[0];

    it("has its players, which the study does not export", () => {
      for (const lesson of lessons) {
        const [game] = parseImportedGames(lesson.pgn);
        expect(game?.white, lesson.name).not.toBe("Desconocido");
        expect(game?.black, lesson.name).not.toBe("Desconocido");
      }
      expect(gameOf("Partida 48 ·")).toMatchObject({ white: "Robert Byrne", black: "Robert James Fischer" });
    });

    it("has a result, and the book's count: 9 draws and 3 losses, the rest wins", () => {
      const tally = { wins: 0, draws: 0, losses: 0 };
      for (const lesson of lessons.filter((lesson) => lesson.name.startsWith("Partida de referencia") === false)) {
        const [game] = parseImportedGames(lesson.pgn);
        expect(game?.resultCode, lesson.name).not.toBe(GAME_RESULT.ONGOING);

        const fischerIsWhite = game?.white.includes("Fischer");
        if (game?.resultCode === GAME_RESULT.DRAW) tally.draws += 1;
        else if ((game?.resultCode === GAME_RESULT.WHITE_WINS) === fischerIsWhite) tally.wins += 1;
        else tally.losses += 1;
      }
      // 48 wins in the book: the two that are missing here are games 59 and 60.
      expect(tally).toEqual({ wins: 46, draws: 9, losses: 3 });
    });

    it("ends the five games of the record the way the record says", () => {
      expect(gameOf("Partida 17 ·")?.resultCode).toBe(GAME_RESULT.BLACK_WINS); // Fischer–Tal: lost
      expect(gameOf("Partida 18 ·")?.resultCode).toBe(GAME_RESULT.WHITE_WINS); // Spassky–Fischer: lost
      expect(gameOf("Partida 39 ·")?.resultCode).toBe(GAME_RESULT.DRAW); // Botvinnik–Fischer
      expect(gameOf("Partida 48 ·")?.resultCode).toBe(GAME_RESULT.BLACK_WINS); // R. Byrne–Fischer: won
      expect(gameOf("Partida 58 ·")?.resultCode).toBe(GAME_RESULT.BLACK_WINS); // Fischer–Geller: lost
    });

    it("closes the moves with the same result its header says", () => {
      expect(lessonNamed("Partida 1 ·")?.pgn.endsWith(" 1-0")).toBe(true);
      expect(lessonNamed("Partida 39 ·")?.pgn.endsWith(" 1/2-1/2")).toBe(true);
    });

    it("names the tournament only where a source does, and never a day nobody gave", () => {
      expect(gameOf("Partida 18 ·")?.event).toBe("Mar del Plata");
      expect(gameOf("Partida 1 ·")?.event).toBeNull();

      // The study's `Date` is the day of the upload: it must not pass for the game's.
      expect(gameOf("Partida 1 ·")?.playedAt).toBeNull();
      expect(lessonNamed("Partida 1 ·")?.pgn).toContain('[Date "1957.??.??"]');
      // The one chapter where the study gives the day.
      expect(gameOf("Partida 37 ·")?.playedAt?.toISOString().slice(0, 10)).toBe("1962-04-07");
    });
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
