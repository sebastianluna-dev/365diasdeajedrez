// Replaces the whole set of a (parent, catalog) join table.
//
// A checkbox group sends the complete new set, so the old rows go and the new
// ones come in one step: there is no diff to compute. It receives the two
// delegates as parameters so it runs inside the caller's transaction, like
// `syncLessonTrainingExercise`, and the parent's write and its joins either
// both land or neither does.

/**
 * The minimum of Prisma the sync needs, so it also accepts a transaction's
 * delegates. The arguments are `unknown` because Prisma's generated methods
 * are generic over them and would not fit a narrower signature.
 */
export interface JoinWriter {
  deleteMany(args: unknown): Promise<unknown>;
  createMany(args: unknown): Promise<unknown>;
}

export interface CatalogReader {
  findMany(args: unknown): Promise<{ id: number; code: string }[]>;
}

export interface SyncCatalogJoinInput {
  /** Column and value of the owning side: `{ courseId }`, `{ entityId }`. */
  parent: Record<string, string>;
  /** The join's column that points at the catalog: "levelId", "contentTypeId", "kindId". */
  catalogColumn: string;
  /** The complete new set, as catalog codes. Duplicates collapse; unknown codes are skipped. */
  codes: string[];
}

/** Rewrites the join rows of `parent` to exactly `codes`. Returns how many rows were written. */
export async function syncCatalogJoin(
  join: JoinWriter,
  catalog: CatalogReader,
  { parent, catalogColumn, codes }: SyncCatalogJoinInput,
): Promise<number> {
  const wanted = [...new Set(codes)];
  const rows =
    wanted.length > 0
      ? await catalog.findMany({ where: { code: { in: wanted } }, select: { id: true, code: true } })
      : [];

  await join.deleteMany({ where: parent });
  if (rows.length > 0) {
    await join.createMany({ data: rows.map((row) => ({ ...parent, [catalogColumn]: row.id })) });
  }
  return rows.length;
}
