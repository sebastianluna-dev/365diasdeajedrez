import { EventEmitter } from "node:events";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { describe, expect, it } from "vitest";
import { PrismaClient } from "@/lib/platform-db/generated/client";
import { isUniqueConstraintError } from "./prisma-errors";

// The two real shapes of the P2002. The driver adapter's is copied from an error
// observed against the database: it is the only one that carries the name of a
// hand-made partial index.
const driverAdapterError = {
  code: "P2002",
  meta: {
    driverAdapterError: {
      name: "DriverAdapterError",
      cause: {
        originalCode: "23505",
        kind: "UniqueConstraintViolation",
        constraint: { index: "teacher_student_one_active" },
        table: "TeacherStudent",
      },
    },
    modelName: "TeacherStudent",
  },
};

const classicError = { code: "P2002", meta: { target: ["email"] } };

/** The adapter's shape for another index, to check that a name is not found inside another one. */
function adapterErrorOn(index: string) {
  return {
    code: "P2002",
    meta: { driverAdapterError: { cause: { kind: "UniqueConstraintViolation", constraint: { index } } } },
  };
}

/**
 * What PostgreSQL's `pg` driver throws on a uniqueness violation (SQLSTATE
 * 23505). `constraint` is the index's name; `detail` names the columns, quoted
 * when their name has capitals, which is how PostgreSQL writes them.
 */
interface PgUniqueViolation {
  constraint?: string;
  detail: string;
  table: string;
}

/**
 * The P2002 the app would really receive: a `PrismaClient` of the generated
 * schema over the same `PrismaPg` adapter as `getPlatformDb()`, with a `pg`
 * client that never opens a socket and fails every query with `violation`.
 * The query compiler, the adapter's translation of the driver error and the
 * runtime's translation into a `PrismaClientKnownRequestError` are the
 * installed ones, so an upgrade that moves the index's name fails here and not
 * in a 500 nobody explains.
 */
async function uniqueViolationThroughTheAdapter(violation: PgUniqueViolation): Promise<unknown> {
  class FailingPgClient extends EventEmitter {
    // What `pg-pool` reads before it lends a client again.
    readonly _queryable = true;
    readonly _ending = false;

    connect(done: (error?: Error) => void) {
      setImmediate(() => done());
    }

    query(_query: unknown, _values: unknown, done: (error: Error) => void) {
      const error = Object.assign(new Error(`duplicate key value violates unique constraint`), {
        code: "23505",
        severity: "ERROR",
        schema: "public",
        ...violation,
      });
      setImmediate(() => done(error));
    }

    end(done?: () => void) {
      done?.();
    }
  }

  const poolConfig = { Client: FailingPgClient } as unknown as ConstructorParameters<typeof PrismaPg>[0];
  const db = new PrismaClient({ adapter: new PrismaPg(poolConfig) });
  try {
    await db.user.create({ data: { email: "alumno@example.com", displayName: "Alumno", slug: "alumno" } });
  } catch (error) {
    return error;
  } finally {
    await db.$disconnect();
  }
  throw new Error("The create did not fail: the fake pg client was not used.");
}

describe("isUniqueConstraintError", () => {
  it("reconoce el índice por el camino del driver adapter", () => {
    expect(isUniqueConstraintError(driverAdapterError, "teacher_student_one_active")).toBe(true);
  });

  it("reconoce las columnas por el camino clásico", () => {
    expect(isUniqueConstraintError(classicError, "email")).toBe(true);
  });

  it("reconoce el índice cuando el camino clásico lo da como texto", () => {
    expect(isUniqueConstraintError({ code: "P2002", meta: { target: "User_email_key" } }, "User_email_key")).toBe(true);
  });

  it("acepta varias grafías del mismo conflicto", () => {
    expect(isUniqueConstraintError(driverAdapterError, "studentId", "teacher_student_one_active")).toBe(true);
  });

  it("lee los nombres sin distinguir mayúsculas de minúsculas", () => {
    expect(isUniqueConstraintError(adapterErrorOn("Course_slug_key"), "course_slug_key")).toBe(true);
  });

  it("no confunde conflictos distintos", () => {
    expect(isUniqueConstraintError(driverAdapterError, "email")).toBe(false);
    expect(isUniqueConstraintError(classicError, "teacher_student_one_active")).toBe(false);
  });

  it("no encuentra un nombre dentro de otro: el slug de un autor no es el de un curso", () => {
    expect(isUniqueConstraintError(adapterErrorOn("Author_slug_key"), "Course_slug_key", "slug")).toBe(false);
    expect(isUniqueConstraintError(adapterErrorOn("User_backupEmail_key"), "User_email_key", "email")).toBe(false);
    expect(isUniqueConstraintError({ code: "P2002", meta: { target: ["backupEmail"] } }, "email")).toBe(false);
  });

  it("ignora lo que no sea un P2002", () => {
    expect(isUniqueConstraintError({ code: "P2025" }, "email")).toBe(false);
    expect(isUniqueConstraintError(new Error("boom"), "email")).toBe(false);
    expect(isUniqueConstraintError(null, "email")).toBe(false);
    expect(isUniqueConstraintError(undefined, "email")).toBe(false);
  });

  describe("con el error que de verdad lanzan Prisma y el adapter de pg instalados", () => {
    it("lee el nombre del índice, que es lo que PostgreSQL manda", async () => {
      const error = await uniqueViolationThroughTheAdapter({
        constraint: "User_email_key",
        detail: "Key (email)=(alumno@example.com) already exists.",
        table: "User",
      });

      expect(error).toMatchObject({ code: "P2002" });
      expect(isUniqueConstraintError(error, "User_email_key", "email")).toBe(true);
      expect(isUniqueConstraintError(error, "Course_slug_key", "slug")).toBe(false);
    });

    it("sin nombre de índice, lee las columnas del detalle aunque PostgreSQL las entrecomille", async () => {
      const error = await uniqueViolationThroughTheAdapter({
        detail: 'Key ("courseId", "roleId")=(curso-1, 1) already exists.',
        table: "Chapter",
      });

      expect(error).toMatchObject({ code: "P2002" });
      expect(isUniqueConstraintError(error, "Chapter_courseId_roleId_key", "roleId")).toBe(true);
      expect(isUniqueConstraintError(error, "Course_slug_key", "slug")).toBe(false);
    });
  });
});

// The helper only helps where it is used. A `catch` written by hand against
// `meta.target` — the usual pattern, and the one the examples carry — does not
// see the adapter's conflict and lets a 500 out, so nobody compares a code with
// "P2002" or reads `meta.target` outside the helper.

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SOURCES = ["app", "components", "lib", "services", "scripts", "prisma"];
const SKIPPED_DIRECTORIES = new Set(["generated", "node_modules", "migrations"]);
const HELPER = "services/shared/prisma-errors";

const HAND_WRITTEN_P2002 = /["'`]P2002["'`]|\bmeta\??\.target\b/;

function sourceFilesOf(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return SKIPPED_DIRECTORIES.has(entry.name) ? [] : sourceFilesOf(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

describe("los P2002 se reconocen con isUniqueConstraintError", () => {
  it("ningún archivo fuera del helper compara con P2002 ni lee meta.target", () => {
    const offenders = SOURCES.flatMap((directory) => sourceFilesOf(join(ROOT, directory)))
      .map((path) => relative(ROOT, path))
      .filter((path) => !path.startsWith(HELPER))
      .filter((path) => HAND_WRITTEN_P2002.test(readFileSync(join(ROOT, path), "utf8")));

    expect(offenders).toEqual([]);
  });
});
