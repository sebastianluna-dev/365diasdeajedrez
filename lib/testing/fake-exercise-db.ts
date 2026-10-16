import { EXERCISE_KIND, EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { ATTEMPT_CONTEXT, ATTEMPT_RESULT } from "@/constants/platform/training-codes.const";

// An in-memory stand-in for the slice of Prisma the exercise writers use
// (services/shared/exercise-*.service.ts), so their tests run without a
// database and can replay two transactions that overlap — the twin of
// fake-class-db.ts.
//
// It behaves as PostgreSQL does under READ COMMITTED, the app's level: a
// transaction sees the committed rows plus its own writes, and a row locked
// `FOR UPDATE` makes the next transaction that asks for it wait until the
// first one commits. The raw `INSERT … ON CONFLICT DO NOTHING` of a state row
// takes that row's lock too (PostgreSQL makes a second insert of the same key
// wait for the first one's commit; taking it also when the row was already
// there only serialises more). Only what the writers ask for is understood:
// `where` with equalities, `null`, `in`, `not`, `gte`/`gt`/`lte`/`lt` and the
// `userId_exerciseId` key, `orderBy` on one or more columns, and `data` as
// plain scalars or `{ connect }`; `select` is ignored. Every statement is
// logged in order (`log`), so a test can check that the lock comes first.

type Row = Record<string, unknown>;
type Patch = Map<string, Row | null>;

const TABLES = [
  "exerciseKind",
  "exerciseStatus",
  "attemptResult",
  "attemptContext",
  "statMetric",
  "topic",
  "exercise",
  "exerciseTopic",
  "trainingAttempt",
  "trainingMistake",
  "userExerciseState",
  "userActivity",
] as const;
export type ExerciseTable = (typeof TABLES)[number];

function keyOf(table: ExerciseTable, row: Row): string {
  if (table === "userExerciseState") return `${String(row.userId)}:${String(row.exerciseId)}`;
  if (table === "exerciseTopic") return `${String(row.exerciseId)}:${String(row.topicId)}`;
  return String(row.id);
}

function same(left: unknown, right: unknown): boolean {
  if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime();
  return left === right;
}

function compare(left: unknown, right: unknown): number {
  const a = left instanceof Date ? left.getTime() : (left as number);
  const b = right instanceof Date ? right.getTime() : (right as number);
  return a < b ? -1 : a > b ? 1 : 0;
}

function matches(row: Row, where: Row | undefined): boolean {
  for (const [key, condition] of Object.entries(where ?? {})) {
    if (key === "userId_exerciseId") {
      if (!matches(row, condition as Row)) return false;
      continue;
    }
    // The one relation filter the activity writer is asked with: an activity's type by code.
    if (key === "type") {
      if (row.typeCode !== (condition as { code: string }).code) return false;
      continue;
    }
    const value = row[key];
    if (condition !== null && typeof condition === "object" && !(condition instanceof Date)) {
      const op = condition as {
        in?: unknown[];
        not?: unknown;
        gte?: unknown;
        gt?: unknown;
        lte?: unknown;
        lt?: unknown;
      };
      if (op.in && !op.in.some((item) => same(item, value))) return false;
      if ("not" in op && same(op.not, value)) return false;
      if (op.gte !== undefined && (value === null || value === undefined || compare(value, op.gte) < 0)) return false;
      if (op.gt !== undefined && (value === null || value === undefined || compare(value, op.gt) <= 0)) return false;
      if (op.lte !== undefined && (value === null || value === undefined || compare(value, op.lte) > 0)) return false;
      if (op.lt !== undefined && (value === null || value === undefined || compare(value, op.lt) >= 0)) return false;
      continue;
    }
    if (!same(value ?? null, condition)) return false;
  }
  return true;
}

function sortBy(rows: Row[], orderBy: Row | Row[] | undefined): Row[] {
  const keys = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).flatMap((entry) => Object.entries(entry));
  if (keys.length === 0) return rows;
  return [...rows].sort((left, right) => {
    for (const [column, direction] of keys) {
      const order = compare(left[column], right[column]);
      if (order !== 0) return direction === "desc" ? -order : order;
    }
    return 0;
  });
}

/** `{ connect: { id | code } }` kept as the scalar (`userId`, `typeCode`), so a `where` can find the row. */
function flattenConnects(data: Row): Row {
  const out: Row = {};
  for (const [key, value] of Object.entries(data)) {
    const connect = (value as { connect?: Row } | null)?.connect;
    if (connect && "id" in connect) out[`${key}Id`] = connect.id;
    else if (connect && "code" in connect) out[`${key}Code`] = connect.code;
    else out[key] = value;
  }
  return out;
}

/** The columns a new row of a table starts with, as the schema's defaults give them. */
const DEFAULTS: Partial<Record<ExerciseTable, Row>> = {
  exercise: {
    teacherId: null,
    authorUserId: null,
    prompt: null,
    hints: [],
    explanation: null,
    mateIn: null,
    sourceWhite: null,
    sourceBlack: null,
    sourceEvent: null,
    sourceYear: null,
    sourceGameId: null,
    copiedFromId: null,
    submittedAt: null,
    reviewedAt: null,
    reviewedById: null,
    reviewNote: null,
    publishedAt: null,
  },
  trainingAttempt: {
    trainingExerciseId: null,
    exerciseId: null,
    seriesId: null,
    mistakes: 0,
    durationMs: null,
    requiredMoves: 0,
    correctMoves: 0,
    reachedPly: 0,
    hintsUsed: 0,
    solutionShown: false,
    isPerfect: false,
  },
  userExerciseState: {
    attemptCount: 0,
    firstAttemptAt: null,
    firstSolvedAt: null,
    lastAttemptAt: null,
    lastResultId: null,
    reviewStep: null,
    nextReviewAt: null,
    lastReviewedAt: null,
  },
};

interface Args {
  where?: Row;
  orderBy?: Row | Row[];
  data?: Row | Row[];
  take?: number;
}

/** The catalogs every test needs, with fixed ids. */
export const FAKE_EXERCISE_IDS = {
  kind: { [EXERCISE_KIND.SEQUENCE]: 1, [EXERCISE_KIND.MATE_IN]: 2 },
  status: {
    [EXERCISE_STATUS.DRAFT]: 1,
    [EXERCISE_STATUS.READY]: 2,
    [EXERCISE_STATUS.IN_REVIEW]: 3,
    [EXERCISE_STATUS.PUBLISHED]: 4,
    [EXERCISE_STATUS.ARCHIVED]: 5,
  },
  result: { [ATTEMPT_RESULT.PASSED]: 1, [ATTEMPT_RESULT.FAILED]: 2 },
  context: {
    [ATTEMPT_CONTEXT.LESSON]: 1,
    [ATTEMPT_CONTEXT.CHAPTER_QUIZ]: 2,
    [ATTEMPT_CONTEXT.TRAINER]: 3,
    [ATTEMPT_CONTEXT.SERIES]: 4,
    [ATTEMPT_CONTEXT.PRACTICE]: 5,
    [ATTEMPT_CONTEXT.REVIEW]: 6,
    [ATTEMPT_CONTEXT.CLASS]: 7,
    [ATTEMPT_CONTEXT.STORM]: 8,
  },
  /** Two roots and a child of the first, as the topic catalog nests them. */
  topic: { TACTICS: 1, ENDGAME: 2, FORK: 3, PIN: 4 },
} as const;

export interface FakeExerciseDb {
  /** A new transaction: its own view of the tables, its own locks. */
  begin(): FakeExerciseClient;
  /** The committed rows of a table, for a test to assert on. */
  rows(table: ExerciseTable): Row[];
}

export interface FakeDelegate {
  findUnique(args: unknown): Promise<Row | null>;
  findFirst(args: unknown): Promise<Row | null>;
  findMany(args: unknown): Promise<Row[]>;
  count(args: unknown): Promise<number>;
  create(args: unknown): Promise<Row>;
  createMany(args: unknown): Promise<{ count: number }>;
  updateMany(args: unknown): Promise<{ count: number }>;
  deleteMany(args: unknown): Promise<{ count: number }>;
}

export type FakeExerciseClient = Record<ExerciseTable, FakeDelegate> & {
  $queryRaw(strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  $executeRaw(strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  /** Makes the transaction's writes visible and releases its locks. */
  commit(): void;
  /** Every statement this transaction sent, in order: `table.method`, or the raw SQL with its values inlined. */
  log: string[];
};

let nextId = 1;

/** A database with the catalogs seeded and the given rows committed. */
export function fakeExerciseDb(seed: Partial<Record<ExerciseTable, Row[]>> = {}): FakeExerciseDb {
  const committed = new Map<ExerciseTable, Map<string, Row>>();
  for (const table of TABLES) committed.set(table, new Map());
  const put = (table: ExerciseTable, row: Row) => committed.get(table)!.set(keyOf(table, row), row);

  for (const [code, id] of Object.entries(FAKE_EXERCISE_IDS.kind)) put("exerciseKind", { id, code });
  for (const [code, id] of Object.entries(FAKE_EXERCISE_IDS.status)) put("exerciseStatus", { id, code });
  for (const [code, id] of Object.entries(FAKE_EXERCISE_IDS.result)) put("attemptResult", { id, code });
  for (const [code, id] of Object.entries(FAKE_EXERCISE_IDS.context)) put("attemptContext", { id, code });
  const { topic } = FAKE_EXERCISE_IDS;
  put("topic", { id: topic.TACTICS, code: "TACTICS", parentId: null, order: 0 });
  put("topic", { id: topic.ENDGAME, code: "ENDGAME", parentId: null, order: 3 });
  put("topic", { id: topic.FORK, code: "FORK", parentId: topic.TACTICS, order: 10 });
  put("topic", { id: topic.PIN, code: "PIN", parentId: topic.TACTICS, order: 11 });
  put("statMetric", { id: 1, code: "EXERCISES_PASSED" });
  for (const table of TABLES) for (const row of seed[table] ?? []) put(table, { ...DEFAULTS[table], ...row });

  const lockHeldBy = new Map<string, object>();
  const waiting: (() => void)[] = [];

  function begin(): FakeExerciseClient {
    const tx = {};
    const own = new Map<ExerciseTable, Patch>();
    for (const table of TABLES) own.set(table, new Map());
    const log: string[] = [];

    function visible(table: ExerciseTable): Row[] {
      const patch = own.get(table)!;
      const rows: Row[] = [];
      for (const [key, row] of committed.get(table)!) {
        if (patch.has(key)) {
          const mine = patch.get(key);
          if (mine) rows.push(mine);
        } else rows.push(row);
      }
      for (const [key, row] of patch) if (row && !committed.get(table)!.has(key)) rows.push(row);
      return rows;
    }

    async function lock(key: string) {
      while (lockHeldBy.has(key) && lockHeldBy.get(key) !== tx) {
        await new Promise<void>((resolve) => waiting.push(resolve));
      }
      lockHeldBy.set(key, tx);
    }

    function insert(table: ExerciseTable, data: Row): Row {
      const flat = flattenConnects(data);
      if (table !== "userExerciseState" && table !== "exerciseTopic" && flat.id === undefined) {
        flat.id = `${table}-${nextId++}`;
      }
      const row: Row = { ...DEFAULTS[table], createdAt: new Date(0), ...flat };
      const key = keyOf(table, row);
      if (visible(table).some((existing) => keyOf(table, existing) === key)) {
        throw new Error(`Unique constraint failed: ${table} ${key}`);
      }
      own.get(table)!.set(key, row);
      return row;
    }

    function delegate(table: ExerciseTable): FakeDelegate {
      const findMany = async (args: unknown) => {
        log.push(`${table}.findMany`);
        const { where, orderBy, take } = (args ?? {}) as Args;
        const rows = sortBy(
          visible(table).filter((row) => matches(row, where)),
          orderBy,
        );
        return (take === undefined ? rows : rows.slice(0, take)).map((row) => ({ ...row }));
      };
      const first = async (args: unknown, method: string) => {
        const rows = await findMany(args);
        log[log.length - 1] = `${table}.${method}`;
        return rows[0] ?? null;
      };
      return {
        findMany,
        findUnique: (args) => first(args, "findUnique"),
        findFirst: (args) => first(args, "findFirst"),
        async count(args) {
          const rows = await findMany(args);
          log[log.length - 1] = `${table}.count`;
          return rows.length;
        },
        async create(args) {
          log.push(`${table}.create`);
          return { ...insert(table, ((args as Args).data ?? {}) as Row) };
        },
        async createMany(args) {
          log.push(`${table}.createMany`);
          const data = (args as Args).data;
          const rows = Array.isArray(data) ? data : data ? [data] : [];
          for (const row of rows) insert(table, row);
          return { count: rows.length };
        },
        async updateMany(args) {
          log.push(`${table}.updateMany`);
          const { where, data } = args as Args;
          let count = 0;
          for (const row of visible(table)) {
            if (!matches(row, where)) continue;
            own.get(table)!.set(keyOf(table, row), { ...row, ...flattenConnects((data ?? {}) as Row) });
            count += 1;
          }
          return { count };
        },
        async deleteMany(args) {
          log.push(`${table}.deleteMany`);
          const { where } = (args ?? {}) as Args;
          let count = 0;
          for (const row of visible(table)) {
            if (!matches(row, where)) continue;
            own.get(table)!.set(keyOf(table, row), null);
            count += 1;
          }
          return { count };
        },
      };
    }

    const inline = (strings: TemplateStringsArray, values: unknown[]) =>
      strings.reduce(
        (out, part, index) => out + part + (index < values.length ? `<${String(values[index])}>` : ""),
        "",
      );

    /** A state row's key from a statement that names `"userId"` and `"exerciseId"` as its first two values. */
    const stateKey = (values: unknown[]) => `${String(values[0])}:${String(values[1])}`;

    const delegates = Object.fromEntries(TABLES.map((table) => [table, delegate(table)])) as Record<
      ExerciseTable,
      FakeDelegate
    >;

    return {
      ...delegates,
      log,
      async $queryRaw(strings, ...values) {
        const text = inline(strings, values);
        log.push(text);
        if (/FOR UPDATE/i.test(text) && /FROM "UserExerciseState"/.test(text)) await lock(stateKey(values));
        return [];
      },
      async $executeRaw(strings, ...values) {
        const text = inline(strings, values);
        log.push(text);
        if (/INSERT INTO "UserExerciseState"/.test(text) && /ON CONFLICT/i.test(text)) {
          const key = stateKey(values);
          await lock(key);
          if (!visible("userExerciseState").some((row) => keyOf("userExerciseState", row) === key)) {
            own.get("userExerciseState")!.set(key, {
              ...DEFAULTS.userExerciseState,
              userId: values[0],
              exerciseId: values[1],
              updatedAt: values[2],
            });
            return 1;
          }
          return 0;
        }
        return 1;
      },
      commit() {
        for (const table of TABLES) {
          for (const [key, row] of own.get(table)!) {
            if (row) committed.get(table)!.set(key, row);
            else committed.get(table)!.delete(key);
          }
          own.get(table)!.clear();
        }
        for (const [key, holder] of lockHeldBy) if (holder === tx) lockHeldBy.delete(key);
        waiting.splice(0).forEach((wake) => wake());
      },
    };
  }

  return { begin, rows: (table) => [...committed.get(table)!.values()].map((row) => ({ ...row })) };
}
