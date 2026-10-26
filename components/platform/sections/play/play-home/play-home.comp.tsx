import Link from "next/link";
import type { ComponentType } from "react";
import { AdventureShelf } from "@/components/adventure/shelf/adventure-shelf/adventure-shelf.comp";
import { JourneyMiniature } from "@/components/adventure/cover/journey-miniature/journey-miniature.comp";
import { ADVENTURE_PORTRAITS } from "@/components/adventure/adventure-art.const";
import { ArrowDownIcon } from "@/components/icons/arrow-down-icon.comp";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { MapIcon } from "@/components/icons/map-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PlaySide, type PlaySideAction } from "@/components/platform/sections/play/play-side/play-side.comp";
import { ADVENTURE_ART } from "@/lib/adventure/adventures";
import { initialsOf } from "@/lib/avatar-tone";
import { mdButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";
import type { AdventureProgressView, AdventureShelfView, EncounterView } from "@/services/adventure/adventure.types";
import type { OpenGameSummary, PlayedGameCard } from "@/services/play/play.types";
import "./play-home.comp.css";

/** The id of the shelf's section, which «Ver los cuadernos» scrolls to. */
const SHELF_ID = "cuadernos";

export interface PlayHomeData {
  /** The notebook drawn big: the one the person is in (`getAdventureProgress`). */
  progress: AdventureProgressView;
  /** Every notebook and the ones that are coming (`getAdventureShelf`). */
  shelf: AdventureShelfView;
  /** The person's last games, for the side column. */
  games: PlayedGameCard[];
  /** Their record against the bots, every game together. */
  record: { wins: number; losses: number; draws: number };
  /** The profile's «Partidas». */
  gamesHref: string;
}

interface PlayHomeProps extends PlayHomeData {
  /** For the stories: what «hace 2 horas» counts from. */
  now?: Date;
}

/** Moves as a person counts them: two plies, one move. */
const movesOf = (plyCount: number) => Math.ceil(plyCount / 2);

/** «Continuar la partida», with what it is under it. */
function continueAction(game: OpenGameSummary): PlaySideAction {
  const moves = movesOf(game.plyCount);
  const color = game.color === "white" ? "blancas" : "negras";
  return {
    label: "Continuar la partida",
    href: platformRoutes.playedGame(game.id),
    icon: "play",
    note: `En curso contra ${game.rival.name} · con ${color} · ${moves} ${moves === 1 ? "jugada" : "jugadas"}`,
  };
}

/** What a stamp says to a screen reader. */
function stampLabel(encounter: EncounterView): string {
  if (encounter.state === "beaten") return `${encounter.order}. ${encounter.name}: superado`;
  if (encounter.state === "available") return `${encounter.order}. ${encounter.name}: tu próximo rival`;
  return `${encounter.order}: cerrado`;
}

/**
 * «Jugar» in the new design system (2026-10-25, the owner's «M4 · /jugar»).
 * Every game against a bot is an encounter of an adventure, so the page is the
 * adventure's: the side column holds «Continuar la partida» while a game is
 * open and «Tus partidas» (`PlaySide`); the panel draws the notebook the
 * person is in big — its journey, the stamps of the rivals beaten, the next
 * one and «Continuar la aventura» to its map — and under it the shelf, the
 * notebooks that can be opened and the ones that are coming, which used to
 * be a page of their own (`/jugar/aventura` redirects here). The shelf is the
 * adventure's own paper (`AdventureShelf`, its wood, covers and fonts), an
 * island of that look inside the Material panel, as it was before the page
 * moved (brought back on 2026-10-26).
 *
 * The owner's design also has «Partida libre» (gone with free play) and
 * «Contra una persona» (playing a person does not exist): neither is drawn.
 */
export function PlayHome({ progress, shelf, games, record, gamesHref, now }: PlayHomeProps) {
  const art = ADVENTURE_ART[progress.slug];
  const next = progress.current;
  const mapHref = platformRoutes.adventureMap(progress.slug);
  const Portrait: ComponentType | undefined = next ? ADVENTURE_PORTRAITS[progress.slug]?.[next.slug] : undefined;

  return (
    <div className="platform-workspace play-home">
      <div className="platform-workspace__side">
        <PlaySide
          label="Tus partidas"
          action={progress.openGame ? continueAction(progress.openGame) : null}
          games={games}
          record={record}
          gamesHref={gamesHref}
          now={now}
        />
      </div>

      <div className="platform-workspace__panel play-home__panel">
        {/* The page's name is the bar's; here it is said to a screen reader, as the page's heading. */}
        <h1 className="play-home__sr">Jugar</h1>

        <section className="play-home__adventure" aria-labelledby="play-home-adventure">
          {art && (
            <div className="adventure play-home__art">
              <JourneyMiniature
                adventure={progress.slug}
                art={art.miniature.wide}
                states={progress.encounters.map((encounter) => encounter.state)}
                variant="wide"
                label={`El viaje de ${progress.title}, con tus rivales superados`}
              />
            </div>
          )}

          <div className="play-home__story">
            <p className="play-home__eyebrow">Modo aventura</p>
            <h2 id="play-home-adventure" className="play-home__title">
              {progress.title}
            </h2>
            <p className="play-home__premise">{progress.premise}</p>

            <ol className="play-home__stamps" aria-label={`${progress.beaten} de ${progress.total} rivales superados`}>
              {progress.encounters.map((encounter) => (
                <li
                  key={encounter.order}
                  className={`play-home__stamp play-home__stamp_state_${encounter.state}`}
                  aria-label={stampLabel(encounter)}
                >
                  {encounter.state === "locked" ? (
                    <LockIcon variant="classic-solid" className="play-home__stamp-lock" />
                  ) : (
                    <span aria-hidden="true">{initialsOf(encounter.name)}</span>
                  )}
                </li>
              ))}
            </ol>

            <p className="play-home__count">
              <b>
                {progress.beaten} de {progress.total}
              </b>{" "}
              rivales superados · <b>{progress.stars}</b> {progress.stars === 1 ? "estrella" : "estrellas"}
            </p>

            {next ? (
              <div className="play-home__next">
                {Portrait && (
                  <svg className="play-home__portrait" viewBox="0 0 100 112" aria-hidden="true">
                    <Portrait />
                  </svg>
                )}
                <div className="play-home__next-text">
                  <p className="play-home__next-label">
                    Próximo rival · N.º {String(next.order).padStart(2, "0")}
                    {next.attempts > 0 ? ` · Intento ${next.attempts + 1}` : ""}
                  </p>
                  <p className="play-home__next-name">
                    {next.name} <span className="play-home__next-role">· {next.role}</span>
                  </p>
                  <p className="play-home__next-facts">
                    ≈ {next.elo} · {next.difficultyLabel} · {next.zoneName}
                  </p>
                </div>
              </div>
            ) : (
              <p className="play-home__next play-home__next_state_done">
                Cuaderno terminado: superaste a los {progress.total} rivales.
              </p>
            )}

            <div className="play-home__actions">
              <Link href={mapHref} className={mdButton("filled", "md")}>
                {progress.isComplete ? (
                  <MapIcon variant="classic-solid" className="platform-md-icon" />
                ) : (
                  <PlayIcon variant="classic-solid" className="platform-md-icon" />
                )}
                {progress.isComplete ? "Abrir el mapa" : "Continuar la aventura"}
              </Link>
              <a href={`#${SHELF_ID}`} className={mdButton("text", "md")}>
                <ArrowDownIcon variant="classic-solid" className="platform-md-icon" />
                Ver los cuadernos
              </a>
            </div>
          </div>
        </section>

        {/* The adventure's paper shelf (2026-10-26, the owner's earlier design brought back): every
            notebook, the ones that can be opened standing open and the ones coming closed on the boards. */}
        <div id={SHELF_ID} className="play-home__shelf">
          <AdventureShelf shelf={shelf} />
        </div>
      </div>
    </div>
  );
}
