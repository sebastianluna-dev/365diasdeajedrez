import { adventureBotSlug } from "@/lib/adventure/adventures";
import type { AdventureSeed, AdventureEncounterSeed } from "@/lib/adventure/adventure.types";
import { botSeedOf } from "@/lib/chess/bots/roster";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { botSideOf, SCORE_SELECT } from "@/services/play/play.mapper";
import type { OpenGameSummary } from "@/services/play/play.types";
import type { GameResultCode } from "@/constants/platform/study-codes.const";
import { nextEncounterOf, totalsOf, type AdventureGame } from "./adventure-rules";
import type { AdventureProgressView, EncounterProgress, EncounterView } from "./adventure.types";

// Rows of `PlayedGame` and the adventure's content → what the adventure
// screens read. Pure: the queries live in adventure.service.ts and select
// exactly `ADVENTURE_GAME_SELECT`.

/** What the progress needs of each game against an adventure's rival: the scoreboard's columns and the bot's slug. */
export const ADVENTURE_GAME_SELECT = {
  ...SCORE_SELECT,
  whiteBot: { select: { slug: true } },
  blackBot: { select: { slug: true } },
} satisfies Prisma.PlayedGameSelect;

export type AdventureGameRow = Prisma.PlayedGameGetPayload<{ select: typeof ADVENTURE_GAME_SELECT }>;

/** The games of `userId` against the adventure's rivals, each tied to the encounter it was played against. */
export function adventureGamesOf(
  rows: readonly AdventureGameRow[],
  userId: string,
  adventure: AdventureSeed,
): AdventureGame[] {
  const orderOfBot = new Map(
    adventure.encounters.map((encounter) => [adventureBotSlug(adventure.slug, encounter.slug), encounter.order]),
  );
  return rows.flatMap((row) => {
    const side = botSideOf(row, userId);
    const slug = row.whiteBot?.slug ?? row.blackBot?.slug;
    const order = slug ? orderOfBot.get(slug) : undefined;
    if (!side || order === undefined) return [];
    return [{ order, finishedAt: row.finishedAt, resultCode: row.result.code as GameResultCode, seat: side.seat }];
  });
}

/** An encounter's content with where the person stands. */
function encounterView(
  adventure: AdventureSeed,
  seed: AdventureEncounterSeed,
  progress: EncounterProgress,
): EncounterView {
  return {
    ...progress,
    slug: seed.slug,
    botSlug: adventureBotSlug(adventure.slug, seed.slug),
    name: seed.name,
    role: seed.role,
    zone: seed.zone,
    zoneName: adventure.zones.find((zone) => zone.slug === seed.zone)?.name ?? "",
    place: seed.place,
    elo: botSeedOf(seed.strengthOf)?.elo ?? 0,
    difficulty: seed.difficulty,
    difficultyLabel: adventure.difficultyLabels[seed.difficulty],
    phrase: seed.phrase,
    opening: seed.opening,
    style: seed.style,
    keepsake: seed.keepsake,
    portrait: seed.portrait,
    isFinal: seed.isFinal === true,
  };
}

/** The adventure for one person, from their states and their open game (if any). */
export function progressView(
  adventure: AdventureSeed,
  states: readonly EncounterProgress[],
  openGame: OpenGameSummary | null,
): AdventureProgressView {
  const encounters = adventure.encounters.map((seed) =>
    encounterView(
      adventure,
      seed,
      states.find((progress) => progress.order === seed.order)!,
    ),
  );
  const next = nextEncounterOf(states);
  const { beaten, stars } = totalsOf(states);
  const openSeed = openGame
    ? adventure.encounters.find((seed) => adventureBotSlug(adventure.slug, seed.slug) === openGame.rival.slug)
    : undefined;
  return {
    slug: adventure.slug,
    title: adventure.title,
    subtitle: adventure.subtitle,
    premise: adventure.premise,
    encounters,
    current: encounters.find((encounter) => encounter.order === next?.order) ?? null,
    beaten,
    total: encounters.length,
    stars,
    isComplete: beaten === encounters.length,
    openGame,
    openGameEncounter: openSeed?.order ?? null,
  };
}
