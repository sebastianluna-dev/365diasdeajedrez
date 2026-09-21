// Backfill of the position index for the games already stored.
//
// Normal indexing happens on import (services/studies) and on seeding, so this
// script is for two cases: the games that existed before the index existed, and
// a forced reindex after changing the FEN normalisation or the hash algorithm.
//
//   npm run positions:index          only the unindexed games
//   npm run positions:index -- --all reindexes ALL of them (deletes and regenerates)

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/platform-db/generated/client";
import { indexGamePositions } from "../services/game-positions/game-positions.service";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/// Batches: a large database does not fit in memory at once.
const BATCH_SIZE = 200;

async function main(): Promise<void> {
  const reindexAll = process.argv.slice(2).includes("--all");

  const where = reindexAll ? {} : { positions: { none: {} } };
  const total = await db.game.count({ where });
  if (total === 0) {
    console.log(reindexAll ? "No hay partidas que indexar." : "Todas las partidas están ya indexadas.");
    return;
  }

  console.log(`${total} partida(s) por indexar${reindexAll ? " (reindexado completo)" : ""}…`);

  let indexed = 0;
  let positions = 0;
  const failures: string[] = [];
  const truncated: string[] = [];

  // Cursor pagination and not skip: with --all the `where` does not change as it
  // advances, so an offset would skip games.
  let cursor: string | undefined;
  for (;;) {
    const batch = await db.game.findMany({
      where,
      select: { id: true, databaseId: true, pgn: true, white: true, black: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const last = batch[batch.length - 1];
    if (!last) break;
    cursor = last.id;

    for (const game of batch) {
      const label = `${game.white}-${game.black} (${game.id})`;
      // One corrupt game cannot bring down the whole backfill: it is noted and the
      // run goes on, and at the end all of them are reported.
      try {
        const result = await db.$transaction((tx) =>
          indexGamePositions(tx, { gameId: game.id, databaseId: game.databaseId, pgn: game.pgn }),
        );
        indexed += 1;
        positions += result.positionCount;
        if (result.warnings.length > 0) truncated.push(`${label}: ${result.warnings[0]}`);
      } catch (error) {
        failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`  ${indexed}/${total}`);

    // Without --all the indexed games stop matching the `where`, so the cursor
    // alone is no longer enough to know it has finished: it finishes when the batch
    // comes back short.
    if (batch.length < BATCH_SIZE) break;
  }

  console.log(`✔ ${indexed} partida(s) indexada(s), ${positions} posiciones.`);

  if (truncated.length > 0) {
    console.log(`\n${truncated.length} partida(s) con PGN recortado (se indexó lo reproducible):`);
    for (const warning of truncated) console.log(`  · ${warning}`);
  }
  if (failures.length > 0) {
    console.error(`\n✖ ${failures.length} partida(s) fallaron:`);
    for (const failure of failures) console.error(`  · ${failure}`);
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
