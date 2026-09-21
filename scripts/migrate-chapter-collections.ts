import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { OWNER_TYPE } from "../constants/platform/shared-codes.const";
import { DATABASE_KIND, GAME_RESULT, GAME_SOURCE } from "../constants/platform/study-codes.const";
import { PrismaClient, type Prisma } from "../lib/platform-db/generated/client";
import { indexGamePositions } from "../services/game-positions/game-positions.service";
import { parseImportedGames } from "../services/shared/pgn-import";

// Moving course collections to PER-CHAPTER collections.
//
// The SQL migration only opens the `GameDatabase.chapterId` column. This script
// does the data movement, which does not fit in SQL because it needs to read the
// PGN headers of each lesson to create its game.
//
// It does three things:
//
//  1. Creates the collection of each chapter that is going to need one.
//  2. Moves the games from the course's OLD collection to the one of the chapter
//     they belong to: that of the lesson that already referenced them and, if no
//     lesson references them, the course's first chapter.
//  3. Creates as a game the own PGN of each lesson that references none, and
//     leaves it linked. It is what returns that content — today with nowhere to
//     be edited — to a place where it can be edited.
//
// SHORT TRANSACTIONS, one per game. It is not a style preference: in a long
// interactive transaction, this Prisma with the pg adapter starts returning
// `null` from `create` from the seventh operation on, WITHOUT throwing. Verified.
// A script that trusted the returned value would silently write rubbish, so what
// each creation returns is checked as well.
//
// It is IDEMPOTENT and resumable: each lesson is skipped if it is already
// linked, so if something fails halfway it is enough to run it again.
//
// With `--dry` it writes nothing: it walks the same and counts what it would do.
//
// It is also run after a `prisma db seed`: the seed leaves the lessons with
// their own PGN and this moves them to their chapter's collection.
//
//   npx tsx scripts/migrate-chapter-collections.ts [--dry]

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.PLATFORM_DATABASE_URL }),
});

const dryRun = process.argv.includes("--dry");
const log = (...parts: unknown[]) => console.log(dryRun ? "[simulación]" : "[migración]", ...parts);

interface ChapterRow {
  id: string;
  name: string;
  courseId: string;
  lessons: { id: string; name: string; gameId: string | null; pgn: string }[];
}

/** The chapter's collection, creating it if it has none. */
async function chapterCollection(chapter: ChapterRow): Promise<string> {
  const existing = await db.gameDatabase.findUnique({
    where: { chapterId: chapter.id },
    select: { id: true },
  });
  if (existing) return existing.id;
  if (dryRun) return `(nueva para ${chapter.id})`;

  const created = await db.gameDatabase.create({
    data: {
      ownerType: { connect: { code: OWNER_TYPE.COURSE } },
      course: { connect: { id: chapter.courseId } },
      chapter: { connect: { id: chapter.id } },
      kind: { connect: { code: DATABASE_KIND.COLLECTION } },
      name: `Partidas de ${chapter.name}`,
      description: "Las partidas que usan las lecciones de este capítulo.",
    },
    select: { id: true },
  });
  log(`  colección creada para «${chapter.name}»`);
  return created.id;
}

/** Next free order slot in a collection. */
async function nextOrder(databaseId: string): Promise<number> {
  const last = await db.game.aggregate({ where: { databaseId }, _max: { order: true } });
  return (last._max.order ?? 0) + 1;
}

/**
 * Moves a game to another database.
 *
 * `GamePosition.databaseId` is denormalised from `Game`, so moving the game
 * without updating its positions would leave the search index pointing at a
 * database that no longer contains it: it would still find it, but attributed to
 * the wrong place. The two writes go together or neither does.
 */
async function moveGame(gameId: string, databaseId: string, order: number) {
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.game.update({ where: { id: gameId }, data: { databaseId, order } });
    await tx.gamePosition.updateMany({ where: { gameId }, data: { databaseId } });
  });
}

/** Creates the lesson's PGN as a game of the chapter and links it. */
async function adoptLessonPgn(lesson: ChapterRow["lessons"][number], databaseId: string, order: number): Promise<void> {
  const [parsed] = parseImportedGames(lesson.pgn);

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const game = await tx.game.create({
      data: {
        database: { connect: { id: databaseId } },
        order,
        // The lesson's name: it is how whoever edited it recognises it.
        title: lesson.name,
        white: parsed?.white ?? "Desconocido",
        black: parsed?.black ?? "Desconocido",
        result: { connect: { code: parsed?.resultCode ?? GAME_RESULT.ONGOING } },
        event: parsed?.event ?? null,
        site: parsed?.site ?? null,
        eco: parsed?.eco ?? null,
        playedAt: parsed?.playedAt ?? null,
        initialFen: parsed?.initialFen ?? null,
        // If the lesson's PGN cannot be read it is stored as is: it is its content and
        // losing it would be worse than storing it without headers.
        pgn: parsed?.pgn ?? lesson.pgn,
        source: { connect: { code: GAME_SOURCE.MANUAL } },
      },
      select: { id: true },
    });
    // See the note above: this client can return null without throwing.
    if (!game?.id) throw new Error(`El alta de la partida de «${lesson.name}» no devolvió id`);

    await tx.lesson.update({ where: { id: lesson.id }, data: { gameId: game.id } });

    // The position index, in the same transaction as the creation: a game stored
    // without indexing is invisible to the position search and nobody finds out
    // until they look for it. It is the same thing the PGN import does.
    await indexGamePositions(tx, { gameId: game.id, databaseId, pgn: parsed?.pgn ?? lesson.pgn });
  });
}

async function main() {
  const courses = await db.course.findMany({
    select: {
      id: true,
      name: true,
      chapters: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          courseId: true,
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, name: true, gameId: true, pgn: true },
          },
        },
      },
      gameDatabases: {
        where: { chapterId: null },
        select: { id: true, name: true, games: { select: { id: true } } },
      },
    },
  });

  let moved = 0;
  let adopted = 0;

  for (const course of courses) {
    if (course.chapters.length === 0) continue;
    log(`curso «${course.name}»`);

    // Which chapter claims each game: that of the lesson that references it.
    const claimedBy = new Map<string, ChapterRow>();
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.gameId) claimedBy.set(lesson.gameId, chapter);
      }
    }

    const collections = new Map<string, string>();
    const collectionFor = async (chapter: ChapterRow) => {
      const cached = collections.get(chapter.id);
      if (cached) return cached;
      const id = await chapterCollection(chapter);
      collections.set(chapter.id, id);
      return id;
    };

    // 1 and 2. The games of the course's old collection.
    for (const old of course.gameDatabases) {
      for (const game of old.games) {
        // With no lesson claiming it, it goes to the first chapter: it is course
        // material and leaving it out of every collection would make it invisible.
        const chapter = claimedBy.get(game.id) ?? course.chapters[0];
        const databaseId = await collectionFor(chapter);
        if (!dryRun) await moveGame(game.id, databaseId, await nextOrder(databaseId));
        moved += 1;
      }

      // The old database is left empty; it is removed so as not to leave a course
      // collection without a chapter competing with each chapter's own.
      if (!dryRun) await db.gameDatabase.delete({ where: { id: old.id } });
      log(`  colección de curso «${old.name}» retirada (${old.games.length} partidas movidas)`);
    }

    // 3. Each lesson's own PGN becomes a game of its chapter.
    for (const chapter of course.chapters) {
      let pending = 0;
      for (const lesson of chapter.lessons) {
        if (lesson.gameId || lesson.pgn.trim().length === 0) continue;

        const databaseId = await collectionFor(chapter);
        if (!dryRun) await adoptLessonPgn(lesson, databaseId, await nextOrder(databaseId));
        adopted += 1;
        pending += 1;
      }
      if (pending > 0) log(`  «${chapter.name}»: ${pending} lecciones con partida propia`);
    }
  }

  log(`hecho: ${moved} partidas movidas, ${adopted} lecciones con partida propia dada de alta`);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
