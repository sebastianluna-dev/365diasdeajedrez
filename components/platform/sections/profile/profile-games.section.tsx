import { platformRoutes } from "@/lib/platform-routes";
import { listPlayedGamesOf, playedRivalsOf } from "@/services/play/play.service";
import type { PlayedGameResultFilter } from "@/services/play/play.types";
import type { ProfileHead } from "@/services/profile/profile.types";
import { PlayedGamesFilters } from "./played-games-filters.comp";
import { PlayedGamesTimeline } from "./played-games-timeline/played-games-timeline.comp";
import "./profile-games.section.css";

const RESULT_FILTERS: readonly PlayedGameResultFilter[] = ["win", "loss", "draw", "open"];

interface ProfileGamesSectionProps {
  profile: ProfileHead;
  /** From the URL: `?pagina=`, `?rival=`, `?resultado=`. */
  query: { pagina?: string; rival?: string; resultado?: string };
}

/**
 * «Partidas» (L4): every game of the person, twenty a page, filtered by
 * rival and result through the URL, as a timeline.
 */
export async function ProfileGamesSection({ profile, query }: ProfileGamesSectionProps) {
  const page = Math.max(1, Number.parseInt(query.pagina ?? "1", 10) || 1);
  const result = RESULT_FILTERS.find((filter) => filter === query.resultado);
  const rival = query.rival?.slice(0, 60) || undefined;
  const [games, rivals] = await Promise.all([
    listPlayedGamesOf(profile.userId, { page, rival, result }),
    playedRivalsOf(profile.userId),
  ]);

  return (
    <div className="profile-games">
      <PlayedGamesFilters slug={profile.slug} rivals={rivals} rival={rival ?? ""} result={result ?? ""} />
      <PlayedGamesTimeline
        page={games}
        isOwn={profile.isOwn}
        filtered={Boolean(rival || result)}
        hrefOf={(next) => platformRoutes.userProfileGames(profile.slug, { pagina: next, rival, resultado: result })}
      />
    </div>
  );
}
