// The seed's decisions, apart from `prisma/seed.ts` so they can be tested:
// importing the seed runs it against the database `.env.local` points at,
// and these need neither a database nor the environment. The seed queries the
// database and hands what it got to these functions.

/** What the seed knows of a collection to tell whether the app may have created it already. */
export interface SeedCollection {
  id: string;
  userId: string | null;
  chapterId: string | null;
  isDefault: boolean;
}

/**
 * The natural key a collection can already exist under, created by the app
 * with an id of its own: a chapter's collection is unique by its chapter
 * (`@@unique([chapterId])`, created by `importChapterGames` or by
 * `collections:by-chapter`), and a user's default study by its owner
 * (`game_database_one_default_per_user`, created with the account).
 */
export type CollectionKey = { chapterId: string } | { userId: string; isDefault: true };

/** The natural key of a seeded collection, or null when only the seed creates it, under its own id. */
export function collectionKeyOf(collection: SeedCollection): CollectionKey | null {
  if (collection.chapterId) return { chapterId: collection.chapterId };
  if (collection.isDefault && collection.userId) return { userId: collection.userId, isDefault: true };
  return null;
}

/**
 * The id each seeded collection really has in the database: the row already
 * there under its natural key when there is one, the seed's own id otherwise.
 *
 * Upserting by the seed's id alone inserted a second row next to the one the
 * app had created, which broke the unique index and stopped the seed halfway
 * (2026-09-27: the Sicilian chapter's collection, created on demand as
 * `g0kPl7nN`). With this the seed writes onto the existing row, and the games,
 * the shares and the position index that point at the collection are
 * translated to its real id. A second seed finds the same rows and lands on
 * them again.
 *
 * `findByKey` is the query (`gameDatabase.findFirst({ where: key })`), passed
 * in so this runs without a database.
 */
export async function resolveCollectionIds(
  collections: readonly SeedCollection[],
  findByKey: (key: CollectionKey) => Promise<{ id: string } | null>,
): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const collection of collections) {
    const key = collectionKeyOf(collection);
    const existing = key ? await findByKey(key) : null;
    ids.set(collection.id, existing?.id ?? collection.id);
  }
  return ids;
}
