import { extractGamePositions } from "@/lib/chess/extract-game-positions";
import { logWarning } from "@/lib/logger";
import type { Prisma, PrismaClient } from "@/lib/platform-db/generated/client";

// Mantenimiento del índice de posiciones (GamePosition). Aquí se ESCRIBE; el
// buscador que lo lee vive en services/game-explorer.
//
// El índice se genera al importar una partida y se regenera entero si su PGN
// cambia. Nadie debería escribir en GamePosition fuera de este módulo: es el
// único punto que garantiza que el hash sale de lib/chess/position-hash.
//
// El cliente de Prisma llega SIEMPRE por parámetro y este módulo no importa
// get-platform-db (que es server-only): así lo comparten las server actions,
// el seed y los scripts, que corren fuera de Next.

/**
 * Cliente de escritura: el global o el de una transacción en curso. Recibirlo
 * como parámetro es lo que permite que importar partidas e indexar sus
 * posiciones sean el mismo movimiento atómico.
 */
export type GamePositionWriter = Prisma.TransactionClient | PrismaClient;

export interface IndexGamePositionsInput {
  gameId: string;
  databaseId: string;
  pgn: string;
}

export interface IndexGamePositionsResult {
  /** Filas escritas: una por ply, incluida la posición inicial. */
  positionCount: number;
  /** Avisos del reproductor (PGN recortado por una jugada ilegal, por ejemplo). */
  warnings: string[];
}

/**
 * Deja el índice de una partida exactamente igual a su PGN.
 *
 * Borra y regenera en lugar de hacer upsert: al editar un PGN el mapeo
 * ply→posición cambia en bloque, y un upsert dejaría colgando las filas
 * posteriores al nuevo final de la partida. Como consecuencia la operación es
 * idempotente, así que sirve igual para una partida recién creada que para una
 * reindexación.
 */
export async function indexGamePositions(
  writer: GamePositionWriter,
  { gameId, databaseId, pgn }: IndexGamePositionsInput,
): Promise<IndexGamePositionsResult> {
  const { positions, warnings } = extractGamePositions(pgn);
  // Quien importa rara vez enseña estos avisos (una partida recortada por una
  // jugada ilegal sigue entrando); que al menos queden en el registro.
  if (warnings.length > 0) {
    logWarning("game-positions", "PGN indexado con avisos del reproductor", { gameId, databaseId, warnings });
  }

  await writer.gamePosition.deleteMany({ where: { gameId } });
  await writer.gamePosition.createMany({
    data: positions.map((position) => ({
      gameId,
      databaseId,
      ply: position.ply,
      positionHash: position.positionHash,
      nextMoveSan: position.nextMoveSan,
      nextMoveUci: position.nextMoveUci,
    })),
  });

  return { positionCount: positions.length, warnings };
}

/**
 * Reindexa una partida ya guardada, leyendo su PGN de la base. Para el script
 * de relleno y para cuando se edite el PGN de una partida existente.
 */
export async function reindexGame(
  db: PrismaClient,
  gameId: string,
): Promise<IndexGamePositionsResult | null> {
  const game = await db.game.findUnique({
    where: { id: gameId },
    select: { id: true, databaseId: true, pgn: true },
  });
  if (!game) return null;

  return db.$transaction((tx) =>
    indexGamePositions(tx, { gameId: game.id, databaseId: game.databaseId, pgn: game.pgn }),
  );
}
