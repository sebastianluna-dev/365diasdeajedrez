import Link from "next/link";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { dayKey } from "@/lib/study-streak";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { platformRoutes } from "@/lib/platform-routes";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import type { PlayedGameCard, PlayedGamesPage } from "@/services/play/play.types";
import { movesText, ResultBadge, resultOf } from "@/components/platform/shared/played-game-card/played-game-card.comp";
import { PLAY_PAGE_ENABLED } from "@/constants/platform/features.const";
import "./played-games-timeline.comp.css";

interface PlayedGamesTimelineProps {
  page: PlayedGamesPage;
  /** «Ganaste» on one's own profile, «Ganó» on somebody else's. */
  isOwn: boolean;
  /** The address of another page of this same list, with its filters. */
  hrefOf: (page: number) => string;
  /** A filter is on: the empty list says so instead of «Todavía no hay partidas». */
  filtered: boolean;
  now?: Date;
}

/** «Ganaste contra Don Chuy», «Tablas con Beto», «En curso contra Lupita». */
function headline(game: PlayedGameCard, isOwn: boolean): string {
  const result = resultOf(game);
  const rival = game.rival.name;
  if (result === "draw") return `Tablas con ${rival}`;
  if (result === "open") return `En curso contra ${rival}`;
  if (result === "aborted") return `Anulada contra ${rival}`;
  if (result === "win") return `${isOwn ? "Ganaste" : "Ganó"} contra ${rival}`;
  return `${isOwn ? "Perdiste" : "Perdió"} contra ${rival}`;
}

/** «Hoy», «Ayer», or the day, on the study day's calendar. */
function dayLabel(at: Date, now: Date): string {
  const day = dayKey(at, STUDY_DAY_TIMEZONE);
  if (day === dayKey(now, STUDY_DAY_TIMEZONE)) return "Hoy";
  if (day === dayKey(new Date(now.getTime() - 86_400_000), STUDY_DAY_TIMEZONE)) return "Ayer";
  return formatSpanishDate(at);
}

/**
 * Every game of a person (L4): a timeline with the day on the left, a dot of
 * the result's colour on the line, and the game's row on the right; twenty a
 * page, open games first. Each row opens its game.
 */
export function PlayedGamesTimeline({ page, isOwn, hrefOf, filtered, now = new Date() }: PlayedGamesTimelineProps) {
  if (page.games.length === 0) {
    return filtered ? (
      <EmptyState title="Ninguna partida con estos filtros" description="Prueba con otro rival u otro resultado." />
    ) : (
      <EmptyState
        title="Todavía no hay partidas"
        description={isOwn ? "Las partidas que juegues contra los rivales de la aventura aparecen aquí." : undefined}
        actionLabel={isOwn && PLAY_PAGE_ENABLED ? "Jugar" : undefined}
        actionHref={isOwn && PLAY_PAGE_ENABLED ? platformRoutes.play : undefined}
      />
    );
  }

  const days = page.games.map((game) => dayLabel(game.at, now));
  return (
    <div className="played-games-timeline">
      <ol className="played-games-timeline__list">
        {page.games.map((game, index) => {
          const showDay = index === 0 || days[index] !== days[index - 1];
          return (
            <li
              key={game.id}
              className={`played-games-timeline__row played-games-timeline__row_result_${resultOf(game)}`}
            >
              <span className="played-games-timeline__day">{showDay ? days[index] : ""}</span>
              <span className="played-games-timeline__line" aria-hidden="true" />
              <Link href={platformRoutes.playedGame(game.id)} className="played-games-timeline__card">
                <ResultBadge game={game} />
                <span className="played-games-timeline__text">
                  <span className="played-games-timeline__headline">
                    {headline(game, isOwn)}
                    {game.rival.elo !== null && <span className="played-games-timeline__elo"> {game.rival.elo}</span>}
                  </span>
                  <span className="played-games-timeline__facts">
                    {[
                      game.terminationLabel,
                      game.color === "white" ? "Con blancas" : "Con negras",
                      movesText(game.moves),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <PlayerAvatar {...game.rival.avatar} size="sm" />
              </Link>
            </li>
          );
        })}
      </ol>

      {page.pageCount > 1 && (
        <nav className="played-games-timeline__pager" aria-label="Páginas">
          {page.page > 1 ? (
            <Link href={hrefOf(page.page - 1)} className="platform-button platform-button_size_sm">
              Más recientes
            </Link>
          ) : (
            <span />
          )}
          <span className="played-games-timeline__page">
            Página {page.page} de {page.pageCount}
          </span>
          {page.page < page.pageCount ? (
            <Link href={hrefOf(page.page + 1)} className="platform-button platform-button_size_sm">
              Anteriores
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
