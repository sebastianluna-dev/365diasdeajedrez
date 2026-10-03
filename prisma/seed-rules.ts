// The seed's decisions, apart from `prisma/seed.ts` so they can be tested:
// importing the seed runs it against the database `.env.local` points at,
// and these need neither a database nor the environment. The seed reads
// `SEED_NOW` and the clock, and queries the database, and hands what it got to
// these functions.

/** The hour (UTC) of the reference instant: class times come out of it, and at 00:00 the demo reads like a mistake. */
const REFERENCE_HOUR_UTC = 18;

/**
 * The instant ALL the seed's dates hang from.
 *
 * It is not the clock itself for two reasons that pull in different
 * directions:
 *
 * - Two consecutive runs wrote different values even when nothing had changed
 *   (`frozenAt`, `pgnUpdatedAt`, the activity…), so the seed was idempotent in
 *   content but not in rows. Rounded to the day, two passes on the same day
 *   write exactly the same thing.
 * - And at the same time the dates have to follow the calendar: with a fixed
 *   constant, the demo's activity and its "next class" are born in the past.
 *
 * `pinned` is `SEED_NOW` (ISO), which fixes the instant by hand: to reproduce a
 * database byte for byte, for a test or a screenshot, or to anchor a demo on
 * the day it will be shown.
 */
export function seedReferenceDate(pinned: string | undefined, today: Date): Date {
  if (pinned) {
    const fixed = new Date(pinned);
    if (Number.isNaN(fixed.getTime())) throw new Error(`SEED_NOW no es una fecha válida: "${pinned}".`);
    return fixed;
  }

  const reference = new Date(today.getTime());
  reference.setUTCHours(REFERENCE_HOUR_UTC, 0, 0, 0);
  return reference;
}

/**
 * When the seeded demo's next class starts: the earliest class after `now`, or
 * null when none is left.
 *
 * Every seed date is counted from the reference instant, which is what a live
 * demo wants, and a seed is a snapshot: a database seeded weeks ago has every
 * class behind it, and the student's «Próxima clase» is empty. No date can
 * stay ahead of a clock that keeps moving, so the seed says until when its
 * demo holds instead of letting the presenter find out.
 */
export function nextClassAfter(classes: readonly { scheduledAt: Date }[], now: Date): Date | null {
  const ahead = classes.map((cls) => cls.scheduledAt).filter((scheduledAt) => scheduledAt.getTime() > now.getTime());
  if (ahead.length === 0) return null;
  return new Date(Math.min(...ahead.map((scheduledAt) => scheduledAt.getTime())));
}

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
