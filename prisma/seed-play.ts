import {
  BOT_GROUP,
  BOT_GROUP_LABELS,
  BOT_GROUP_LISTED,
  BOT_GROUP_RING,
  GAME_TERMINATION,
  GAME_TERMINATION_LABELS,
  TIME_CONTROL,
  TIME_CONTROL_VALUES,
} from "../constants/platform/play-codes.const";
import { allBotSeeds } from "../lib/adventure/adventure-bots";
import { adventureBotSlug } from "../lib/adventure/adventures";
import { CUADERNO_DEL_VIAJERO } from "../lib/adventure/adventures/cuaderno-del-viajero";
import { gameEnd, resignationEnd, type GameEnd } from "../lib/chess/game-end";
import type { PrismaClient } from "../lib/platform-db/generated/client";
import { writePlayedGameRecord } from "../services/shared/played-game-record";

// «Jugar»'s part of the seed: its three catalogs and the bots, upserted by
// code and slug from the same constants and bots the migrations' SQL is
// generated from (`prisma/play-catalog-sql.ts`: the gallery's roster and the
// adventures' rivals), and twelve games for the demo student — three against
// gallery bots and nine in «El cuaderno del viajero» — so the profile, the
// teacher's card, the adventure's map and the checks in the app do not start
// empty. The games go through `writePlayedGameRecord`, the only writer of
// their derived columns, and only reach a student who has played none: a
// re-seed never duplicates them nor overwrites a game played since.

/** A demo game against a bot, as the student played it. */
export interface DemoPlayedGame {
  bot: string;
  seat: "white" | "black";
  sans: string[];
  /** Ended by the board (`gameEnd`), by the student resigning, or still open. */
  ending: "board" | "resigned" | "open";
  daysAgo: number;
}

export const DEMO_PLAYED_GAMES: readonly DemoPlayedGame[] = [
  // Won: the scholar's mate against the weakest bot.
  { bot: "tere", seat: "white", sans: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"], ending: "board", daysAgo: 3 },
  // Lost: Légal's trap with black, resigned one move before the mate.
  {
    bot: "don-chuy",
    seat: "black",
    sans: ["e4", "e5", "Nf3", "d6", "Bc4", "Bg4", "Nc3", "g6", "Nxe5", "Bxd1", "Bxf7+", "Ke7"],
    ending: "resigned",
    daysAgo: 2,
  },
  // Open, the student to move: what «Continuar» resumes.
  { bot: "lupita", seat: "white", sans: ["e4", "e5", "Nf3", "Nc6"], ending: "open", daysAgo: 0 },
];

/** The demo student's win in a few moves: the scholar's mate. */
const WIN_SANS = ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"];

/** The demo student's loss as black: Légal's trap, resigned one move before the mate. */
const LOSS_SANS = ["e4", "e5", "Nf3", "d6", "Bc4", "Bg4", "Nc3", "g6", "Nxe5", "Bxd1", "Bxf7+", "Ke7"];

const rivalOf = (encounterSlug: string) => adventureBotSlug(CUADERNO_DEL_VIAJERO.slug, encounterSlug);

/**
 * The demo student's nine games in «El cuaderno del viajero», which leave the
 * map at 4 of 12 as the mockup has it: Don Chema beaten at the first try (★★★),
 * Chayo Ríos at the second (★★), Profe Leal at the fourth (★), Toñito Garza at
 * the first (★★★), and one loss against Anselmo Quiroga, so his stamp reads
 * «Intento 2». Oldest first.
 */
export const DEMO_ADVENTURE_GAMES: readonly DemoPlayedGame[] = [
  { bot: rivalOf("don-chema"), seat: "white", sans: WIN_SANS, ending: "board", daysAgo: 26 },
  { bot: rivalOf("chayo-rios"), seat: "black", sans: LOSS_SANS, ending: "resigned", daysAgo: 20 },
  { bot: rivalOf("chayo-rios"), seat: "white", sans: WIN_SANS, ending: "board", daysAgo: 19 },
  { bot: rivalOf("profe-leal"), seat: "black", sans: LOSS_SANS, ending: "resigned", daysAgo: 14 },
  { bot: rivalOf("profe-leal"), seat: "black", sans: LOSS_SANS, ending: "resigned", daysAgo: 13 },
  { bot: rivalOf("profe-leal"), seat: "black", sans: LOSS_SANS, ending: "resigned", daysAgo: 12 },
  { bot: rivalOf("profe-leal"), seat: "white", sans: WIN_SANS, ending: "board", daysAgo: 11 },
  { bot: rivalOf("tonito-garza"), seat: "white", sans: WIN_SANS, ending: "board", daysAgo: 6 },
  { bot: rivalOf("anselmo-quiroga"), seat: "black", sans: LOSS_SANS, ending: "resigned", daysAgo: 4 },
];

/** How a demo game ends, or null while it is open. */
export function demoGameEnd(game: DemoPlayedGame): GameEnd | null {
  if (game.ending === "board") return gameEnd(null, game.sans);
  if (game.ending === "resigned") return resignationEnd(game.seat);
  return null;
}

const MOVE_INTERVAL_MS = 30_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** The catalogs and the bots; returns each bot's id by slug. */
async function seedPlayCatalogs(db: PrismaClient): Promise<Map<string, number>> {
  const groupIds = new Map<string, number>();
  for (const [order, code] of Object.values(BOT_GROUP).entries()) {
    const columns = {
      label: BOT_GROUP_LABELS[code],
      ring: BOT_GROUP_RING[code],
      order,
      isListed: BOT_GROUP_LISTED[code],
    };
    const row = await db.botGroup.upsert({ where: { code }, update: columns, create: { code, ...columns } });
    groupIds.set(code, row.id);
  }

  for (const [order, { code, ...columns }] of TIME_CONTROL_VALUES.entries()) {
    await db.timeControl.upsert({
      where: { code },
      update: { ...columns, order },
      create: { code, ...columns, order },
    });
  }

  for (const [order, code] of Object.values(GAME_TERMINATION).entries()) {
    const columns = { label: GAME_TERMINATION_LABELS[code], order };
    await db.gameTermination.upsert({ where: { code }, update: columns, create: { code, ...columns } });
  }

  const botIds = new Map<string, number>();
  for (const { slug, group, ratingAsOf, ...columns } of allBotSeeds()) {
    const data = {
      ...columns,
      ratingAsOf: ratingAsOf ? new Date(`${ratingAsOf}T00:00:00Z`) : null,
      groupId: groupIds.get(group)!,
    };
    const row = await db.bot.upsert({ where: { slug }, update: data, create: { slug, ...data } });
    botIds.set(slug, row.id);
  }
  return botIds;
}

/** One demo game, written through the only writer of a played game's columns. */
async function writeDemoGame(
  db: PrismaClient,
  student: { id: string; displayName: string },
  botIds: Map<string, number>,
  game: DemoPlayedGame,
  now: Date,
) {
  const bot = allBotSeeds().find((seed) => seed.slug === game.bot);
  const botId = botIds.get(game.bot);
  if (!bot || !botId) throw new Error(`The demo game's bot «${game.bot}» is not among the bots`);
  const studentSeat = { userId: student.id, name: student.displayName, elo: null };
  const botSeat = { botId, name: bot.name, elo: bot.elo };
  const white = game.seat === "white" ? studentSeat : botSeat;
  const black = game.seat === "white" ? botSeat : studentSeat;
  // An open game started an hour ago; a finished one, that many days back.
  const startedAt = new Date(now.getTime() - (game.daysAgo > 0 ? game.daysAgo * DAY_MS : HOUR_MS));
  const end = demoGameEnd(game);

  await db.$transaction(async (tx) => {
    const { id } = await writePlayedGameRecord(tx, {
      kind: "create",
      data: {
        whiteUserId: "userId" in white ? white.userId : null,
        whiteBotId: "botId" in white ? white.botId : null,
        blackUserId: "userId" in black ? black.userId : null,
        blackBotId: "botId" in black ? black.botId : null,
        whiteName: white.name,
        blackName: black.name,
        whiteElo: white.elo,
        blackElo: black.elo,
        timeControlCode: TIME_CONTROL.NONE,
        initialFen: null,
        at: startedAt,
      },
    });
    for (const [ply, san] of game.sans.entries()) {
      const last = ply === game.sans.length - 1;
      await writePlayedGameRecord(tx, {
        kind: "ply",
        gameId: id,
        expectedPly: ply,
        san,
        end: last && game.ending === "board" ? end : null,
        at: new Date(startedAt.getTime() + (ply + 1) * MOVE_INTERVAL_MS),
      });
    }
    if (game.ending === "resigned" && end) {
      await writePlayedGameRecord(tx, {
        kind: "close",
        gameId: id,
        expectedPly: game.sans.length,
        end,
        at: new Date(startedAt.getTime() + (game.sans.length + 1) * MOVE_INTERVAL_MS),
      });
    }
  });
}

/**
 * The demo student's games, each set only when they have played none of its
 * kind: the gallery's three when they have played nothing, and the adventure's
 * nine when they have played no rival of the adventure's group — so a database
 * that already held the first three gets the nine on its next seed. A re-seed
 * never duplicates a game nor overwrites one played since.
 */
async function seedDemoPlayedGames(
  db: PrismaClient,
  student: { id: string; displayName: string },
  botIds: Map<string, number>,
  now: Date,
) {
  const played = await db.playedGame.count({
    where: { OR: [{ whiteUserId: student.id }, { blackUserId: student.id }] },
  });
  if (played === 0) {
    for (const game of DEMO_PLAYED_GAMES) await writeDemoGame(db, student, botIds, game, now);
  }

  const group = { group: { code: BOT_GROUP.ADVENTURE_CUADERNO } };
  const inAdventure = await db.playedGame.count({
    where: {
      OR: [
        { whiteUserId: student.id, blackBot: group },
        { blackUserId: student.id, whiteBot: group },
      ],
    },
  });
  if (inAdventure === 0) {
    for (const game of DEMO_ADVENTURE_GAMES) await writeDemoGame(db, student, botIds, game, now);
  }
}

export async function seedPlay(db: PrismaClient, student: { id: string; displayName: string }, now: Date) {
  const botIds = await seedPlayCatalogs(db);
  await seedDemoPlayedGames(db, student, botIds, now);
}
