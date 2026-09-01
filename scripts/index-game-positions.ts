// Relleno del índice de posiciones de las partidas ya guardadas.
//
// El indexado normal ocurre al importar (services/studies) y al sembrar, así
// que este script es para dos casos: las partidas que existían antes de que el
// índice existiera, y una reindexación forzada tras cambiar la normalización
// del FEN o el algoritmo de hash.
//
//   npm run positions:index          sólo las partidas sin indexar
//   npm run positions:index -- --all reindexa TODAS (borra y regenera)

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/platform-db/generated/client";
import { indexGamePositions } from "../services/game-positions/game-positions.service";

const connectionString = process.env.PLATFORM_DATABASE_URL;
if (!connectionString) throw new Error("Falta PLATFORM_DATABASE_URL en el entorno (ver .env.example).");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/// Lotes: una base grande no cabe en memoria de una vez.
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

  // Paginación por cursor y no por skip: con --all el `where` no cambia al
  // avanzar, así que un offset se saltaría partidas.
  let cursor: string | undefined;
  for (;;) {
    const batch = await db.game.findMany({
      where,
      select: { id: true, databaseId: true, pgn: true, white: true, black: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    if (batch.length === 0) break;
    cursor = batch[batch.length - 1].id;

    for (const game of batch) {
      const label = `${game.white}-${game.black} (${game.id})`;
      // Una partida corrupta no puede tumbar el relleno entero: se anota y se
      // sigue, y al final se informa de todas.
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

    // Sin --all las partidas indexadas dejan de cumplir el `where`, así que el
    // cursor por sí solo ya no basta para saber que se acabó: se acaba cuando
    // el lote viene corto.
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
