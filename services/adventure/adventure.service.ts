import "server-only";
import { cache } from "react";
import { ADVENTURES, adventureOf, COMING_ADVENTURES } from "@/lib/adventure/adventures";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { getOpenPlayedGame } from "@/services/play/play.service";
import { encounterStatesOf, totalsOf, type AdventureGame } from "./adventure-rules";
import { ADVENTURE_GAME_SELECT, adventureGamesOf, progressView } from "./adventure.mapper";
import type { AdventureProgressView, AdventureShelfView } from "./adventure.types";

// The adventures, read. Progress is DERIVED from the person's played games —
// there is no table of it — so these reads never write, and nothing here
// touches the activity log: playing never counts toward the streak
// (services/play/no-activity.test.ts walks this folder too). The person is
// always the session's, resolved in the DAL.
//
// Queries: the shelf asks the database ONE thing (the games against the
// adventure's rivals, tied to a rival by the bot's slug in the same query), and
// the map asks that plus the open game («Continuar»): two, on top of the
// session.

/** The games of `userId` against the rivals of one adventure, ready for the rules. */
const adventureGamesFor = cache(async (userId: string, adventureSlug: string): Promise<AdventureGame[]> => {
  const adventure = adventureOf(adventureSlug);
  if (!adventure) return [];
  const group = { group: { code: adventure.botGroup } };
  const rows = await getPlatformDb().playedGame.findMany({
    where: {
      OR: [
        { whiteUserId: userId, blackBot: group },
        { blackUserId: userId, whiteBot: group },
      ],
    },
    select: ADVENTURE_GAME_SELECT,
  });
  return adventureGamesOf(rows, userId, adventure);
});

/** The shelf: every notebook the person can open, with their progress, and the ones that are coming. */
export const getAdventureShelf = cache(async (): Promise<AdventureShelfView> => {
  const user = await getCurrentUser();
  const notebooks = await Promise.all(
    ADVENTURES.map(async (adventure) => {
      const states = encounterStatesOf(adventure.encounters, await adventureGamesFor(user.id, adventure.slug));
      return {
        slug: adventure.slug,
        title: adventure.title,
        place: adventure.shelf.place,
        total: adventure.encounters.length,
        ...totalsOf(states),
      };
    }),
  );
  return { notebooks, coming: COMING_ADVENTURES };
});

/** One adventure for the current person, or null when there is none by that slug. */
export const getAdventureProgress = cache(async (slug: string): Promise<AdventureProgressView | null> => {
  const adventure = adventureOf(slug);
  if (!adventure) return null;
  const user = await getCurrentUser();
  const [games, openGame] = await Promise.all([adventureGamesFor(user.id, slug), getOpenPlayedGame()]);
  return progressView(adventure, encounterStatesOf(adventure.encounters, games), openGame);
});
