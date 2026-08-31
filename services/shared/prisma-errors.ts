// Identificación de violaciones de unicidad concretas.
//
// Prisma reporta el P2002 de dos formas según por dónde venga: con el motor
// clásico llena `meta.target` con las columnas, y con el driver adapter de
// PostgreSQL (el que usa esta plataforma) la información útil viaja en
// `meta.driverAdapterError.cause.constraint.index` con el nombre real del
// índice. Comprobado en la base: un índice parcial hecho a mano sólo aparece
// por el segundo camino.
//
// Se miran los dos, y siempre contra un nombre CONCRETO: tragarse cualquier
// P2002 escondería conflictos distintos bajo un mensaje que no les corresponde.

interface PrismaUniqueError {
  code?: string;
  meta?: {
    target?: unknown;
    driverAdapterError?: { cause?: { constraint?: { index?: unknown; fields?: unknown } } };
  };
}

/** Nombres de constraint/columna que menciona el error, en minúsculas. */
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
 * true si el error es un P2002 de ese índice o columna. `names` admite varias
 * grafías del mismo conflicto (nombre del índice y columna implicada).
 */
export function isUniqueConstraintError(error: unknown, ...names: string[]): boolean {
  const tokens = conflictTokens(error);
  if (tokens.length === 0) return false;
  return names.some((name) => tokens.some((token) => token.includes(name.toLowerCase())));
}
