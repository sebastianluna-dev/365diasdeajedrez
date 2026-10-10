import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaperFrame } from "@/components/adventure/paper-frame/paper-frame/paper-frame.comp";
import { LiveGameSection } from "@/components/platform/sections/play/live-game/live-game.section";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { ADVENTURE_ENABLED, ANALYSIS_BOARD_ENABLED, PLAY_ENABLED } from "@/constants/platform/features.const";
import { studentErrorMessage } from "@/constants/platform/student-messages.const";
import { strengthFor } from "@/lib/chess/bots/bot-strength";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";
import { copyPlayedGameToStudy, rematchPlayedGame } from "@/services/play/play.actions";
import { botScoreAgainst, getPlayedGame } from "@/services/play/play.service";
import { getOwnPlayerCard } from "@/services/profile/profile.service";
import { getOwnStudyOptions } from "@/services/studies/studies.service";
import "./played-game-page.css";

export const metadata: Metadata = {
  title: "Partida",
};

interface PlayedGamePageProps {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ error?: string }>;
}

/**
 * A game against a bot: one URL, live or finished. Played by whoever holds a
 * seat; read by their teacher and the staff, with nothing to do on it.
 */
export default async function PlayedGamePage({ params, searchParams }: PlayedGamePageProps) {
  if (!PLAY_ENABLED) notFound();
  const user = await getCurrentUser();
  const [{ gameId }, { error }] = await Promise.all([params, searchParams]);
  const game = await getPlayedGame(gameId);
  if (!game) notFound();

  const seated = game.viewerSeat !== null;
  const bot = game.white.kind === "bot" ? game.white : game.black.kind === "bot" ? game.black : null;
  const [score, studies, you] = seated
    ? await Promise.all([
        bot?.botId ? botScoreAgainst(user.id, bot.botId) : null,
        getOwnStudyOptions(),
        getOwnPlayerCard(),
      ])
    : [null, [], null];
  const errorMessage = studentErrorMessage(error);
  const color = game.viewerSeat === "black" ? "negras" : "blancas";

  // A game of an adventure is drawn on a page of the notebook, which brings its own head.
  const adventure = ADVENTURE_ENABLED ? game.adventure : null;
  const counted = score ? score.wins + score.losses + score.draws : 0;

  const live = (
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
      rematch={seated && !adventure ? rematchPlayedGame.bind(null, game.id) : null}
      adventure={
        adventure ? { mapHref: platformRoutes.adventureMap(adventure.slug), priorWins: score?.wins ?? 0 } : null
      }
      copyToStudy={copyPlayedGameToStudy.bind(null, game.id)}
      analysisBoardHref={ANALYSIS_BOARD_ENABLED ? platformRoutes.analysisBoard({ partida: game.id }) : null}
    />
  );

  return (
    <div
      className={`platform-page platform-page_width_wide played-game-page${adventure ? " played-game-page_framed" : ""}`}
    >
      {!adventure && (
        <header className="played-game-page__head">
          <h1 className="played-game-page__title">
            {game.white.name} – {game.black.name}
          </h1>
          <span className="played-game-page__meta">
            {seated ? `Con ${color} · ` : ""}
            {game.timeControlLabel} · {formatSpanishDate(game.startedAt)}
          </span>
        </header>
      )}

      {errorMessage && <PlatformNotice message={errorMessage} />}

      {adventure ? (
        <PaperFrame
          zone={adventure.encounter.zoneName}
          place={adventure.encounter.place}
          page={adventure.encounter.order}
          attempt={seated ? counted + (game.finishedAt ? 0 : 1) : null}
          mapHref={platformRoutes.adventureMap(adventure.slug)}
        >
          {live}
        </PaperFrame>
      ) : (
        live
      )}
    </div>
  );
}
