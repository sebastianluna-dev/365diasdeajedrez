import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TOPIC } from "../constants/platform/shared-codes.const";
import { CATALOG_VALUES, TOPIC_VALUES } from "./seed-data";

// The migration that brought the exercise bank is hand-written (docs/ →
// Platform → Data model → Migrations): Prisma's diff gives the structure and
// the rest — the catalog rows, the CHECKs, the rename of the attempt's old
// column — is added by hand. Pure test, no database: it reads the SQL and the
// schema and checks what a hand can forget. Each later exercise migration
// adds its block here.

const MIGRATION = new URL("./migrations/20261016120000_exercises/migration.sql", import.meta.url);
const INIT = new URL("./migrations/20260830190612_init/migration.sql", import.meta.url);
const sql = readFileSync(MIGRATION, "utf8");
const init = readFileSync(INIT, "utf8");
const schema = readFileSync(new URL("./schema.prisma", import.meta.url), "utf8");

const CHECKS = [
  "exercise_difficulty_range",
  "exercise_mate_in_range",
  "exercise_hints_max",
  "exercise_source_year",
  "exercise_series_library_published",
  "training_attempt_one_exercise",
];

/** The VALUES block of the first `INSERT INTO "<table>"` that lists `firstCode`. */
function insertBlock(table: string, firstCode: string): string {
  let from = 0;
  for (;;) {
    const start = sql.indexOf(`INSERT INTO "${table}"`, from);
    if (start === -1) throw new Error(`no INSERT INTO "${table}" with ${firstCode}`);
    const block = sql.slice(start, sql.indexOf("ON CONFLICT", start));
    if (block.includes(`('${firstCode}'`)) return block;
    from = start + 1;
  }
}

describe("the 20261016120000_exercises migration", () => {
  it("inserts every row of the two new catalogs and of AttemptContext, with the seed's label and order", () => {
    for (const [table, key] of [
      ["ExerciseKind", "exerciseKind"],
      ["ExerciseStatus", "exerciseStatus"],
      ["AttemptContext", "attemptContext"],
    ] as const) {
      const values = CATALOG_VALUES[key];
      const block = insertBlock(table, values[0]?.[0] ?? "");
      for (const [index, [code, label]] of values.entries()) {
        expect(block, `${table} ${code}`).toContain(`('${code}', '${label}', ${index})`);
      }
      expect(block.match(/\('/g), `${table} has no row the seed lacks`).toHaveLength(values.length);
    }
  });

  it("inserts every tactical motif under TACTICS, with the seed's label and order", () => {
    const motifs = TOPIC_VALUES.filter(([, , , parent]) => parent !== null);
    expect(motifs).toHaveLength(19);
    const firstMotif = motifs[0]?.[0] ?? "";
    const block = insertBlock("Topic", firstMotif);
    expect(block).toContain(`(SELECT "id" FROM "Topic" WHERE "code" = '${TOPIC.TACTICS}')`);
    for (const [code, label, order, parent] of motifs) {
      expect(parent, code).toBe(TOPIC.TACTICS);
      expect(block, code).toContain(`('${code}', '${label}', ${order})`);
    }
    expect(block.match(/\('/g)).toHaveLength(motifs.length);
    const [, tacticsLabel, tacticsOrder] = TOPIC_VALUES.find(([code]) => code === TOPIC.TACTICS)!;
    expect(insertBlock("Topic", TOPIC.TACTICS)).toContain(`('${TOPIC.TACTICS}', '${tacticsLabel}', ${tacticsOrder})`);
    // TACTICS is inserted before the motifs that read its id.
    expect(sql.indexOf(`('${TOPIC.TACTICS}', '${tacticsLabel}'`)).toBeLessThan(sql.indexOf(`('${firstMotif}'`));
  });

  it("the roots come before the motifs in the seed, so a parent is seeded before its children", () => {
    const seen = new Set<string>();
    for (const [code, , , parent] of TOPIC_VALUES) {
      if (parent !== null) expect(seen.has(parent), code).toBe(true);
      seen.add(code);
    }
  });

  it("writes the six CHECKs by name, and the schema's header comment names each one", () => {
    const header = schema.slice(0, schema.indexOf("generator client"));
    for (const name of CHECKS) {
      expect(sql, name).toContain(`CONSTRAINT "${name}" CHECK`);
      expect(header, name).toContain(name);
    }
    expect(sql).toContain(
      `"training_attempt_one_exercise" CHECK (("trainingExerciseId" IS NULL) <> ("exerciseId" IS NULL))`,
    );
  });

  it("renames the attempt's old column before adding the new exerciseId, with the names the init migration gave", () => {
    const rename = sql.indexOf(`RENAME COLUMN "exerciseId" TO "trainingExerciseId"`);
    const added = sql.indexOf(`ADD COLUMN "exerciseId" TEXT`);
    expect(rename).toBeGreaterThan(-1);
    expect(added).toBeGreaterThan(rename);
    expect(sql).not.toMatch(/DROP COLUMN/);
    for (const name of ["TrainingAttempt_exerciseId_fkey", "TrainingAttempt_exerciseId_idx"]) {
      expect(init, name).toContain(`"${name}"`);
    }
    expect(sql).toContain(
      `RENAME CONSTRAINT "TrainingAttempt_exerciseId_fkey" TO "TrainingAttempt_trainingExerciseId_fkey"`,
    );
    expect(sql).toContain(
      `ALTER INDEX "TrainingAttempt_exerciseId_idx" RENAME TO "TrainingAttempt_trainingExerciseId_idx"`,
    );
    // The new foreign key comes after the rename freed its name.
    expect(sql.indexOf(`ADD CONSTRAINT "TrainingAttempt_exerciseId_fkey"`)).toBeGreaterThan(rename);
  });

  it("every foreign key cascades on update, as Prisma's diff writes them, and an attempt never takes its exercise", () => {
    const keys = sql.split("\n").filter((line) => line.includes("FOREIGN KEY"));
    expect(keys.length).toBeGreaterThan(15);
    for (const line of keys) expect(line, line).toContain("ON UPDATE CASCADE");
    expect(keys.find((line) => line.includes(`"TrainingAttempt_exerciseId_fkey"`))).toContain("ON DELETE RESTRICT");
    expect(keys.find((line) => line.includes(`"Exercise_teacherId_fkey"`))).toContain("ON DELETE RESTRICT");
  });

  it("the schema names the only writer of every derived column", () => {
    const cases: [string, string, string][] = [
      ["Exercise", "kindId", "exerciseSolutionColumns"],
      ["Exercise", "mateIn", "exerciseSolutionColumns"],
      ["Exercise", "solutionPgn", "createExerciseRecord"],
      ["Exercise", "startFen", "exerciseSolutionColumns"],
      ["Exercise", "startPositionHash", "exerciseSolutionColumns"],
      ["Exercise", "solutionPlies", "exerciseSolutionColumns"],
      ["Exercise", "playerMoves", "exerciseSolutionColumns"],
      ["Exercise", "statusId", "exercise-status.service.ts"],
      ["Exercise", "submittedAt", "exercise-status.service.ts"],
      ["Exercise", "reviewedAt", "exercise-status.service.ts"],
      ["Exercise", "reviewedById", "exercise-status.service.ts"],
      ["Exercise", "reviewNote", "exercise-status.service.ts"],
      ["Exercise", "publishedAt", "exercise-status.service.ts"],
      ["TrainingAttempt", "exerciseId", "recordExerciseAttempt"],
      ["UserExerciseState", "attemptCount", "recordExerciseAttempt"],
      ["UserExerciseState", "firstSolvedAt", "recordExerciseAttempt"],
      ["UserExerciseState", "lastAttemptAt", "recordExerciseAttempt"],
      ["UserExerciseState", "reviewStep", "recordExerciseAttempt"],
      ["UserExerciseState", "nextReviewAt", "recordExerciseAttempt"],
    ];
    for (const [model, column, writer] of cases) {
      const start = schema.indexOf(`\nmodel ${model} {`);
      const block = schema.slice(start, schema.indexOf("\n}\n", start)).split("\n");
      const line = block.findIndex((text) => new RegExp(`^\\s+${column}\\s`).test(text));
      expect(line, `${model}.${column}`).toBeGreaterThan(-1);
      // Only the comment right above the column, not a neighbour's.
      const comment: string[] = [];
      for (const text of block.slice(0, line).reverse()) {
        if (!text.trim().startsWith("///")) break;
        comment.push(text);
      }
      expect(comment.join(" "), `${model}.${column} names ${writer}`).toContain(writer);
    }
  });
});
