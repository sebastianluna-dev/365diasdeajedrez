import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { PROJECT_ROOT } from "./module-reach";

// Every Prisma write of the source, read as TypeScript, for the guards that
// keep a derived column with its one writer (services/shared/class-writers.test.ts,
// services/shared/exercise-writers.test.ts): AGENTS.md asks that a derived
// column be written by a single shared function, and Prisma's types accept
// any column from anywhere, so only a reading of the source can tell.
//
// It finds each `…<model>.<method>(…)` of the watched models — `create`,
// `update`, `upsert` and the rest, nested relation writes included — and
// reads its `data` (an upsert's `create`/`update`) as the columns it names.
// What it cannot read — a variable, a spread of a call — comes back as text,
// so a guard can refuse it outside the writers. It also collects the raw SQL
// a file sends (`$executeRaw`, `$queryRaw`, `sql` tags).
//
// A static reading of the source, not of the database; the tests are not
// read (they drive the writers with fakes and may write anything), nor the
// generated Prisma client.

export type WriteMethod = "create" | "createMany" | "update" | "updateMany" | "upsert" | "delete" | "deleteMany";

const METHODS = new Set<string>(["create", "createMany", "update", "updateMany", "upsert", "delete", "deleteMany"]);

/** What a nested relation operation does to the related rows, as the method it stands for. */
const NESTED_METHOD: Record<string, WriteMethod> = {
  create: "create",
  createMany: "createMany",
  connectOrCreate: "create",
  update: "update",
  updateMany: "updateMany",
  upsert: "upsert",
  delete: "delete",
  deleteMany: "deleteMany",
};

/** The tags and methods that carry raw SQL. */
const RAW_SQL = new Set(["$executeRaw", "$queryRaw", "$executeRawUnsafe", "$queryRawUnsafe", "sql", "raw"]);

const SKIPPED = new Set(["node_modules", "lib/platform-db/generated"]);

/** The directories the guards read: everything that runs, but the tests and `prisma/`. */
export const WRITE_SCAN_SOURCES = ["app", "components", "lib", "services", "scripts"];

/** A `data` as the guard read it: its columns and the spreads it could not open. */
export interface DataLiteral {
  at: string;
  columns: string[];
  /** The text of each spread the guard could not open (`...audit`, `...classScheduleColumns(…)`). */
  opaqueSpreads: string[];
}

/** A write the guard found: a row operation and the `data` literals it carries. */
export interface Write<M extends string> {
  file: string;
  at: string;
  model: M;
  method: WriteMethod;
  /** The write this one is nested in (`participants: { create }` inside a `class.create`), if any. */
  within: string | null;
  data: DataLiteral[];
  /** A `data` (or an upsert's `create`/`update`) that is not a literal, by text. */
  unreadable: string[];
}

export interface RawStatement {
  file: string;
  at: string;
  text: string;
}

export interface WriteScanConfig<M extends string> {
  /** The models watched, as Prisma's delegates name them (`class`, `trainingAttempt`). */
  models: readonly M[];
  /** The relations of a watched model that lead to another watched model, in a nested write. */
  nested: Record<M, Record<string, M>>;
}

/** Every `.ts`/`.tsx` under the given directories of the project, tests and generated code left out. */
export function writeScanFiles(directories: readonly string[] = WRITE_SCAN_SOURCES): string[] {
  const walk = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = join(directory, entry.name);
      if (SKIPPED.has(entry.name) || SKIPPED.has(relative(PROJECT_ROOT, path))) return [];
      if (entry.isDirectory()) return walk(path);
      return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
    });
  return directories.flatMap((directory) => walk(join(PROJECT_ROOT, directory)));
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

/** The writes and the raw statements of the given files. */
export function scanWrites<M extends string>(
  paths: readonly string[],
  config: WriteScanConfig<M>,
): { writes: Write<M>[]; raw: RawStatement[] } {
  const models = new Set<string>(config.models);

  /**
   * Reads a `data` literal of `model`: its columns (through the spreads it can
   * open) and the nested writes it carries, which go to `nested` as writes of
   * their own (`participants: { create: [...] }` inside a class is a seat being
   * created; `class: { update: {…} }` inside a seat, a class being changed).
   */
  function readData(
    source: ts.SourceFile,
    literal: ts.ObjectLiteralExpression,
    model: M,
    method: WriteMethod,
    within: string,
    nested: Write<M>[],
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
      const target = config.nested[model][name];
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
    model: M,
    method: WriteMethod,
    at: ts.Node,
    within: string | null,
  ): Write<M>[] {
    const write: Write<M> = {
      file: relative(PROJECT_ROOT, source.fileName),
      at: positionOf(source, at),
      model,
      method,
      within,
      data: [],
      unreadable: [],
    };
    if (!argument || method === "delete" || method === "deleteMany") return [write];

    const nested: Write<M>[] = [];
    const read = (value: ts.Expression) => {
      const { literals, opaque } = literalsOf(value);
      for (const literal of literals) write.data.push(readData(source, literal, model, method, write.at, nested));
      write.unreadable.push(...opaque);
    };
    const { literals, opaque } = literalsOf(argument);
    write.unreadable.push(...opaque);
    for (const literal of literals) {
      const parts = ["data", "create", "update"]
        .map((name) => propertyOf(literal, name))
        .filter((part) => part !== null);
      // A nested `create: [{ classId, … }]` holds the rows themselves.
      if (parts.length === 0) read(literal);
      for (const part of parts) read(part);
    }
    return [write, ...nested];
  }

  function scan(path: string): { writes: Write<M>[]; raw: RawStatement[] } {
    const kind = path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, kind);
    const writes: Write<M>[] = [];
    const raw: RawStatement[] = [];
    const file = relative(PROJECT_ROOT, path);

    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
        const method = node.expression.name.text;
        const owner = node.expression.expression;
        if (METHODS.has(method) && ts.isPropertyAccessExpression(owner) && models.has(owner.name.text)) {
          writes.push(...readWrite(source, node.arguments[0], owner.name.text as M, method as WriteMethod, node, null));
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

  const scanned = paths.map(scan);
  return { writes: scanned.flatMap((result) => result.writes), raw: scanned.flatMap((result) => result.raw) };
}

/** How a write is named in a guard's message. */
export function describeWrite<M extends string>(write: Write<M>): string {
  return `${write.at}: ${write.model}.${write.method}${write.within ? ` (nested in ${write.within})` : ""}`;
}
