import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT } from "@/lib/testing/module-reach";
import { describeWrite, scanWrites, writeScanFiles, type WriteMethod } from "@/lib/testing/write-scan";

// Who may write what of an exercise — the twin of class-writers.test.ts. The
// solution and its frozen columns, the status and the review's stamps, and
// the attempts with their mistakes and the student's standing each have ONE
// writer in services/shared/ (AGENTS.md: a derived column is written by a
// single shared function that runs inside the caller's transaction), and
// Prisma's types accept any column from anywhere. So this reads every source
// of the app, the components, the libraries, the services and the scripts as
// TypeScript (lib/testing/write-scan.ts), finds each write of `exercise`,
// `trainingAttempt`, `trainingMistake` and `userExerciseState` (nested
// relation writes included), and fails on a column written outside the files
// the table below allows.
//
// Every insert of an exercise goes through `createExerciseRecord`: the
// editor's save, «Duplicar» (`duplicateTeacherExercise`), a library exercise
// copied to a lesson (`copyLibraryExerciseToLesson`, D28) and the import;
// those may not write a guarded column themselves, which the column table
// already says of every file but the writers.
//
// Not read: the tests (they drive the writers with fakes) and `prisma/` — the
// seed is the documented exception: rows by fixed id, spreading
// `exerciseSolutionColumns` as the writers do, its status written as seeded
// data, and the states folded by `rebuildUserExerciseState`.

const RECORD = "services/shared/exercise-record.service.ts";
const STATUS = "services/shared/exercise-status.service.ts";
const ATTEMPT = "services/shared/exercise-attempt.service.ts";
/** The dormant line trainer: its attempts point at a TrainingExercise (`trainingExerciseId`), never at an Exercise. */
const TRAINER = "services/trainer/trainer.actions.ts";

/** The three writers: the only files where a `data` the guard cannot read is accepted. */
const WRITERS = new Set([RECORD, STATUS, ATTEMPT]);

type Model = "exercise" | "trainingAttempt" | "trainingMistake" | "userExerciseState";

const MODELS: readonly Model[] = ["exercise", "trainingAttempt", "trainingMistake", "userExerciseState"];

/** The seven columns of a solution, always written together by `exerciseSolutionColumns`. */
const SOLUTION_COLUMNS = [
  "solutionPgn",
  "kindId",
  "mateIn",
  "startFen",
  "startPositionHash",
  "solutionPlies",
  "playerMoves",
];

/** Every column of a TrainingAttempt an Exercise attempt writes, but the line drill's own reference. */
const ATTEMPT_COLUMNS = ["exerciseId", "exercise", "seriesId", "series", "solutionShown", "mistakeDetails"];

/** The columns of the student's standing with an exercise. */
const STATE_COLUMNS = [
  "attemptCount",
  "firstAttemptAt",
  "firstSolvedAt",
  "lastAttemptAt",
  "lastResultId",
  "lastResult",
  "reviewStep",
  "nextReviewAt",
  "lastReviewedAt",
];

const only = (writer: string, columns: string[]) => Object.fromEntries(columns.map((column) => [column, [writer]]));

/**
 * The table of writers, by model and column: who may put the column in a
 * `data`. A relation is listed beside its foreign key (`kind` with `kindId`).
 * A column that is not listed is anyone's (`title`, `hints`, the source…).
 */
const COLUMN_WRITERS: Record<Model, Record<string, string[]>> = {
  exercise: {
    ...only(RECORD, SOLUTION_COLUMNS),
    kind: [RECORD],
    statusId: [STATUS],
    status: [STATUS],
    submittedAt: [STATUS],
    reviewedAt: [STATUS],
    reviewedById: [STATUS],
    reviewedBy: [STATUS],
    reviewNote: [STATUS],
    publishedAt: [STATUS],
  },
  trainingAttempt: {
    ...only(ATTEMPT, ATTEMPT_COLUMNS),
    trainingExerciseId: [TRAINER],
    trainingExercise: [TRAINER],
  },
  trainingMistake: {},
  userExerciseState: only(ATTEMPT, STATE_COLUMNS),
};

/**
 * The table of row writers, by model and method: who may create or destroy a
 * row at all. An unlisted method is anyone's (an `exercise.update` is judged
 * by its columns, an exercise without attempts may be deleted); an empty list
 * means nobody. The attempts and their mistakes are an append-only log.
 */
const ROW_WRITERS: Record<Model, Partial<Record<WriteMethod, string[]>>> = {
  exercise: { create: [RECORD], createMany: [RECORD], upsert: [RECORD] },
  trainingAttempt: {
    create: [ATTEMPT, TRAINER],
    createMany: [],
    update: [],
    updateMany: [],
    upsert: [],
    delete: [],
    deleteMany: [],
  },
  trainingMistake: {
    create: [ATTEMPT],
    createMany: [ATTEMPT],
    update: [],
    updateMany: [],
    upsert: [],
    delete: [],
    deleteMany: [],
  },
  userExerciseState: {
    create: [ATTEMPT],
    createMany: [ATTEMPT],
    update: [ATTEMPT],
    updateMany: [ATTEMPT],
    upsert: [ATTEMPT],
    delete: [ATTEMPT],
    deleteMany: [ATTEMPT],
  },
};

/** The relations of a watched model that lead to another watched model, in a nested write. */
const NESTED_MODEL: Record<Model, Record<string, Model>> = {
  exercise: { attempts: "trainingAttempt", states: "userExerciseState", copies: "exercise", copiedFrom: "exercise" },
  trainingAttempt: { exercise: "exercise", mistakeDetails: "trainingMistake" },
  trainingMistake: { attempt: "trainingAttempt" },
  userExerciseState: { exercise: "exercise" },
};

/** The tables a raw statement may not change outside the writers. */
const RAW_TABLES = /"(?:Exercise|TrainingAttempt|TrainingMistake|UserExerciseState)"/;
const RAW_WRITES = /\b(?:UPDATE|INSERT|DELETE)\b/i;

const files = writeScanFiles();
const { writes, raw } = scanWrites(files, { models: MODELS, nested: NESTED_MODEL });

describe("the writers of an exercise", () => {
  it("are read: the walk finds the three writers and their writes", () => {
    const seen = new Set(writes.map((write) => write.file));
    for (const writer of WRITERS) expect(seen, `${writer} writes nothing?`).toContain(writer);
    expect(seen).toContain(TRAINER);
  });

  it("create and destroy rows only where the table allows", () => {
    const offenders = writes.flatMap((write) => {
      const allowed = ROW_WRITERS[write.model][write.method];
      if (!allowed || allowed.includes(write.file)) return [];
      const who = allowed.length === 0 ? "nobody may" : `only ${allowed.join(", ")} may`;
      return [`${describeWrite(write)} — ${who}`];
    });
    expect(offenders).toEqual([]);
  });

  it("write each column only from its writer", () => {
    const offenders = writes.flatMap((write) =>
      write.data.flatMap((data) =>
        data.columns.flatMap((column) => {
          const allowed = COLUMN_WRITERS[write.model][column];
          if (!allowed || allowed.includes(write.file)) return [];
          return [`${data.at}: ${write.model}.${write.method} writes ${column} — only ${allowed.join(", ")} may`];
        }),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("write a `data` the guard can read, outside the three writers", () => {
    const offenders = writes.flatMap((write) => {
      if (WRITERS.has(write.file)) return [];
      const hidden = [
        ...write.unreadable.map((text) => `a data that is not a literal: ${text}`),
        ...write.data.flatMap((data) => data.opaqueSpreads.map((text) => `a spread the guard cannot open: ...${text}`)),
      ];
      return hidden.map((what) => `${describeWrite(write)} hides its columns behind ${what}`);
    });
    expect(offenders).toEqual([]);
  });

  it("spread exerciseSolutionColumns beside every column of the solution, even in the writer", () => {
    const offenders = writes.flatMap((write) =>
      write.data.flatMap((data) => {
        if (write.model !== "exercise") return [];
        const written = SOLUTION_COLUMNS.filter((column) => data.columns.includes(column));
        if (written.length === 0) return [];
        if (data.opaqueSpreads.some((text) => text.startsWith("exerciseSolutionColumns("))) return [];
        return [`${data.at}: exercise.${write.method} names ${written.join(", ")} without exerciseSolutionColumns(…)`];
      }),
    );
    expect(offenders).toEqual([]);
  });

  it("insert every exercise with its solution's columns and as a draft (initialExerciseStatusData)", () => {
    const inserts = writes.filter((write) => write.model === "exercise" && write.method === "create");
    expect(inserts.length).toBeGreaterThanOrEqual(1);
    const offenders = inserts.flatMap((write) =>
      write.data.flatMap((data) =>
        ["exerciseSolutionColumns(", "initialExerciseStatusData("]
          .filter((spread) => !data.opaqueSpreads.some((text) => text.startsWith(spread)))
          .map((spread) => `${data.at}: exercise.create without ...${spread}…)`),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("change the exercise tables in raw SQL only from the three writers (a SELECT … FOR UPDATE is a lock, not a write)", () => {
    expect(raw.some((statement) => statement.file === ATTEMPT)).toBe(true);
    const offenders = raw.flatMap((statement) => {
      if (WRITERS.has(statement.file)) return [];
      const text = statement.text.replace(/\bFOR\s+UPDATE\b/gi, "");
      if (!RAW_TABLES.test(text) || !RAW_WRITES.test(text)) return [];
      return [`${statement.at}: raw SQL changes an exercise table`];
    });
    expect(offenders).toEqual([]);
  });

  it("record EXERCISE_PASSED only from the attempt writer (and the dormant trainer, IMPROVEMENTS)", () => {
    const offenders = files
      .map((path) => relative(PROJECT_ROOT, path))
      .filter((file) => file !== ATTEMPT && file !== TRAINER)
      .filter((file) => {
        const source = readFileSync(`${PROJECT_ROOT}${file}`, "utf8");
        return /\bEXERCISE_PASSED\b/.test(source) && /\brecordUserActivity\b/.test(source);
      });
    expect(offenders).toEqual([]);
  });

  it("copy an exercise only through createExerciseRecord and its whitelist (exerciseCopyInput)", () => {
    const offenders = files
      .map((path) => relative(PROJECT_ROOT, path))
      .filter((file) =>
        /\b(?:duplicateTeacherExercise|copyLibraryExerciseToLesson)\s*\(/.test(
          readFileSync(`${PROJECT_ROOT}${file}`, "utf8"),
        ),
      )
      .filter((file) => {
        const source = readFileSync(`${PROJECT_ROOT}${file}`, "utf8");
        const defines = /(?:function|const)\s+(?:duplicateTeacherExercise|copyLibraryExerciseToLesson)\b/.test(source);
        return defines && !(/\bcreateExerciseRecord\(/.test(source) && /\bexerciseCopyInput\(/.test(source));
      });
    expect(offenders).toEqual([]);
  });
});
