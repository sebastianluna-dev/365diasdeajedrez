"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { TIME_CONTROL } from "@/constants/platform/play-codes.const";
import { GAME_SOURCE, type GameResultCode } from "@/constants/platform/study-codes.const";
import { closedEnd, gameEnd, resignationEnd } from "@/lib/chess/game-end";
import { extractMainline } from "@/lib/chess/mainline";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { indexGamePositions } from "@/services/game-positions/game-positions.service";
import { formCheckbox, formCode, formOptionalText, formText, parseForm } from "@/services/shared/form-schema";
import type { AutosaveResult } from "@/services/shared/game-record";
import { writePlayedGameRecord } from "@/services/shared/played-game-record";
import { isUniqueConstraintError } from "@/services/shared/prisma-errors";
import { withErrorParam } from "@/services/shared/safe-return-to";
import { checkAppend } from "./append-rules";
import { gameEndOfCodes } from "./play.mapper";
import { currentViewer } from "./play.service";
import { playedGameVisibleWhere, seatOf } from "./play-rules";
import type { AppendMoveResult } from "./play.types";

// What a person does with a game against a bot. Each action resolves the user
// in the DAL, checks the switch and its rate, validates with zod, keeps the
// ownership INSIDE its `where`, and writes only through
// `writePlayedGameRecord` (services/shared/played-game-record.ts), in a
// transaction. Nothing here writes to the activity log: playing never counts toward
// the streak (no-activity.test.ts).
//
// What the server cannot check is that the bot's move came from Stockfish at
// the bot's strength: both moves of a game against a bot leave the same
// browser, so the server demands legality and turn, not authorship. The
// scoreboard is therefore a record, never a rating (isRated is false, by a
// CHECK).

const START_SCHEMA = z.object({
  bot: formText(60),
  color: formCode(["white", "black", "random"]),
  /** Close the open game against a bot (abandoned, or aborted) and start this one. */
  replace: formCheckbox(),
});

const MOVE_SCHEMA = z.object({
  gameId: z.string().min(1).max(20),
  expectedPly: z.number().int().min(0).max(1000),
  san: z.string().min(1).max(10),
});

const ABANDON_SCHEMA = z.object({
  gameId: z.string().min(1).max(20),
  expectedPly: z.number().int().min(0).max(1000),
});

const COPY_SCHEMA = z.object({
  study: formText(20),
  title: formOptionalText(120),
});

/** The open game of `userId` against a bot, in either colour. */
const openAgainstBotWhere = (userId: string): Prisma.PlayedGameWhereInput => ({
  finishedAt: null,
  OR: [
    { whiteUserId: userId, blackBotId: { not: null } },
    { blackUserId: userId, whiteBotId: { not: null } },
  ],
});

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
async function openGame(
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

/** «Jugar» against a bot, from its sheet: the bot, the colour, and whether to replace the open game. */
export async function startPlayedGame(formData: FormData): Promise<void> {
  if (!PLAY_ENABLED) notFound();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:play-start`, 20, 60_000)))
    redirect(withErrorParam(platformRoutes.play, "throttled"));

  const form = parseForm(START_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(platformRoutes.play, "invalid"));
  const bot = await getPlatformDb().bot.findFirst({
    where: { slug: form.data.bot, isActive: true },
    select: { id: true, name: true, elo: true },
  });
  if (!bot) redirect(withErrorParam(platformRoutes.play, "botNotFound"));

  const color = form.data.color === "random" ? (randomInt(2) === 0 ? "white" : "black") : form.data.color;
  const gameId = await openGame(user.id, user.displayName, bot, color, form.data.replace);

  revalidatePath(platformRoutes.play);
  redirect(platformRoutes.playedGame(gameId));
}

/** «Revancha»: the same bot with the colours swapped. The game it comes from is already over. */
export async function rematchPlayedGame(gameId: string): Promise<void> {
  if (!PLAY_ENABLED) notFound();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:play-start`, 20, 60_000)))
    redirect(withErrorParam(platformRoutes.playedGame(gameId), "throttled"));

  const db = getPlatformDb();
  const previous = await db.playedGame.findFirst({
    where: { id: gameId, OR: [{ whiteUserId: user.id }, { blackUserId: user.id }] },
    select: {
      whiteUserId: true,
      blackUserId: true,
      whiteBot: { select: { id: true, name: true, elo: true, isActive: true } },
      blackBot: { select: { id: true, name: true, elo: true, isActive: true } },
    },
  });
  const bot = previous?.whiteBot ?? previous?.blackBot;
  if (!previous || !bot?.isActive) redirect(withErrorParam(platformRoutes.play, "botNotFound"));

  const color = seatOf(previous, user.id) === "white" ? "black" : "white";
  const next = await openGame(user.id, user.displayName, bot, color, true);

  revalidatePath(platformRoutes.play);
  redirect(platformRoutes.playedGame(next));
}

/**
 * THE door of every move — the person's and the bot's alike, and tomorrow an
 * opponent's —, one ply at a time with the ply the caller saw as its version.
 * A retry of the move already stored answers as if it were written; another
 * tab's move makes the caller stale; an illegal move is refused.
 */
export async function appendPlayedMove(
  gameId: string,
  input: { expectedPly: number; san: string },
): Promise<AppendMoveResult> {
  if (!PLAY_ENABLED) return { ok: false, reason: "disabled" };
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:played-move`, 240, 60_000))) return { ok: false, reason: "throttled" };

  const parsed = MOVE_SCHEMA.safeParse({ gameId, ...input });
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const db = getPlatformDb();
  const row = await db.playedGame.findFirst({
    where: { id: parsed.data.gameId, OR: [{ whiteUserId: user.id }, { blackUserId: user.id }] },
    select: {
      initialFen: true,
      pgn: true,
      plyCount: true,
      finishedAt: true,
      result: { select: { code: true } },
      termination: { select: { code: true } },
    },
  });
  if (!row) return { ok: false, reason: "denied" };

  const sans = extractMainline(row.pgn)?.sans ?? [];
  const check = checkAppend(
    { initialFen: row.initialFen, sans, plyCount: row.plyCount, finishedAt: row.finishedAt },
    parsed.data,
  );
  if (check.kind === "retry") {
    return {
      ok: true,
      plyCount: row.plyCount,
      end: gameEndOfCodes(row.result.code as GameResultCode, row.termination?.code ?? null),
    };
  }
  if (check.kind !== "ok") return { ok: false, reason: check.kind };

  // The server's reading of the board is the truth, whatever the browser concluded.
  const end = gameEnd(row.initialFen, check.sans);
  const { written } = await db.$transaction((tx) =>
    writePlayedGameRecord(tx, {
      kind: "ply",
      gameId: parsed.data.gameId,
      expectedPly: parsed.data.expectedPly,
      san: check.san,
      end,
      at: new Date(),
    }),
  );
  if (!written) return { ok: false, reason: "stale" };

  if (end) revalidatePath(platformRoutes.profile, "layout");
  return { ok: true, plyCount: parsed.data.expectedPly + 1, end };
}

/**
 * «Abandonar»: the game is lost by whoever presses it. Versioned like a move,
 * so a stale tab cannot close a game that has moved on.
 */
export async function abandonPlayedGame(gameId: string, input: { expectedPly: number }): Promise<AppendMoveResult> {
  if (!PLAY_ENABLED) return { ok: false, reason: "disabled" };
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:played-move`, 240, 60_000))) return { ok: false, reason: "throttled" };

  const parsed = ABANDON_SCHEMA.safeParse({ gameId, ...input });
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const db = getPlatformDb();
  const row = await db.playedGame.findFirst({
    where: { id: parsed.data.gameId, OR: [{ whiteUserId: user.id }, { blackUserId: user.id }] },
    select: { whiteUserId: true, blackUserId: true, plyCount: true, finishedAt: true },
  });
  if (!row) return { ok: false, reason: "denied" };
  if (row.finishedAt !== null) return { ok: false, reason: "finished" };
  if (row.plyCount !== parsed.data.expectedPly) return { ok: false, reason: "stale" };

  const end = resignationEnd(seatOf(row, user.id)!);
  const { written } = await db.$transaction((tx) =>
    writePlayedGameRecord(tx, {
      kind: "close",
      gameId: parsed.data.gameId,
      expectedPly: parsed.data.expectedPly,
      end,
      at: new Date(),
    }),
  );
  if (!written) return { ok: false, reason: "stale" };

  revalidatePath(platformRoutes.profile, "layout");
  return { ok: true, plyCount: parsed.data.expectedPly, end };
}

/**
 * The review's evaluations (`[%eval]`) into a finished game's PGN: only by
 * whoever played it, and only if not one move changes.
 */
export async function storePlayedGameReview(gameId: string, pgnWithEvals: string): Promise<AutosaveResult> {
  if (!PLAY_ENABLED) return { ok: false, reason: "denied" };
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:played-review`, 30, 60_000))) return { ok: false, reason: "throttled" };
  if (typeof pgnWithEvals !== "string" || pgnWithEvals.length > 200_000) return { ok: false, reason: "invalid" };

  const db = getPlatformDb();
  const seated = await db.playedGame.findFirst({
    where: { id: gameId, finishedAt: { not: null }, OR: [{ whiteUserId: user.id }, { blackUserId: user.id }] },
    select: { id: true },
  });
  if (!seated) return { ok: false, reason: "denied" };

  const { written } = await db.$transaction((tx) =>
    writePlayedGameRecord(tx, { kind: "annotate", gameId, pgn: pgnWithEvals }),
  );
  return written ? { ok: true } : { ok: false, reason: "invalid" };
}

/**
 * «Guardar en un estudio»: a COPY of a played game into a study of one's own,
 * as a `Game` with source «Jugada en la plataforma», indexed in the same
 * transaction. From there it is a study's game like any other — the explorer
 * finds it — and the played game stays where it was.
 */
export async function copyPlayedGameToStudy(gameId: string, formData: FormData): Promise<void> {
  if (!PLAY_ENABLED) notFound();
  const back = platformRoutes.playedGame(gameId);
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:create-game`, 30, 60_000))) redirect(withErrorParam(back, "throttled"));

  const form = parseForm(COPY_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(back, "invalid"));

  const db = getPlatformDb();
  const viewer = await currentViewer();
  const [played, study] = await Promise.all([
    db.playedGame.findFirst({
      where: { AND: [{ id: gameId }, playedGameVisibleWhere(viewer)] },
      select: {
        pgn: true,
        initialFen: true,
        whiteElo: true,
        blackElo: true,
        startedAt: true,
        whiteUser: { select: { displayName: true, country: true } },
        blackUser: { select: { displayName: true, country: true } },
        whiteBot: { select: { name: true, fideTitle: true, country: true } },
        blackBot: { select: { name: true, fideTitle: true, country: true } },
        result: { select: { code: true } },
      },
    }),
    db.gameDatabase.findFirst({ where: { id: form.data.study, userId: user.id }, select: { id: true } }),
  ]);
  if (!played || !study) redirect(withErrorParam(back, "invalid"));

  const white = played.whiteBot?.name ?? played.whiteUser?.displayName ?? "Desconocido";
  const black = played.blackBot?.name ?? played.blackUser?.displayName ?? "Desconocido";

  const created = await db.$transaction(async (tx) => {
    const last = await tx.game.aggregate({ where: { databaseId: study.id }, _max: { order: true } });
    const game = await tx.game.create({
      data: {
        database: { connect: { id: study.id } },
        order: (last._max.order ?? 0) + 1,
        title: form.data.title ?? `${white} – ${black}`,
        white,
        black,
        whiteElo: played.whiteElo,
        blackElo: played.blackElo,
        whiteTitle: played.whiteBot?.fideTitle ?? null,
        blackTitle: played.blackBot?.fideTitle ?? null,
        whiteCountry: played.whiteBot?.country ?? played.whiteUser?.country ?? null,
        blackCountry: played.blackBot?.country ?? played.blackUser?.country ?? null,
        result: { connect: { code: played.result.code } },
        playedAt: played.startedAt,
        event: "Partida en 365 días de ajedrez",
        initialFen: played.initialFen,
        pgn: played.pgn,
        source: { connect: { code: GAME_SOURCE.PLATFORM_GAME } },
        isOwnGame: true,
      },
      select: { id: true },
    });
    await indexGamePositions(tx, { gameId: game.id, databaseId: study.id, pgn: played.pgn });
    return game;
  });

  revalidatePath(platformRoutes.studyDetail(study.id));
  redirect(platformRoutes.gameDetail(study.id, created.id));
}
