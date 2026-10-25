import { PlayHome } from "@/components/platform/sections/play/play-home/play-home.comp";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";
import { getAdventureProgress, getAdventureShelf } from "@/services/adventure/adventure.service";
import { botScoreboardOf, recentPlayedGamesOf } from "@/services/play/play.service";

/** How many of the last games the side column lists. */
const SIDE_GAMES = 4;

/**
 * «Jugar», read: the shelf (the games against each notebook's rivals), the
 * notebook the person is in with its open game, and their last games and
 * record for the side column. The notebook drawn big is the first one not
 * finished, or the first of all when every one is. It writes nothing, and
 * nothing it reaches names the activity log: playing never counts toward the
 * streak (services/play/no-activity.test.ts).
 */
export async function PlayHomeSection() {
  const user = await getCurrentUser();
  const [shelf, games, scoreboard] = await Promise.all([
    getAdventureShelf(),
    recentPlayedGamesOf(user.id, SIDE_GAMES),
    botScoreboardOf(user.id),
  ]);
  const notebook = shelf.notebooks.find((candidate) => candidate.beaten < candidate.total) ?? shelf.notebooks[0];
  const progress = notebook ? await getAdventureProgress(notebook.slug) : null;
  if (!progress) return null;

  const record = scoreboard.reduce(
    (sum, score) => ({
      wins: sum.wins + score.wins,
      losses: sum.losses + score.losses,
      draws: sum.draws + score.draws,
    }),
    { wins: 0, losses: 0, draws: 0 },
  );

  return (
    <PlayHome
      progress={progress}
      shelf={shelf}
      games={games}
      record={record}
      gamesHref={platformRoutes.userProfileGames(user.slug)}
    />
  );
}
