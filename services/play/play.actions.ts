"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { GAME_SOURCE, type GameResultCode } from "@/constants/platform/study-codes.const";
import { gameEnd, resignationEnd } from "@/lib/chess/game-end";
import { extractMainline } from "@/lib/chess/mainline";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { indexGamePositions } from "@/services/game-positions/game-positions.service";
import { formOptionalText, formText, parseForm } from "@/services/shared/form-schema";
import type { AutosaveResult } from "@/services/shared/game-record";
import { writePlayedGameRecord } from "@/services/shared/played-game-record";
import { withErrorParam } from "@/services/shared/safe-return-to";
import { checkAppend } from "./append-rules";
import { gameEndOfCodes } from "./play.mapper";
import { currentViewer } from "./play.service";
import { playedGameVisibleWhere, seatOf } from "./play-rules";
import type { AppendMoveResult } from "./play.types";

// What a person does with a game against a bot. A game is opened only by
// `startAdventureEncounter` (services/adventure): since 2026-10-25 every game
// against a bot is an encounter of the adventure, and there is no free game
// to start nor a rematch to ask for. Each action resolves the user
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
