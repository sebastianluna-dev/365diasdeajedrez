import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { MapIcon } from "@/components/icons/map-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { movesText, resultOf } from "@/components/platform/shared/played-game-card/played-game-card.comp";
import { formatRelativeSpanish } from "@/lib/format-relative-spanish";
import { mdButton, mdFab } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import type { PlayedGameCard } from "@/services/play/play.types";
import "./play-side.comp.css";

/** The drawings the column's main action can carry. */
const ACTION_ICONS = { play: PlayIcon, map: MapIcon, back: ArrowLeftIcon } as const;

/** The badge of a game in the list, and what a screen reader hears for it. */
const BADGES = {
  win: { text: "G", label: "Ganada" },
  loss: { text: "P", label: "Perdida" },
  draw: { text: "T", label: "Tablas" },
  open: { text: "·", label: "En curso" },
  aborted: { text: "–", label: "Anulada" },
} as const;

export interface PlaySideAction {
  label: string;
  href: string;
  icon: keyof typeof ACTION_ICONS;
  /** A line under the button: what it leads to («En curso contra Chayo Ríos · con blancas · 14 jugadas»). */
  note?: string;
}

interface PlaySideProps {
  /** The column's accessible name. */
  label: string;
  /** The page's main action on top, as Material's extended FAB; none when there is nothing to go on with. */
  action: PlaySideAction | null;
  /** The person's last games, newest first (`recentPlayedGamesOf`). */
  games: PlayedGameCard[];
  /** Their record against the bots, every game together. */
  record: { wins: number; losses: number; draws: number };
  /** «Ver todas en tu perfil»: the profile's «Partidas». */
  gamesHref: string;
  /** The game on screen, lit in the list. */
  currentGameId?: string;
  /** For the stories: what «hace 2 horas» counts from. */
  now?: Date;
}

/** «Ganaste contra Tere», «Tablas con Beto»: a game in the list, from the person's side. */
function gameTitle(game: PlayedGameCard): string {
  const rival = game.rival.name;
  switch (resultOf(game)) {
    case "win":
      return `Ganaste contra ${rival}`;
    case "loss":
      return `Perdiste contra ${rival}`;
    case "draw":
      return `Tablas con ${rival}`;
    case "open":
      return `En curso contra ${rival}`;
    case "aborted":
      return `Anulada contra ${rival}`;
  }
}

/**
 * The side column of «Jugar» in the new design system (2026-10-25, the
 * owner's «M4 · /jugar»): the main action on top as Material's extended FAB —
 * «Continuar la partida» while a game is open, with what it is under it — and
 * «Tus partidas», the last games each with its G, P or T, the record of them
 * all and «Ver todas en tu perfil». The game's page uses it too, with
 * «Volver al mapa» on top and the game on screen lit.
 */
export function PlaySide({ label, action, games, record, gamesHref, currentGameId, now = new Date() }: PlaySideProps) {
  const Icon = action ? ACTION_ICONS[action.icon] : null;
  return (
    <nav className="play-side" aria-label={label}>
      {action && Icon && (
        <div className="play-side__action">
          <Link href={action.href} className={`${mdFab("primary-container")} play-side__fab`}>
            <Icon variant="classic-solid" className="platform-md-icon" />
            {action.label}
          </Link>
          {action.note && <p className="play-side__note">{action.note}</p>}
        </div>
      )}

      <section className="play-side__group" aria-labelledby="play-side-games">
        <h2 id="play-side-games" className="play-side__title">
          Tus partidas
        </h2>
        {games.length === 0 ? (
          <p className="play-side__empty">Todavía no hay partidas: aparecen aquí en cuanto juegues la primera.</p>
        ) : (
          <ul className="play-side__list">
            {games.map((game) => {
              const result = resultOf(game);
              const current = game.id === currentGameId;
              return (
                <li key={game.id}>
                  <Link
                    href={platformRoutes.playedGame(game.id)}
                    className={`play-side__game${current ? " play-side__game_state_current" : ""}`}
                    aria-current={current ? "page" : undefined}
                  >
                    <span
                      className={`play-side__badge play-side__badge_result_${result}`}
                      role="img"
                      aria-label={BADGES[result].label}
                    >
                      <span aria-hidden="true">{BADGES[result].text}</span>
                    </span>
                    <span className="play-side__game-text">
                      <span className="play-side__game-title">{gameTitle(game)}</span>
                      <span className="play-side__game-facts">
                        {formatRelativeSpanish(game.at, now)} · {movesText(game.moves)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {record.wins + record.losses + record.draws > 0 && (
          <p className="play-side__record">
            <span className="play-side__tally">
              <b className="play-side__tally-figure play-side__tally-figure_result_win">{record.wins}</b>
              <span aria-hidden="true"> G</span>
              <span className="play-side__sr"> ganadas,</span>
            </span>
            <span className="play-side__tally">
              <b className="play-side__tally-figure play-side__tally-figure_result_loss">{record.losses}</b>
              <span aria-hidden="true"> P</span>
              <span className="play-side__sr"> perdidas,</span>
            </span>
            <span className="play-side__tally">
              <b className="play-side__tally-figure">{record.draws}</b>
              <span aria-hidden="true"> T</span>
              <span className="play-side__sr"> tablas</span>
            </span>
          </p>
        )}

        <Link href={gamesHref} className={`${mdButton("text", "sm")} play-side__more`}>
          Ver todas en tu perfil
        </Link>
      </section>
    </nav>
  );
}
