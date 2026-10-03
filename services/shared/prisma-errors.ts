// Identifying specific uniqueness violations.
//
// Prisma reports the P2002 in two ways depending on where it comes from: with
// the classic engine it fills `meta.target` with the columns (or, on some
// databases, the index's name as a string), and with the PostgreSQL driver
// adapter (the one this platform uses) `meta.target` is not there and the
// useful information travels in `meta.driverAdapterError.cause.constraint`:
// `{ index }` with the real name of the index, which PostgreSQL always sends
// for a unique violation, or `{ fields }` with the columns the adapter read
// off the error's detail when it does not. Verified against the database: a
// hand-made partial index only appears through the adapter's route. The
// adapter's shape is also held by the test, which builds the error with the
// installed Prisma and `@prisma/adapter-pg`, so an upgrade that moves it fails
// there.
//
// All three are read, and always against a SPECIFIC name: swallowing any P2002
// would hide different conflicts under a message that does not belong to them.
// That is also why a name has to BE one of the error's names, not appear inside
// one: "slug" is the column of `Course_slug_key` and of `Author_slug_key`, and
// the course form must not answer for the author's conflict.

interface PrismaUniqueError {
  code?: string;
  meta?: {
    target?: unknown;
    driverAdapterError?: { cause?: { constraint?: { index?: unknown; fields?: unknown } } };
  };
}

/**
 * A name as the error spells it, made comparable: PostgreSQL quotes a column
 * whose name has capitals (`"courseId"`) in the detail the adapter reads the
 * columns from, and the comparison does not care about case.
 */
function normalized(name: unknown): string {
  return String(name)
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .toLowerCase();
}

/** One value or a list of them, as the names it carries. */
function namesIn(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(normalized);
  if (value === undefined || value === null) return [];
  return [normalized(value)];
}

/** Every index and column name the error mentions, normalised; empty when it is not a P2002. */
function conflictNames(error: unknown): string[] {
  if (typeof error !== "object" || error === null) return [];
  const candidate = error as PrismaUniqueError;
  if (candidate.code !== "P2002") return [];

  const constraint = candidate.meta?.driverAdapterError?.cause?.constraint;
  return [...namesIn(candidate.meta?.target), ...namesIn(constraint?.index), ...namesIn(constraint?.fields)];
}

/**
 * true when the error is a P2002 of that index or column. `names` admits several
 * spellings of the same conflict (the index's name, which is what the adapter
 * reports, and the column involved, which is what the classic engine does).
 * Case does not matter; the whole name does.
 */
export function isUniqueConstraintError(error: unknown, ...names: string[]): boolean {
  const conflict = new Set(conflictNames(error));
  if (conflict.size === 0) return false;
  return names.some((name) => conflict.has(normalized(name)));
}
