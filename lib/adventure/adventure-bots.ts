import type { AdventureSeed } from "@/lib/adventure/adventure.types";
import { BOT_ROSTER, botSeedOf, type BotSeed } from "@/lib/chess/bots/roster";
import { adventureBotSlug, ADVENTURES } from "./adventures";

// The rivals of the adventures as bots. A rival is a character with a story
// and borrows the strength of a gallery bot: its `elo` IS that bot's label,
// which the calibration measured, so a rival is never calibrated of its own
// and stays out of `BOT_ROSTER` (`bots:calibrate` does not ask for it).
// `adventures.test.ts` keeps the borrowed label in step. The seed and
// `npm run bots:sql` write these rows with the roster's through `allBotSeeds`.

/** The bots of one adventure, in story order. */
export function adventureBotSeeds(adventure: AdventureSeed): BotSeed[] {
  return adventure.encounters.map((encounter) => {
    const borrowed = botSeedOf(encounter.strengthOf);
    if (!borrowed) {
      throw new Error(
        `«${encounter.name}» borrows the strength of «${encounter.strengthOf}», which is not in the roster`,
      );
    }
    return {
      slug: adventureBotSlug(adventure.slug, encounter.slug),
      name: encounter.name,
      elo: borrowed.elo,
      group: adventure.botGroup,
      order: encounter.order - 1,
      bio: encounter.role,
      openings: [encounter.opening.name],
      country: "MEX",
      fideTitle: null,
      fideElo: null,
      ratingAsOf: null,
      isActive: true,
    };
  });
}

/** Every bot the database holds: the gallery's roster, then the adventures' rivals. */
export function allBotSeeds(): BotSeed[] {
  return [...BOT_ROSTER, ...ADVENTURES.flatMap(adventureBotSeeds)];
}
