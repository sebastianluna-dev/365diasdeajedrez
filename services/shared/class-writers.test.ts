import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { PROJECT_ROOT } from "@/lib/testing/module-reach";

// Who may write what of a class. The columns of a class, a seat, a mark and a
// payment each have ONE writer in services/shared/ (AGENTS.md: a derived
// column is written by a single shared function that runs inside the caller's
// transaction), and an action that wrote `endsAt` or `statusId` by hand would
// not be caught by the types: Prisma accepts any column from anywhere. So this
// reads every source of the app, the components, the libraries, the services
// and the scripts as TypeScript, finds each `…class.create({ data })`,
// `…classParticipant.updateMany({ data })` and the like (nested relation
// writes included), and fails on a column written outside the files the table
// below allows.
//
// What it reads is the source, not the database: a `data` the guard cannot
// read — a variable, a spread of a call — is refused outside the four writers,
// so an action cannot hide a column behind a name. Inside a writer a spread is
// what the rule asks for (`...classScheduleColumns(…)`).
//
// Not read: the tests (they drive the writers with fakes and may write
// anything), the generated Prisma client, and `prisma/` — the seed is the one
// documented exception: it rebuilds the demo data row by row, every column at
// once, and spreads the same pure functions (`classScheduleColumns`,
// `classMeetingColumns`) the writers spread, so an end never disagrees with a
// start there either.

const SOURCES = ["app", "components", "lib", "services", "scripts"];
const SKIPPED = new Set(["node_modules", "lib/platform-db/generated"]);

const SCHEDULE = "services/shared/class-schedule.service.ts";
const STATUS = "services/shared/class-status.service.ts";
const ATTENDANCE = "services/shared/class-attendance.service.ts";
const SEATS = "services/shared/class-seats.service.ts";
const TEACHER_CLASSES = "services/teacher-classes/teacher-classes.actions.ts";
const STAFF_CLASSES = "services/staff-classes/staff-classes.actions.ts";
/** Phase 4 writes it; the path is allowed before the file exists. */
const STAFF_PAYMENTS = "services/staff-payments/staff-payments.actions.ts";

/** The four writers: the only files where a `data` the guard cannot read is accepted. */
const WRITERS = new Set([SCHEDULE, STATUS, ATTENDANCE, SEATS]);

type Model = "class" | "classParticipant" | "classPayment" | "classAttendanceChange";
type Method = "create" | "createMany" | "update" | "updateMany" | "upsert" | "delete" | "deleteMany";

const MODELS = new Set<string>(["class", "classParticipant", "classPayment", "classAttendanceChange"]);
const METHODS = new Set<string>(["create", "createMany", "update", "updateMany", "upsert", "delete", "deleteMany"]);

/**
 * The table of writers, by model and column: who may put the column in a
 * `data`. A relation is listed beside its foreign key (`status` with
 * `statusId`), since Prisma writes the same column through either. A column
 * that is not listed is anyone's (`id`, `joinedAt`, the `blocks` of a
 * class…). Phases 4–6 extend it here.
 */
const COLUMN_WRITERS: Record<Model, Record<string, string[]>> = {
  class: {
    // When a class is, how it is joined, its shape, who made it and its reschedule history.
    scheduledAt: [SCHEDULE],
    durationMin: [SCHEDULE],
    endsAt: [SCHEDULE],
    meetingUrl: [SCHEDULE],
    meetingProviderId: [SCHEDULE],
    meetingProvider: [SCHEDULE],
    meetingUrlVisibleFrom: [SCHEDULE],
    formatId: [SCHEDULE],
    format: [SCHEDULE],
    capacity: [SCHEDULE],
    previousScheduledAt: [SCHEDULE],
    rescheduledAt: [SCHEDULE],
    rescheduledById: [SCHEDULE],
    rescheduledBy: [SCHEDULE],
    rescheduleNote: [SCHEDULE],
    createdById: [SCHEDULE],
    createdBy: [SCHEDULE],
    // Its status after creation, and who closed or cancelled it and why.
    statusId: [STATUS],
    status: [STATUS],
    cancelledAt: [STATUS],
    cancelledById: [STATUS],
    cancelledBy: [STATUS],
    cancelReason: [STATUS],
    cancelNote: [STATUS],
    closedAt: [STATUS],
    closedById: [STATUS],
    closedBy: [STATUS],
    // When its attendance was first taken.
    attendanceTakenAt: [ATTENDANCE],
    // Its teacher: set at creation, and changed by the staff (`setClassTeacher`).
    teacherId: [SCHEDULE, STAFF_CLASSES],
    teacher: [SCHEDULE, STAFF_CLASSES],
    // What it is called and what it is about: the teacher and the staff edit them.
    title: [SCHEDULE, STAFF_CLASSES, TEACHER_CLASSES],
    description: [SCHEDULE, STAFF_CLASSES, TEACHER_CLASSES],
    // What the teacher writes after the class.
    summary: [TEACHER_CLASSES],
    recordingUrl: [TEACHER_CLASSES],
  },
  classParticipant: {
    // How a seat is covered, who added it, and the move of a no-show's seat.
    paymentId: [SEATS],
    payment: [SEATS],
    isFree: [SEATS],
    addedById: [SEATS],
    addedBy: [SEATS],
    seatMovedAt: [SEATS],
    seatMovedById: [SEATS],
    seatMovedBy: [SEATS],
    seatMovedToClassId: [SEATS],
    seatMovedToClass: [SEATS],
    seatMoveNote: [SEATS],
    // The mark.
    attended: [ATTENDANCE],
  },
  classPayment: {},
  classAttendanceChange: {},
};

/**
 * The table of row writers, by model and method: who may create or destroy a
 * row at all. An unlisted method is anyone's (a `class.update` is judged by
 * its columns); an empty list means nobody.
 */
const ROW_WRITERS: Record<Model, Partial<Record<Method, string[]>>> = {
  class: { create: [SCHEDULE] },
  classParticipant: {
    create: [SEATS],
    createMany: [SEATS],
    upsert: [SEATS],
    delete: [SEATS],
    deleteMany: [SEATS],
  },
  classPayment: {
    create: [STAFF_PAYMENTS],
    createMany: [STAFF_PAYMENTS],
    update: [STAFF_PAYMENTS],
    updateMany: [STAFF_PAYMENTS],
    upsert: [STAFF_PAYMENTS],
    delete: [STAFF_PAYMENTS],
    deleteMany: [STAFF_PAYMENTS],
  },
  // The log of marks is append-only (D5): only created, and only by attendance.
  classAttendanceChange: {
    create: [ATTENDANCE],
    createMany: [ATTENDANCE],
    update: [],
    updateMany: [],
    upsert: [],
    delete: [],
    deleteMany: [],
  },
};

/**
 * The derived columns and the pure function whose spread must sit beside them
 * in the same object literal: nobody writes an end or a platform by hand, not
 * even the writer.
 */
const DERIVED_BY: { columns: string[]; spread: string }[] = [
  { columns: ["endsAt"], spread: "classScheduleColumns(" },
  { columns: ["meetingUrl", "meetingProviderId", "meetingUrlVisibleFrom"], spread: "classMeetingColumns(" },
];

/** The relations of a watched model that lead to another watched model, in a nested write. */
const NESTED_MODEL: Record<Model, Record<string, Model>> = {
  class: { participants: "classParticipant", seatsMovedIn: "classParticipant" },
  classParticipant: { class: "class", payment: "classPayment", attendanceChanges: "classAttendanceChange" },
  classPayment: { seats: "classParticipant" },
  classAttendanceChange: { participant: "classParticipant" },
};

/** What a nested relation operation does to the related rows, as the method it stands for. */
const NESTED_METHOD: Record<string, Method> = {
  create: "create",
  createMany: "createMany",
  connectOrCreate: "create",
  update: "update",
  updateMany: "updateMany",
  upsert: "upsert",
  delete: "delete",
  deleteMany: "deleteMany",
};

/** The tags and methods that carry raw SQL, and the tables a raw statement may not change outside the writers. */
const RAW_SQL = new Set(["$executeRaw", "$queryRaw", "$executeRawUnsafe", "$queryRawUnsafe", "sql", "raw"]);
const RAW_TABLES = /"(?:Class|ClassParticipant|ClassAttendanceChange|ClassPayment)"/;
const RAW_WRITES = /\b(?:UPDATE|INSERT|DELETE)\b/i;

function filesOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (SKIPPED.has(entry.name) || SKIPPED.has(relative(PROJECT_ROOT, path))) return [];
    if (entry.isDirectory()) return filesOf(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/** A `data` as the guard read it: its columns and the spreads it could not open. */
interface DataLiteral {
  at: string;
  columns: string[];
  /** The text of each spread the guard could not open (`...audit`, `...classScheduleColumns(…)`). */
  opaqueSpreads: string[];
}

/** A write the guard found: a row operation and the `data` literals it carries. */
interface Write {
  file: string;
  at: string;
  model: Model;
  method: Method;
  /** The write this one is nested in (`participants: { create }` inside a `class.create`), if any. */
  within: string | null;
  data: DataLiteral[];
  /** A `data` (or an upsert's `create`/`update`) that is not a literal, by text. */
  unreadable: string[];
}

interface RawStatement {
  file: string;
  at: string;
  text: string;
}

function unwrap(node: ts.Expression): ts.Expression {
  return ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)
    ? unwrap(node.expression)
    : node;
}

function propertyName(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return name.text;
  return null;
}

/**
 * The object literals a value holds, through parentheses, `as`, a ternary
 * (`...(x ? { a } : {})`) and an array (`data: [{…}, {…}]`). The expressions
 * it cannot open come back as text.
 */
function literalsOf(node: ts.Expression): { literals: ts.ObjectLiteralExpression[]; opaque: string[] } {
  const value = unwrap(node);
  if (ts.isObjectLiteralExpression(value)) return { literals: [value], opaque: [] };
  const branches = ts.isArrayLiteralExpression(value)
    ? [...value.elements]
    : ts.isConditionalExpression(value)
      ? [value.whenTrue, value.whenFalse]
      : null;
  if (!branches) return { literals: [], opaque: [value.getText()] };
  const parts = branches.map(literalsOf);
  return { literals: parts.flatMap((part) => part.literals), opaque: parts.flatMap((part) => part.opaque) };
}

/** The property named `name` of an object literal, if it is written there. */
function propertyOf(literal: ts.ObjectLiteralExpression, name: string): ts.Expression | null {
  for (const property of literal.properties) {
    if (ts.isPropertyAssignment(property) && propertyName(property.name) === name) return property.initializer;
    if (ts.isShorthandPropertyAssignment(property) && property.name.text === name) return property.name;
  }
  return null;
}

function positionOf(source: ts.SourceFile, node: ts.Node): string {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart());
  return `${relative(PROJECT_ROOT, source.fileName)}:${line + 1}`;
}

/**
 * Reads a `data` literal of `model`: its columns (through the spreads it can
 * open) and the nested writes it carries, which go to `nested` as writes of
 * their own (`participants: { create: [...] }` inside a class is a seat being
 * created; `class: { update: {…} }` inside a seat, a class being changed).
 */
function readData(
  source: ts.SourceFile,
  literal: ts.ObjectLiteralExpression,
  model: Model,
  method: Method,
  within: string,
  nested: Write[],
): DataLiteral {
  const columns: string[] = [];
  const opaqueSpreads: string[] = [];
  for (const property of literal.properties) {
    if (ts.isSpreadAssignment(property)) {
      const { literals, opaque } = literalsOf(property.expression);
      for (const inner of literals) {
        const read = readData(source, inner, model, method, within, nested);
        columns.push(...read.columns);
        opaqueSpreads.push(...read.opaqueSpreads);
      }
      opaqueSpreads.push(...opaque);
      continue;
    }
    const name = propertyName(property.name);
    if (!name) continue;
    columns.push(name);
    const target = NESTED_MODEL[model][name];
    if (!target || !ts.isPropertyAssignment(property)) continue;
    const value = unwrap(property.initializer);
    if (!ts.isObjectLiteralExpression(value)) continue;
    for (const operation of value.properties) {
      if (!ts.isPropertyAssignment(operation)) continue;
      const operationName = propertyName(operation.name);
      const nestedMethod = operationName ? NESTED_METHOD[operationName] : undefined;
      if (!nestedMethod) continue;
      nested.push(...readWrite(source, operation.initializer, target, nestedMethod, operation, within));
    }
  }
  return { at: positionOf(source, literal), columns, opaqueSpreads };
}

/**
 * Reads the argument of a write — its `data` (a create, an update, a
 * createMany), its `create` and `update` (an upsert), or, nested, the rows
 * themselves (`create: [{…}]`) and `{ where, data }` pairs — and returns the
 * write with every write nested inside it.
 */
function readWrite(
  source: ts.SourceFile,
  argument: ts.Expression | undefined,
  model: Model,
  method: Method,
  at: ts.Node,
  within: string | null,
): Write[] {
  const write: Write = {
    file: relative(PROJECT_ROOT, source.fileName),
    at: positionOf(source, at),
    model,
    method,
    within,
    data: [],
    unreadable: [],
  };
  if (!argument || method === "delete" || method === "deleteMany") return [write];

  const nested: Write[] = [];
  const read = (value: ts.Expression) => {
    const { literals, opaque } = literalsOf(value);
    for (const literal of literals) write.data.push(readData(source, literal, model, method, write.at, nested));
    write.unreadable.push(...opaque);
  };
  const { literals, opaque } = literalsOf(argument);
  write.unreadable.push(...opaque);
  for (const literal of literals) {
    const parts = ["data", "create", "update"].map((name) => propertyOf(literal, name)).filter((part) => part !== null);
    // A nested `create: [{ classId, … }]` holds the rows themselves.
    if (parts.length === 0) read(literal);
    for (const part of parts) read(part);
  }
  return [write, ...nested];
}

/** The literal text an expression carries: a string, a template's fixed parts, or what its children carry. */
function textOf(node: ts.Node): string {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isTemplateExpression(node)) {
    return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(" ");
  }
  const parts: string[] = [];
  ts.forEachChild(node, (child) => {
    const text = textOf(child);
    if (text) parts.push(text);
  });
  return parts.join("\n");
}

/** The writes and the raw statements of a file. */
function scan(path: string): { writes: Write[]; raw: RawStatement[] } {
  const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, kind);
  const writes: Write[] = [];
  const raw: RawStatement[] = [];
  const file = relative(PROJECT_ROOT, path);

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const method = node.expression.name.text;
      const owner = node.expression.expression;
      if (METHODS.has(method) && ts.isPropertyAccessExpression(owner) && MODELS.has(owner.name.text)) {
        writes.push(...readWrite(source, node.arguments[0], owner.name.text as Model, method as Method, node, null));
      }
      if (RAW_SQL.has(method)) {
        const text = node.arguments.map(textOf).join("\n");
        if (text) raw.push({ file, at: positionOf(source, node), text });
      }
    }
    if (ts.isTaggedTemplateExpression(node)) {
      const tag = node.tag;
      const name = ts.isPropertyAccessExpression(tag) ? tag.name.text : ts.isIdentifier(tag) ? tag.text : "";
      if (RAW_SQL.has(name)) raw.push({ file, at: positionOf(source, node), text: textOf(node.template) });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { writes, raw };
}

const files = SOURCES.flatMap((directory) => filesOf(join(PROJECT_ROOT, directory)));
const scanned = files.map(scan);
const writes = scanned.flatMap((result) => result.writes);
const raw = scanned.flatMap((result) => result.raw);

const describeWrite = (write: Write) =>
  `${write.at}: ${write.model}.${write.method}${write.within ? ` (nested in ${write.within})` : ""}`;

describe("the writers of a class", () => {
  it("are read: the walk finds the four writers and their writes", () => {
    const seen = new Set(writes.map((write) => write.file));
    for (const writer of WRITERS) expect(seen, `${writer} writes nothing?`).toContain(writer);
    expect(writes.length).toBeGreaterThanOrEqual(10);
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

  it("write a `data` the guard can read, outside the four writers", () => {
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

  it("spread the pure function beside every derived column", () => {
    const offenders = writes.flatMap((write) =>
      write.data.flatMap((data) =>
        DERIVED_BY.flatMap(({ columns, spread }) => {
          const written = columns.filter((column) => data.columns.includes(column));
          if (written.length === 0) return [];
          if (data.opaqueSpreads.some((text) => text.startsWith(spread))) return [];
          return [
            `${data.at}: ${write.model}.${write.method} names ${written.join(", ")} without spreading ${spread}…)`,
          ];
        }),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("change the class tables in raw SQL only from the four writers (a SELECT … FOR UPDATE is a lock, not a write)", () => {
    expect(raw.length).toBeGreaterThanOrEqual(3);
    const offenders = raw.flatMap((statement) => {
      if (WRITERS.has(statement.file)) return [];
      const text = statement.text.replace(/\bFOR\s+UPDATE\b/gi, "");
      if (!RAW_TABLES.test(text) || !RAW_WRITES.test(text)) return [];
      return [`${statement.at}: raw SQL changes a class table`];
    });
    expect(offenders).toEqual([]);
  });

  it("record the CLASS_ATTENDED activity only from the attendance writer", () => {
    const offenders = files
      .map((path) => relative(PROJECT_ROOT, path))
      .filter((file) => file !== ATTENDANCE)
      .filter((file) => {
        const source = readFileSync(join(PROJECT_ROOT, file), "utf8");
        return /\bCLASS_ATTENDED\b/.test(source) && /\brecordUserActivity\b/.test(source);
      });
    expect(offenders).toEqual([]);
  });
});
