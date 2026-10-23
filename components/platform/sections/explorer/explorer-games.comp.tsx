"use client";

import Link from "next/link";
import { mdCard } from "@/lib/material/material-classes";
import type { ExplorerGame } from "@/services/game-explorer/game-explorer.types";
import { GAME_ORIGIN, type GameOriginCode } from "@/services/shared/game-origin";
import "./explorer-games.comp.css";

interface ExplorerGamesProps {
  games: ExplorerGame[];
  totalGames: number;
  isSearching: boolean;
}

/** The colour of each origin's tag, as a modifier: green a student's, blue a course's, amber the staff's. */
const ORIGIN_TONE: Record<GameOriginCode, string> = {
  [GAME_ORIGIN.STUDENT_STUDY]: "student",
  [GAME_ORIGIN.COURSE]: "course",
  [GAME_ORIGIN.EDITOR]: "staff",
};

/** A result as it is read: the PGN's draw, «1/2-1/2», with its halves. */
const resultText = (label: string) => label.replaceAll("1/2", "½");

/**
 * The games that went through the current position, most recent first, in
 * an outlined card of Material's (the new design system, 2026-10-23): a row
 * per game, as Gmail lists mail — the players with their Elo, the event and
 * the date, where it comes from and whether the student saw it in class, and
 * the result in a pill at the right.
 *
 * The list is capped and the total is not: the toolbar above says how many
 * went through, and the heading, when fewer are listed, of how many these
 * are the most recent.
 *
 * Each game carries its origin (student study, course, teaching staff) because
 * a continuation played by twenty students does not mean the same as seeing
 * it in twenty master games from the course material.
 */
export function ExplorerGames({ games, totalGames, isSearching }: ExplorerGamesProps) {
  return (
    <section className={`${mdCard("outlined")} explorer-games`}>
      <div className="explorer-games__head">
        <h2 className="explorer-games__title">Partidas</h2>
        {totalGames > games.length && games.length > 0 && (
          <p className="explorer-games__more">
            Las {games.length} más recientes de {totalGames}
          </p>
        )}
      </div>

      {games.length === 0 ? (
        <p className="explorer-games__empty">
          {isSearching ? "Buscando…" : "Ninguna de las partidas que puedes ver ha pasado por esta posición."}
        </p>
      ) : (
        <ul className="explorer-games__list">
          {games.map((game) => {
            const when = [game.event, game.playedAtLabel].filter(Boolean).join(" · ");
            const content = (
              <>
                <span className="explorer-games__main">
                  <span className="explorer-games__players">
                    {game.white}
                    {game.whiteElo !== undefined && <span className="explorer-games__elo"> {game.whiteElo}</span>}
                    <span className="explorer-games__separator"> — </span>
                    {game.black}
                    {game.blackElo !== undefined && <span className="explorer-games__elo"> {game.blackElo}</span>}
                  </span>

                  <span className="explorer-games__meta">
                    {when && <span className="explorer-games__when">{when}</span>}
                    <span className={`explorer-games__tag explorer-games__tag_origin_${ORIGIN_TONE[game.origin]}`}>
                      {game.originLabel}
                    </span>
                    {game.seenInClass && (
                      <span className="explorer-games__tag explorer-games__tag_mark_class">Vista en clase</span>
                    )}
                  </span>
                </span>

                <span className="explorer-games__result">{resultText(game.resultLabel)}</span>
              </>
            );

            return (
              <li key={game.id} className="explorer-games__item">
                {/* No link when there is no view to open it in: better to list it
                    without a destination than to send to a 404. */}
                {game.href ? (
                  <Link href={game.href} className="explorer-games__row">
                    {content}
                  </Link>
                ) : (
                  <span className="explorer-games__row explorer-games__row_kind_static">{content}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
