import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { ProfileView } from "@/services/profile/profile.types";
import { BotLevelCard } from "./bot-level-card/bot-level-card.comp";
import { GamesSummaryCard } from "./games-summary-card/games-summary-card.comp";
import { PlayedGameCard } from "@/components/platform/shared/played-game-card/played-game-card.comp";
import { StudyStreakCard } from "./study-streak-card/study-streak-card.comp";
import "./profile-overview.section.css";

/**
 * «Visión general» (N5, L2): the three cards — level against bots, games,
 * study streak — and the last eight games as cards, with «Ver todas».
 */
export function ProfileOverviewSection({ profile }: { profile: ProfileView }) {
  return (
    <div className="profile-overview">
      <div className="profile-overview__cards">
        <BotLevelCard level={profile.botLevel} isOwn={profile.isOwn} />
        <GamesSummaryCard record={profile.record} />
        <StudyStreakCard streak={profile.streak} isOwn={profile.isOwn} />
      </div>

      <section className="profile-overview__games" aria-labelledby="profile-overview-games">
        <header className="profile-overview__games-head">
          <h2 id="profile-overview-games" className="profile-overview__games-title">
            Partidas <span className="profile-overview__count">{profile.counts.games}</span>
          </h2>
          {profile.counts.games > profile.recentGames.length && (
            <Link href={platformRoutes.userProfileGames(profile.slug)} className="profile-overview__all">
              Ver todas
            </Link>
          )}
        </header>
        {profile.recentGames.length === 0 ? (
          <EmptyState
            title="Todavía no hay partidas"
            description={profile.isOwn ? "Las partidas que juegues contra los bots aparecen aquí." : undefined}
            actionLabel={profile.isOwn ? "Jugar" : undefined}
            actionHref={profile.isOwn ? platformRoutes.play : undefined}
          />
        ) : (
          <ul className="profile-overview__grid">
            {profile.recentGames.map((game) => (
              <li key={game.id}>
                <PlayedGameCard game={game} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
