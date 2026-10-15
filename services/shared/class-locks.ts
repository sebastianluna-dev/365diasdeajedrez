// The row locks every writer of a class takes first: all the `Class` rows a
// transaction touches, at once and by id, so two writes that race are
// serialised and no two transactions can wait on each other. In a module of
// its own because both the seat writers (the staff's) and the attendance
// writer (the teacher's too) lock the class, and the teacher's side must not
// reach the seat writers (class-roles.test.ts).

/** The minimum of Prisma a lock needs. */
export interface ClassLocker {
  $queryRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
}

/**
 * Locks the given classes, all at once and by id. Locking a row this
 * transaction already holds is a no-op, so a writer may lock again what its
 * caller locked.
 */
export async function lockClasses(db: ClassLocker, classIds: string[]): Promise<void> {
  const ids = [...new Set(classIds)].sort();
  if (ids.length === 0) return;
  await db.$queryRaw`SELECT "id" FROM "Class" WHERE "id" = ANY(${ids}) ORDER BY "id" FOR UPDATE`;
}
