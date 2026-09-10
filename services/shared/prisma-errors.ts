// Identifying specific uniqueness violations.
//
// Prisma reports the P2002 in two ways depending on where it comes from: with
// the classic engine it fills `meta.target` with the columns, and with the
// PostgreSQL driver adapter (the one this platform uses) the useful information
// travels in `meta.driverAdapterError.cause.constraint.index` with the real name
// of the index. Verified against the database: a hand-made partial index only
// appears through the second route.
//
// Both are looked at, and always against a SPECIFIC name: swallowing any P2002
// would hide different conflicts under a message that does not belong to them.

interface PrismaUniqueError {
  code?: string;
  meta?: {
    target?: unknown;
    driverAdapterError?: { cause?: { constraint?: { index?: unknown; fields?: unknown } } };
  };
}

/** Constraint/column names the error mentions, in lower case. */
function conflictTokens(error: unknown): string[] {
  if (typeof error !== "object" || error === null) return [];
  const candidate = error as PrismaUniqueError;
  if (candidate.code !== "P2002") return [];

  const tokens: string[] = [];

  const target = candidate.meta?.target;
  if (Array.isArray(target)) tokens.push(...target.map(String));
  else if (target !== undefined && target !== null) tokens.push(String(target));

  const constraint = candidate.meta?.driverAdapterError?.cause?.constraint;
  if (constraint?.index !== undefined && constraint.index !== null) tokens.push(String(constraint.index));
  if (Array.isArray(constraint?.fields)) tokens.push(...constraint.fields.map(String));

  return tokens.map((token) => token.toLowerCase());
}

/**
 * true when the error is a P2002 of that index or column. `names` admits several
 * spellings of the same conflict (the index's name and the column involved).
 */
export function isUniqueConstraintError(error: unknown, ...names: string[]): boolean {
  const tokens = conflictTokens(error);
  if (tokens.length === 0) return false;
  return names.some((name) => tokens.some((token) => token.includes(name.toLowerCase())));
}
