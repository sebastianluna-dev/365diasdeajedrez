// The seed's decisions, apart from `prisma/seed.ts` so they can be tested:
// importing the seed runs it against the database `.env.local` points at,
// and these need neither a database nor the environment. The seed reads
// `SEED_NOW` and the clock, and queries the database, and hands what it got to
// these functions.

import { planMoves, type OrderUpdate, type ReorderRow } from "../services/shared/reorder";

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

/**
 * The order moves that let the seed write one parent's children (a course's
 * chapters, a chapter's lessons, a lesson's exercises —
 * `Exercise_lessonId_lessonOrder_key`, over `lessonOrder` —, a class's blocks)
 * with the order its data gives them.
 *
 * Each of those lists is unique by `[parent, order]`, and the seed upserts
 * every row by id with its seeded order. Once the staff has reordered a seeded
 * course from the panel, swapped two of its exercises, or deleted a chapter of
 * a draft and let the others move up, the first upsert finds its order held by
 * a sibling and the seed stops halfway with P2002, as it did with the
 * collections. These moves go first and clear the way:
 *
 * - every row the seed owns that is not at its seeded order takes it through a
 *   temporary of its own, as the panel's `planFullReorder` does (both go
 *   through `planMoves`); a row still to be created finds its order free;
 * - a row the seed does not own keeps its order unless the seed needs it. When
 *   one is in the way, it and every row the seed does not own after it go
 *   right after the seeded rows, in the order they were in: kept, never
 *   deleted, never ahead of a seeded row. Below the first one in the way
 *   nothing moves, so a row at an order the seed never uses (the line
 *   trainer's derived drill at 0, where `syncLessonTrainingExercise` writes
 *   it again on every save) stays where it is.
 *
 * A second seed finds every row in its place and moves nothing, and a parent
 * the seed writes no row into is never touched.
 *
 * `current` is what the parent holds, read right before its children are
 * written; `seeded`, the rows the seed is about to upsert into it. Data that
 * gives two of them the same order, or a negative one, is refused here: the
 * index would refuse it too, only halfway through the seed.
 */
export function planSeededOrders(current: readonly ReorderRow[], seeded: readonly ReorderRow[]): OrderUpdate[] {
  const seededOrderOf = new Map<string, number>();
  const seededIdAt = new Map<number, string>();
  for (const row of seeded) {
    const other = seededIdAt.get(row.order);
    if (other !== undefined) {
      throw new Error(`El seed da el orden ${row.order} a dos filas del mismo padre: ${other} y ${row.id}.`);
    }
    if (row.order < 0) {
      throw new Error(`El seed da a ${row.id} el orden ${row.order}: los negativos son los temporales.`);
    }
    seededIdAt.set(row.order, row.id);
    seededOrderOf.set(row.id, row.order);
  }

  const targets = new Map<string, number>();
  for (const row of current) {
    const order = seededOrderOf.get(row.id);
    if (order !== undefined) targets.set(row.id, order);
  }

  const notOwned = current.filter((row) => !seededOrderOf.has(row.id)).sort((left, right) => left.order - right.order);
  const firstInTheWay = notOwned.find((row) => seededIdAt.has(row.order));
  if (firstInTheWay) {
    const lastSeeded = Math.max(...seededIdAt.keys());
    notOwned
      .filter((row) => row.order >= firstInTheWay.order)
      .forEach((row, index) => targets.set(row.id, lastSeeded + 1 + index));
  }

  return planMoves(current, targets);
}
