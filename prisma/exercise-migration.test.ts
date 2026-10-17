import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TOPIC } from "../constants/platform/shared-codes.const";
import { deriveExerciseData } from "../lib/chess/exercise-derivation";
import { startFenOf } from "../lib/chess/mainline";
import { createPositionHash } from "../lib/chess/position-hash";
import { CATALOG_VALUES, COURSES, TOPIC_VALUES } from "./seed-data";

// The migration that brought the exercise bank is hand-written (docs/ →
// Platform → Data model → Migrations): Prisma's diff gives the structure and
// the rest — the catalog rows, the CHECKs, the rename of the attempt's old
// column — is added by hand. Pure test, no database: it reads the SQL and the
// schema and checks what a hand can forget. Each later exercise migration
// adds its block here.

const MIGRATION = new URL("./migrations/20261016120000_exercises/migration.sql", import.meta.url);
const LESSON_MIGRATION = new URL("./migrations/20261016130000_lesson_exercises/migration.sql", import.meta.url);
const PUBLISHED_AT_MIGRATION = new URL(
  "./migrations/20261016140000_lesson_exercises_published_at/migration.sql",
  import.meta.url,
);
const INIT = new URL("./migrations/20260830190612_init/migration.sql", import.meta.url);
const sql = readFileSync(MIGRATION, "utf8");
const lessonSql = readFileSync(LESSON_MIGRATION, "utf8");
const publishedAtSql = readFileSync(PUBLISHED_AT_MIGRATION, "utf8");
const init = readFileSync(INIT, "utf8");
const schema = readFileSync(new URL("./schema.prisma", import.meta.url), "utf8");

/** The comment right above a column of a model in the schema, and nothing of a neighbour's. */
function columnComment(model: string, column: string): string {
  const start = schema.indexOf(`\nmodel ${model} {`);
  const block = schema.slice(start, schema.indexOf("\n}\n", start)).split("\n");
  const line = block.findIndex((text) => new RegExp(`^\\s+${column}\\s`).test(text));
  expect(line, `${model}.${column}`).toBeGreaterThan(-1);
  const comment: string[] = [];
  for (const text of block.slice(0, line).reverse()) {
    if (!text.trim().startsWith("///")) break;
    comment.push(text);
  }
  return comment.join(" ");
}

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
      expect(columnComment(model, column), `${model}.${column} names ${writer}`).toContain(writer);
    }
  });
});

// Phase 2: the hand-made TrainingExercise rows move into Exercise with the
// lesson as owner, keeping their ids (PLAN.md §2.5). The SQL computes what the
// writers would, and this holds it to them.
describe("the 20261016130000_lesson_exercises migration", () => {
  const LESSON_CHECKS = ["exercise_single_owner", "exercise_lesson_order_needs_lesson"];

  /** The seeded lesson exercises with the start their data gives them, as the seed derives it. */
  const seededStarts = COURSES.flatMap((course) =>
    course.chapters.flatMap((chapter) =>
      chapter.lessons.flatMap((lesson) =>
        lesson.exercises.map((exercise) => ({
          id: exercise.id,
          lineSans: exercise.lineSans,
          startFen: deriveExerciseData({
            initialFen: startFenOf(lesson.pgn),
            afterSans: exercise.afterSans,
            lineSans: exercise.lineSans,
          }).startFen,
        })),
      ),
    ),
  );

  it("adds the columns, the unique order per lesson and the cascade from the lesson, as Prisma's diff writes them", () => {
    expect(lessonSql).toContain(
      `ALTER TABLE "Exercise" ADD COLUMN     "lessonId" TEXT,\nADD COLUMN     "lessonOrder" INTEGER;`,
    );
    expect(lessonSql).toContain(
      `ALTER TABLE "TrainingAttempt" ADD COLUMN     "isLegacy" BOOLEAN NOT NULL DEFAULT false;`,
    );
    expect(lessonSql).toContain(
      `CREATE UNIQUE INDEX "Exercise_lessonId_lessonOrder_key" ON "Exercise"("lessonId", "lessonOrder");`,
    );
    const key = lessonSql.split("\n").find((line) => line.includes(`"Exercise_lessonId_fkey"`));
    expect(key).toContain(`REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    expect(lessonSql).not.toMatch(/DROP COLUMN|DROP TABLE/);
  });

  it("writes the two CHECKs by name, and the schema's header comment names each one", () => {
    const header = schema.slice(0, schema.indexOf("generator client"));
    for (const name of LESSON_CHECKS) {
      expect(lessonSql, name).toContain(`CONSTRAINT "${name}" CHECK`);
      expect(header, name).toContain(name);
    }
    expect(lessonSql).toContain(`CHECK (NOT ("teacherId" IS NOT NULL AND "lessonId" IS NOT NULL))`);
    expect(lessonSql).toContain(`CHECK ("lessonOrder" IS NULL OR "lessonId" IS NOT NULL)`);
  });

  it("moves only the hand-made rows: the isDerived filter is on the insert, the attempts' update and the delete", () => {
    const statements = lessonSql
      .split(/;\s*\n/)
      .map((statement) => statement.replace(/^(\s*--[^\n]*\n)+/, "").trim())
      .filter(Boolean);
    const insert = statements.find((statement) => statement.startsWith(`INSERT INTO "Exercise"`));
    const topics = statements.find((statement) => statement.startsWith(`INSERT INTO "ExerciseTopic"`));
    const update = statements.find((statement) => statement.startsWith(`UPDATE "TrainingAttempt"`));
    const remove = statements.find((statement) => statement.startsWith(`DELETE FROM "TrainingExercise"`));
    for (const [name, statement] of Object.entries({ insert, topics, update, remove })) {
      expect(statement, name).toBeDefined();
      expect(statement, `${name} filters isDerived`).toMatch(/NOT (?:te\.|x\.)?"isDerived"/);
    }
    // The order of the moves: the rows first, then their topics, their attempts and their states, and only then the delete.
    const at = (statement: string | undefined) => (statement ? lessonSql.indexOf(statement) : -1);
    expect(at(insert)).toBeLessThan(at(topics));
    expect(at(topics)).toBeLessThan(at(update));
    expect(at(update)).toBeLessThan(lessonSql.indexOf(`INSERT INTO "UserExerciseState"`));
    expect(lessonSql.indexOf(`INSERT INTO "UserExerciseState"`)).toBeLessThan(at(remove));
    expect(statements.filter((statement) => statement.startsWith("DELETE"))).toHaveLength(1);
  });

  it("keeps the ids and marks the moved attempts legacy, with their exercise and nothing of the drill left", () => {
    expect(lessonSql).toMatch(/INSERT INTO "Exercise" \("id",[^)]*\)\s*SELECT te\."id"/);
    expect(lessonSql).toContain(
      `UPDATE "TrainingAttempt" SET "exerciseId" = "trainingExerciseId", "trainingExerciseId" = NULL, "isLegacy" = true`,
    );
    // The states and their last result are built from the legacy rows alone.
    expect(lessonSql.match(/WHERE a\."isLegacy" AND a\."exerciseId" IS NOT NULL/g)).toHaveLength(2);
    expect(lessonSql).toContain(`min(a."createdAt") FILTER (WHERE r."code" = 'PASSED')`);
    expect(lessonSql).toContain(`SELECT DISTINCT ON (a."userId", a."exerciseId")`);
  });

  it("writes what the solution writer would: a SEQUENCE, PUBLISHED, the line as a PGN, the plies and the player's moves", () => {
    expect(lessonSql).toContain(`(SELECT "id" FROM "ExerciseKind" WHERE "code" = 'SEQUENCE')`);
    expect(lessonSql).toContain(`(SELECT "id" FROM "ExerciseStatus" WHERE "code" = 'PUBLISHED')`);
    expect(lessonSql).toContain(`'[SetUp "1"]' || E'\\n' || '[FEN "' || te."startFen" || '"]' || E'\\n\\n' ||`);
    // FIND_MOVE kept only its first SAN, which is where the trainer stopped.
    expect(lessonSql).toContain(
      `CASE m."code" WHEN 'FIND_MOVE' THEN split_part(trim(te."line"), ' ', 1) ELSE trim(te."line") END`,
    );
    expect(lessonSql).toContain(`p.plies, (p.plies + 1) / 2`);
    // The difficulty stays inside exercise_difficulty_range whatever the course's levels say.
    expect(lessonSql).toContain(`LEAST(3000, GREATEST(400, COALESCE(`);
  });

  it("hashes the start as createPositionHash does: a replica of the SQL over the seed's start FENs", () => {
    const expression = `encode(sha256(convert_to(array_to_string((string_to_array(te."startFen", ' '))[1:4], ' '), 'UTF8')), 'hex')`;
    expect(lessonSql).toContain(expression);
    // string_to_array … [1:4] + array_to_string: the first four fields joined by one space; sha256 as hex.
    const replica = (fen: string) => createHash("sha256").update(fen.split(" ").slice(0, 4).join(" ")).digest("hex");
    expect(seededStarts).toHaveLength(4);
    for (const { id, startFen } of seededStarts) {
      expect(replica(startFen), id).toBe(createPositionHash(startFen));
    }
  });

  it("the schema no longer calls the drills `exercises` on Lesson, and isLegacy's comment names this migration", () => {
    const start = schema.indexOf("\nmodel Lesson {");
    const lesson = schema.slice(start, schema.indexOf("\n}\n", start));
    expect(lesson).not.toMatch(/^\s+exercises\s/m);
    expect(lesson).toMatch(/^\s+trainingExercises\s+TrainingExercise\[\]/m);
    expect(lesson).toMatch(/^\s+lessonExercises\s+Exercise\[\]/m);
    expect(columnComment("TrainingAttempt", "isLegacy")).toContain("20261016130000_lesson_exercises");
    expect(columnComment("Exercise", "lessonOrder")).toContain("exercise-status.service.ts");
  });
});

// The data fix for what the phase 2 move left: PUBLISHED rows without the
// first publication's date, which the status writer always stamps.
describe("the 20261016140000_lesson_exercises_published_at migration", () => {
  const statements = publishedAtSql
    .split(/;\s*\n/)
    .map((statement) => statement.replace(/^(\s*--[^\n]*\n)+/, "").trim())
    .filter(Boolean);

  it("is one UPDATE of Exercise and nothing else: no row is created, moved or dropped", () => {
    expect(statements).toHaveLength(1);
    expect(statements[0]).toMatch(/^UPDATE "Exercise" e\s/);
    expect(publishedAtSql).not.toMatch(/INSERT|DELETE|DROP|ALTER/);
  });

  it("stamps the best date there is — the course's publication, else the row's creation, else now — on the moved rows only", () => {
    expect(publishedAtSql).toContain(`SET "publishedAt" = COALESCE(c."publishedAt", e."createdAt", now())`);
    expect(publishedAtSql).toContain(`JOIN "Course" c ON c."id" = ch."courseId"`);
    expect(publishedAtSql).toContain(`e."lessonId" IS NOT NULL`);
    expect(publishedAtSql).toContain(`e."statusId" = (SELECT "id" FROM "ExerciseStatus" WHERE "code" = 'PUBLISHED')`);
    expect(publishedAtSql).toContain(`e."publishedAt" IS NULL`);
    // The lesson exercise migration is what left the gap: this one comes right after it.
    expect(lessonSql).not.toContain('"publishedAt"');
  });
});
