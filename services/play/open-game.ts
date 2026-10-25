import "server-only";
import { TIME_CONTROL } from "@/constants/platform/play-codes.const";
import { closedEnd } from "@/lib/chess/game-end";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { writePlayedGameRecord } from "@/services/shared/played-game-record";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { openAgainstBotWhere, seatOf } from "./play-rules";

// Opening a game against a bot, for the one action that starts one,
// `startAdventureEncounter` (services/adventure): since 2026-10-25 every game
// against a bot is an encounter of an adventure. A `"use server"` module can
// only export actions, so the helper lives here, beside the rules it reads. It writes only through
// `writePlayedGameRecord`, and nothing here touches the activity log: playing
// never counts toward the streak (no-activity.test.ts).

/** Moves the person has played in a game: a person counts their own, not the plies. */
function ownMoves(plyCount: number, seat: "white" | "black"): number {
  return seat === "white" ? Math.ceil(plyCount / 2) : Math.floor(plyCount / 2);
}

/**
 * Opens a game against `botId` for `userId` in `color`. With `replace`, the
 * open game against a bot is closed first in the same transaction — lost as
 * abandoned after two moves of one's own, aborted before them — never
 * deleted. Without it, the open game wins: its id is returned instead.
 */
export async function openGame(
  userId: string,
  userName: string,
  bot: { id: number; name: string; elo: number },
  color: "white" | "black",
  replace: boolean,
): Promise<string> {
  const db = getPlatformDb();
  const at = new Date();
  try {
    return await db.$transaction(async (tx) => {
      const open = await tx.playedGame.findFirst({
        where: openAgainstBotWhere(userId),
        select: { id: true, plyCount: true, whiteUserId: true, blackUserId: true },
      });
      if (open && !replace) return open.id;
      if (open) {
        const seat = seatOf(open, userId)!;
        const end = ownMoves(open.plyCount, seat) >= 2 ? closedEnd("abandoned", seat) : closedEnd("aborted", null);
        await writePlayedGameRecord(tx, { kind: "close", gameId: open.id, expectedPly: open.plyCount, end, at });
      }
      const created = await writePlayedGameRecord(tx, {
        kind: "create",
        data: {
          ...(color === "white"
            ? {
                whiteUserId: userId,
                blackBotId: bot.id,
                whiteName: userName,
                blackName: bot.name,
                whiteElo: null,
                blackElo: bot.elo,
              }
            : {
                whiteBotId: bot.id,
                blackUserId: userId,
                whiteName: bot.name,
                blackName: userName,
                whiteElo: bot.elo,
                blackElo: null,
              }),
          timeControlCode: TIME_CONTROL.NONE,
          initialFen: null,
          at,
        },
      });
      return created.id;
    });
  } catch (error) {
    // Two tabs pressing «Jugar» at once: the second collides with the first's open game and goes to it.
    if (!isUniqueConstraintError(error, "played_game_white_user_open_vs_bot", "played_game_black_user_open_vs_bot"))
      throw error;
    const open = await db.playedGame.findFirst({ where: openAgainstBotWhere(userId), select: { id: true } });
    if (!open) throw error;
    return open.id;
  }
}
