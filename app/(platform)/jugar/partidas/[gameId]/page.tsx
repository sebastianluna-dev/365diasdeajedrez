import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveGameSection } from "@/components/platform/sections/play/live-game/live-game.section";
import { PlaySide, type PlaySideAction } from "@/components/platform/sections/play/play-side/play-side.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  ADVENTURE_ENABLED,
  ANALYSIS_BOARD_ENABLED,
  PLAY_ENABLED,
  PLAY_PAGE_ENABLED,
} from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { strengthFor } from "@/lib/chess/bots/bot-strength";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";
import { copyPlayedGameToStudy } from "@/services/play/play.actions";
import { botScoreboardOf, getPlayedGame, recentPlayedGamesOf } from "@/services/play/play.service";
import { getOwnPlayerCard } from "@/services/profile/profile.service";
import { getOwnStudyOptions } from "@/services/studies/studies.service";
import "./played-game-page.css";

export const metadata: Metadata = {
  title: "Partida",
};

/** How many of the last games the side column lists. */
const SIDE_GAMES = 4;

interface PlayedGamePageProps {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ error?: string }>;
}

/**
 * A game against a bot: one URL, live or finished, in the new design system
 * (2026-10-25). Played by whoever holds a seat, with «Volver al mapa» and
 * their last games in the side column; read by their teacher and the staff,
 * with nothing to do on it and no side column (the games there would be the
 * viewer's, not the student's). The page takes the window and bleeds onto the
 * canvas; the panel holds what the game is and the viewer in its material
 * look. A game of an adventure says its page, place and attempt in the head,
 * where the notebook's paper frame used to say them.
 */
export default async function PlayedGamePage({ params, searchParams }: PlayedGamePageProps) {
  if (!PLAY_ENABLED) notFound();
  const user = await getCurrentUser();
  const [{ gameId }, { error }] = await Promise.all([params, searchParams]);
  const game = await getPlayedGame(gameId);
  if (!game) notFound();

  const seated = game.viewerSeat !== null;
  const bot = game.white.kind === "bot" ? game.white : game.black.kind === "bot" ? game.black : null;
  const [scoreboard, studies, you, recent] = seated
    ? await Promise.all([
        botScoreboardOf(user.id),
        getOwnStudyOptions(),
        getOwnPlayerCard(),
        recentPlayedGamesOf(user.id, SIDE_GAMES),
      ])
    : [[], [], null, []];
  const score = bot?.botId ? (scoreboard.find((candidate) => candidate.botId === bot.botId) ?? null) : null;
  const record = scoreboard.reduce(
    (sum, entry) => ({
      wins: sum.wins + entry.wins,
      losses: sum.losses + entry.losses,
      draws: sum.draws + entry.draws,
    }),
    { wins: 0, losses: 0, draws: 0 },
  );
  const errorMessage = studentErrorMessage(error);

  const adventure = ADVENTURE_ENABLED ? game.adventure : null;
  const mapHref = adventure ? platformRoutes.adventureMap(adventure.slug) : null;
  const counted = score ? score.wins + score.losses + score.draws : 0;
  const attempt = adventure && seated ? counted + (game.finishedAt ? 0 : 1) : null;
  const playHref = PLAY_PAGE_ENABLED ? platformRoutes.play : null;

  const action: PlaySideAction | null =
    adventure && mapHref
      ? {
          label: "Volver al mapa",
          href: mapHref,
          icon: "map",
          note: `${adventure.title} · ${adventure.encounter.place}`,
        }
      : playHref
        ? { label: "Ir a Jugar", href: playHref, icon: "back" }
        : null;

  const facts = [
    adventure
      ? `Página ${adventure.encounter.order}${attempt ? ` · Intento ${attempt}` : ""}`
      : game.adventure
        ? null
        : "Partida libre",
    seated ? `Con ${game.viewerSeat === "black" ? "negras" : "blancas"}` : null,
    game.timeControlLabel,
    formatSpanishDate(game.startedAt),
  ].filter((fact): fact is string => fact !== null);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className={`platform-workspace played-game-page${seated ? "" : " platform-workspace_side_none"}`}>
        {seated && (
          <div className="platform-workspace__side">
            <PlaySide
              label="Tus partidas"
              action={action}
              games={recent}
              record={record}
              gamesHref={platformRoutes.userProfileGames(user.slug)}
              currentGameId={game.id}
            />
          </div>
        )}

        <section className="platform-workspace__panel played-game-page__panel" aria-labelledby="played-game-title">
          <header className="played-game-page__head">
            <div className="played-game-page__heading">
              {adventure && <p className="played-game-page__eyebrow">Modo aventura · {adventure.encounter.zoneName}</p>}
              <h1 id="played-game-title" className="played-game-page__title">
                {game.white.name} – {game.black.name}
              </h1>
            </div>
            <ul className="played-game-page__facts">
              {facts.map((fact) => (
                <li key={fact} className="played-game-page__fact">
                  {fact}
                </li>
              ))}
            </ul>
          </header>

          {errorMessage && <PlatformNotice message={errorMessage} />}

          <LiveGameSection
            game={game}
            strength={seated && bot && !game.finishedAt ? strengthFor(bot.elo ?? 800) : null}
            scoreboard={
              score && you && bot
                ? {
                    you,
                    rival: { name: bot.name, avatar: bot.avatar, elo: bot.elo ?? undefined },
                    wins: score.wins,
                    losses: score.losses,
                    draws: score.draws,
                  }
                : null
            }
            studies={studies}
            adventure={mapHref ? { mapHref, priorWins: score?.wins ?? 0 } : null}
            playHref={playHref}
            copyToStudy={copyPlayedGameToStudy.bind(null, game.id)}
            analysisBoardHref={ANALYSIS_BOARD_ENABLED ? platformRoutes.analysisBoard({ partida: game.id }) : null}
          />
        </section>
      </div>
    </div>
  );
}
