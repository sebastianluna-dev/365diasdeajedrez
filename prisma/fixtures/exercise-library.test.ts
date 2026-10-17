import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createPositionHash } from "@/lib/chess/position-hash";
import { readExerciseImport, type ExerciseImportDefaults } from "@/services/shared/exercise-import";
import { TOPIC_VALUES } from "../seed-data";

// The library fixture (PLAN.md §9, phase 5): the exercises the staff imports
// into a local library with «Estado: En la biblioteca», so a local database
// has something to practise and, later, a deck for the contrarreloj. Pinned
// here so a position nobody can solve, or a header left out, never reaches
// the import page: every game is read exactly as the staff's import reads it.

const FILE = new URL("./exercise-library.pgn", import.meta.url);
const TOPICS = TOPIC_VALUES.map(([code, label]) => ({ code, label }));

/** The staff's import of the file with nothing chosen: what the headers say is what counts. */
const AS_LIBRARY: ExerciseImportDefaults = {
  difficulty: 1200,
  kind: "SEQUENCE",
  mateIn: null,
  topicCodes: [],
  dropMistakeVariants: true,
  target: "library",
};

describe("prisma/fixtures/exercise-library.pgn", () => {
  const text = readFileSync(FILE, "utf8");
  const reading = readExerciseImport(text, AS_LIBRARY, TOPICS, []);

  it("holds at least twenty exercises, every one importable straight into the library", () => {
    expect(reading.rows.length).toBeGreaterThanOrEqual(20);
    const refused = reading.rows.filter((row) => row.outcome !== "ready").map((row) => [row.index, row.title, row]);
    expect(refused).toEqual([]);
  });

  it("sets Title, Difficulty, Topics and Explanation on every game, so nothing falls to the defaults", () => {
    const games = text.split(/\n(?=\[Event )/);
    expect(games.length).toBe(reading.rows.length);
    for (const game of games) {
      for (const header of ["Title", "Difficulty", "Topics", "Explanation", "FEN"]) {
        expect(game, header).toMatch(new RegExp(`^\\[${header} "[^"]+"\\]`, "m"));
      }
    }
    expect(reading.rows.every((row) => row.notes.length === 0)).toBe(true);
  });

  it("spreads its difficulties from the beginner's band to the expert's, in the editor's steps, and repeats no position", () => {
    const difficulties = reading.accepted.map((row) => row.record.content.difficulty);
    expect(Math.min(...difficulties)).toBeLessThanOrEqual(900);
    expect(Math.max(...difficulties)).toBeGreaterThanOrEqual(2500);
    expect(difficulties.every((difficulty) => difficulty % 50 === 0)).toBe(true);
    const hashes = reading.accepted.map((row) =>
      createPositionHash(row.record.solution.solutionPgn.match(/\[FEN "([^"]+)"\]/)?.[1] ?? ""),
    );
    expect(new Set(hashes).size).toBe(hashes.length);
  });

  it("mixes the two kinds and several topics", () => {
    const kinds = new Set(reading.accepted.map((row) => row.record.solution.kind));
    expect(kinds).toEqual(new Set(["MATE_IN", "SEQUENCE"]));
    const topics = new Set(reading.accepted.flatMap((row) => row.record.content.topicCodes));
    expect(topics.size).toBeGreaterThanOrEqual(6);
  });
});
