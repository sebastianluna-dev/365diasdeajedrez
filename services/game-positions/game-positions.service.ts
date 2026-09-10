import { extractGamePositions } from "@/lib/chess/extract-game-positions";
import { logWarning } from "@/lib/logger";
import type { Prisma, PrismaClient } from "@/lib/platform-db/generated/client";

// Maintenance of the position index (GamePosition). Here it is WRITTEN; the
// search that reads it lives in services/game-explorer.
//
// The index is generated when a game is imported and regenerated whole if its
// PGN changes. Nobody should write to GamePosition outside this module: it is
// the only point that guarantees the hash comes from lib/chess/position-hash.
//
// The Prisma client ALWAYS arrives as a parameter and this module does not
// import get-platform-db (which is server-only): that way it is shared by the
// server actions, the seed and the scripts, which run outside Next.

/**
 * Write client: the global one or that of a transaction in progress. Receiving
 * it as a parameter is what lets importing games and indexing their positions
 * be the same atomic movement.
 */
export type GamePositionWriter = Prisma.TransactionClient | PrismaClient;

export interface IndexGamePositionsInput {
  gameId: string;
  databaseId: string;
  pgn: string;
}

export interface IndexGamePositionsResult {
  /** Rows written: one per ply, the initial position included. */
  positionCount: number;
  /** Warnings from the replayer (a PGN truncated by an illegal move, for instance). */
  warnings: string[];
}

/**
 * Leaves a game's index exactly equal to its PGN.
 *
 * It deletes and regenerates instead of upserting: when a PGN is edited the
 * ply→position mapping changes wholesale, and an upsert would leave dangling
 * the rows after the game's new end. As a consequence the operation is
 * idempotent, so it serves a freshly created game just as well as a reindex.
 */
export async function indexGamePositions(
  writer: GamePositionWriter,
  { gameId, databaseId, pgn }: IndexGamePositionsInput,
): Promise<IndexGamePositionsResult> {
  const { positions, warnings } = extractGamePositions(pgn);
  // Whoever imports rarely shows these warnings (a game truncated by an illegal
  // move still goes in); let them at least be in the log.
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
 * Reindexes an already stored game, reading its PGN from the database. For the
 * backfill script and for when an existing game's PGN is edited.
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
