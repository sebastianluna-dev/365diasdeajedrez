import { CLASS_FORMAT, CLASS_STATUS, MEETING_PROVIDER } from "@/constants/platform/class-codes.const";

// An in-memory stand-in for the slice of Prisma the class writers use
// (services/shared/class-*.service.ts), so their tests run without a
// database and can replay two transactions that overlap.
//
// It behaves as PostgreSQL does under READ COMMITTED, the app's level: a
// transaction sees the committed rows plus its own writes, and a row locked
// `FOR UPDATE` makes the next transaction that asks for it wait until the
// first one commits. Only what the writers ask for is understood: `where`
// with equalities, `null`, `in` and the `classId_userId` key, `orderBy` on
// one or more columns, and `data` as plain scalars; `select` is ignored,
// since the writers read scalars only.

type Row = Record<string, unknown>;
type Patch = Map<string, Row | null>;

const TABLES = [
  "classStatus",
  "classFormat",
  "meetingProvider",
  "statMetric",
  "class",
  "classParticipant",
  "classPayment",
  "classAttendanceChange",
  "userActivity",
] as const;
type Table = (typeof TABLES)[number];

function keyOf(table: Table, row: Row): string {
  return table === "classParticipant" ? `${String(row.classId)}:${String(row.userId)}` : String(row.id);
}

function same(left: unknown, right: unknown): boolean {
  if (left instanceof Date && right instanceof Date) return left.getTime() === right.getTime();
  return left === right;
}

function matches(row: Row, where: Row | undefined): boolean {
  for (const [key, condition] of Object.entries(where ?? {})) {
    if (key === "classId_userId") {
      if (!matches(row, condition as Row)) return false;
      continue;
    }
    // The one relation filter the writers use: an activity's type by code.
    if (key === "type") {
      if (row.typeCode !== (condition as { code: string }).code) return false;
      continue;
    }
    const value = row[key];
    if (condition !== null && typeof condition === "object" && !(condition instanceof Date)) {
      const op = condition as { in?: unknown[]; not?: unknown };
      if (op.in && !op.in.some((item) => same(item, value))) return false;
      if ("not" in op && same(op.not, value)) return false;
      continue;
    }
    if (!same(value, condition)) return false;
  }
  return true;
}

function sortBy(rows: Row[], orderBy: Row | Row[] | undefined): Row[] {
  const keys = (Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : []).flatMap((entry) => Object.entries(entry));
  if (keys.length === 0) return rows;
  return [...rows].sort((left, right) => {
    for (const [column, direction] of keys) {
      const a = left[column] as number | string | Date;
      const b = right[column] as number | string | Date;
      const order = a < b ? -1 : a > b ? 1 : 0;
      if (order !== 0) return direction === "desc" ? -order : order;
    }
    return 0;
  });
}

/**
 * `recordUserActivity` writes its relations as `{ connect: { id | code } }`;
 * the fake keeps the scalar (`userId`, `typeCode`, `subjectTypeCode`) so a
 * `where` can find the row.
 */
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

interface Args {
  where?: Row;
  orderBy?: Row | Row[];
  data?: Row;
  take?: number;
}

/** The catalogs every test needs, with fixed ids. */
export const FAKE_IDS = {
  status: {
    [CLASS_STATUS.SCHEDULED]: 1,
    [CLASS_STATUS.LIVE]: 2,
    [CLASS_STATUS.COMPLETED]: 3,
    [CLASS_STATUS.CANCELLED]: 4,
  },
  format: { [CLASS_FORMAT.INDIVIDUAL]: 1, [CLASS_FORMAT.GROUP]: 2 },
  provider: { [MEETING_PROVIDER.ZOOM]: 1, [MEETING_PROVIDER.MEET]: 2, [MEETING_PROVIDER.OTHER]: 3 },
} as const;

export interface FakeClassDb {
  /** A new transaction: its own view of the tables, its own locks. */
  begin(): FakeClient;
  /** The committed rows of a table, for a test to assert on. */
  rows(table: Table): Row[];
}

export interface FakeClient {
  $queryRaw(strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  $executeRaw(strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  classStatus: Delegate;
  classFormat: Delegate;
  meetingProvider: Delegate;
  statMetric: Delegate;
  class: Delegate;
  classParticipant: Delegate;
  classPayment: Delegate;
  classAttendanceChange: Delegate;
  userActivity: Delegate;
  /** Makes the transaction's writes visible and releases its locks. */
  commit(): void;
  /** Every raw SQL this transaction sent, with its values inlined, in order. */
  sql: string[];
}

export interface Delegate {
  findUnique(args: unknown): Promise<Row | null>;
  findUniqueOrThrow(args: unknown): Promise<Row>;
  findMany(args: unknown): Promise<Row[]>;
  create(args: unknown): Promise<Row>;
  updateMany(args: unknown): Promise<{ count: number }>;
  deleteMany(args: unknown): Promise<{ count: number }>;
}

let nextId = 1;

/**
 * A database with the catalogs seeded and the given rows committed. Dates in
 * `class` rows come as given; `endsAt` must be supplied by the test (the
 * writers compute it, the fixtures carry it).
 */
export function fakeClassDb(seed: Partial<Record<Table, Row[]>> = {}): FakeClassDb {
  const committed = new Map<Table, Map<string, Row>>();
  for (const table of TABLES) committed.set(table, new Map());
  const put = (table: Table, row: Row) => committed.get(table)!.set(keyOf(table, row), row);

  for (const [code, id] of Object.entries(FAKE_IDS.status)) put("classStatus", { id, code });
  for (const [code, id] of Object.entries(FAKE_IDS.format)) put("classFormat", { id, code });
  for (const [code, id] of Object.entries(FAKE_IDS.provider)) put("meetingProvider", { id, code, isActive: true });
  put("statMetric", { id: 1, code: "CLASSES_ATTENDED" });
  for (const table of TABLES) for (const row of seed[table] ?? []) put(table, row);

  const lockHeldBy = new Map<string, object>();
  const waiting: (() => void)[] = [];

  function begin(): FakeClient {
    const tx = {};
    const own = new Map<Table, Patch>();
    for (const table of TABLES) own.set(table, new Map());
    const sql: string[] = [];

    function visible(table: Table): Row[] {
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

    async function lock(keys: string[]) {
      for (const key of keys) {
        while (lockHeldBy.has(key) && lockHeldBy.get(key) !== tx) {
          await new Promise<void>((resolve) => waiting.push(resolve));
        }
        lockHeldBy.set(key, tx);
      }
    }

    function delegate(table: Table): Delegate {
      const findMany = async (args: unknown) => {
        const { where, orderBy, take } = (args ?? {}) as Args;
        const rows = sortBy(
          visible(table).filter((row) => matches(row, where)),
          orderBy,
        );
        return (take === undefined ? rows : rows.slice(0, take)).map((row) => ({ ...row }));
      };
      return {
        findMany,
        async findUnique(args) {
          return (await findMany(args))[0] ?? null;
        },
        async findUniqueOrThrow(args) {
          const row = (await findMany(args))[0];
          if (!row) throw new Error(`${table}: not found`);
          return row;
        },
        async create(args) {
          const data = flattenConnects({ ...((args as Args).data ?? {}) });
          if (table !== "classParticipant" && data.id === undefined) data.id = `${table}-${nextId++}`;
          const row: Row =
            table === "classParticipant"
              ? {
                  attended: null,
                  seatMovedAt: null,
                  seatMovedById: null,
                  seatMovedToClassId: null,
                  seatMoveNote: null,
                  isFree: false,
                  paymentId: null,
                  addedById: null,
                  ...data,
                }
              : table === "class"
                ? {
                    capacity: null,
                    title: null,
                    description: null,
                    meetingUrl: null,
                    meetingProviderId: null,
                    meetingUrlVisibleFrom: null,
                    attendanceTakenAt: null,
                    createdById: null,
                    ...data,
                  }
                : data;
          const key = keyOf(table, row);
          // The writers never let a duplicate reach the row (they look first);
          // a fake that found one would be a bug of the writer under test.
          if (visible(table).some((existing) => keyOf(table, existing) === key)) {
            throw new Error(`Unique constraint failed: ${table}`);
          }
          own.get(table)!.set(key, row);
          return { ...row };
        },
        async updateMany(args) {
          const { where, data } = args as Args;
          let count = 0;
          for (const row of visible(table)) {
            if (!matches(row, where)) continue;
            own.get(table)!.set(keyOf(table, row), { ...row, ...data });
            count += 1;
          }
          return { count };
        },
        async deleteMany(args) {
          const { where } = args as Args;
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

    const client: FakeClient = {
      sql,
      async $queryRaw(strings, ...values) {
        const text = strings.reduce(
          (out, part, index) => out + part + (index < values.length ? `<${String(values[index])}>` : ""),
          "",
        );
        sql.push(text);
        if (!/FOR UPDATE/i.test(text)) return [];
        if (/FROM "Class"/.test(text)) {
          const ids = (values[0] as string[]).map((id) => `Class:${id}`);
          await lock(ids);
        } else if (/FROM "ClassPayment"/.test(text)) {
          const ids = /"studentId" =/.test(text)
            ? sortBy(
                visible("classPayment").filter((row) => row.studentId === values[0]),
                [{ paidOn: "asc" }, { id: "asc" }],
              ).map((row) => `ClassPayment:${String(row.id)}`)
            : [`ClassPayment:${String(values[0])}`];
          await lock(ids);
        }
        return [];
      },
      async $executeRaw(strings, ...values) {
        sql.push(
          strings.reduce(
            (out, part, index) => out + part + (index < values.length ? `<${String(values[index])}>` : ""),
            "",
          ),
        );
        return 1;
      },
      classStatus: delegate("classStatus"),
      classFormat: delegate("classFormat"),
      meetingProvider: delegate("meetingProvider"),
      statMetric: delegate("statMetric"),
      class: delegate("class"),
      classParticipant: delegate("classParticipant"),
      classPayment: delegate("classPayment"),
      classAttendanceChange: delegate("classAttendanceChange"),
      userActivity: delegate("userActivity"),
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
    return client;
  }

  return { begin, rows: (table) => [...committed.get(table)!.values()].map((row) => ({ ...row })) };
}
