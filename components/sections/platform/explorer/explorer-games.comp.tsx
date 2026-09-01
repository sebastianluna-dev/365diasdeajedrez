"use client";

import Link from "next/link";
import type { ExplorerGame } from "@/services/game-explorer/game-explorer.types";
import "./explorer-games.comp.css";

interface ExplorerGamesProps {
  games: ExplorerGame[];
  totalGames: number;
  isSearching: boolean;
}

/**
 * Las partidas que pasaron por la posición actual, la más reciente primero.
 *
 * La lista está acotada y el total no: el número del encabezado es el de todas
 * las partidas encontradas, aunque abajo se vean menos.
 *
 * Cada partida lleva su origen (estudio de alumno, curso, profesorado) porque
 * no significa lo mismo que una continuación la jugaran veinte alumnos que
 * verla en veinte partidas magistrales del material del curso.
 */
export function ExplorerGames({ games, totalGames, isSearching }: ExplorerGamesProps) {
  return (
    <section className="explorer-games">
      <h2 className="explorer-games__title">
        {totalGames === 0
          ? "Partidas"
          : `${totalGames} ${totalGames === 1 ? "partida encontrada" : "partidas encontradas"}`}
      </h2>

      {games.length === 0 ? (
        <p className="explorer-games__empty">
          {isSearching
            ? "Buscando…"
            : "Ninguna de las partidas que puedes ver ha pasado por esta posición."}
        </p>
      ) : (
        <>
          <ul className="explorer-games__list">
            {games.map((game) => {
              const content = (
                <>
                  <span className="explorer-games__players">
                    <span className="explorer-games__player">
                      {game.white}
                      {game.whiteElo && <span className="explorer-games__elo"> {game.whiteElo}</span>}
                    </span>
                    <span className="explorer-games__separator">–</span>
                    <span className="explorer-games__player">
                      {game.black}
                      {game.blackElo && <span className="explorer-games__elo"> {game.blackElo}</span>}
                    </span>
                  </span>

                  <span className="explorer-games__meta">
                    <span className="explorer-games__result">{game.resultLabel}</span>
                    {game.event && <span className="explorer-games__event">{game.event}</span>}
                    {game.playedAtLabel && <span>{game.playedAtLabel}</span>}
                  </span>

                  <span className="explorer-games__tags">
                    <span className="explorer-games__tag">{game.originLabel}</span>
                    {game.seenInClass && (
                      <span className="explorer-games__tag explorer-games__tag_variant_class">Vista en clase</span>
                    )}
                  </span>
                </>
              );

              return (
                <li key={game.id} className="explorer-games__item">
                  {/* Sin enlace cuando no hay ninguna vista donde abrirla: antes
                      listarla sin destino que mandar a un 404. */}
                  {game.href ? (
                    <Link href={game.href} className="explorer-games__link">
                      {content}
                    </Link>
                  ) : (
                    <span className="explorer-games__link explorer-games__link_static">{content}</span>
                  )}
                </li>
              );
            })}
          </ul>

          {totalGames > games.length && (
            <p className="explorer-games__more">
              Se muestran las {games.length} más recientes de {totalGames}.
            </p>
          )}
        </>
      )}
    </section>
  );
}
