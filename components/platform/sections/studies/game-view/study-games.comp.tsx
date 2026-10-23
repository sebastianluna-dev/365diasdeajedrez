"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { GameList, type GameListItem } from "@/components/platform/shared/game-list/game-list.comp";
import { GameSettings, type GameSettingsActions } from "@/components/platform/shared/game-settings/game-settings.comp";
import { mdButton } from "@/lib/material/material-classes";
import { gamesOfPage, pageCountOf, pageOfGame } from "./study-games-page";
import "./study-games.comp.css";

interface StudyGamesProps {
  /** Every game of the study, in its order. */
  games: GameListItem[];
  /** How many of them the list shows at once. */
  pageSize: number;
  /** Saves a new order; only for a study that fits on one page (see `StudyAside`). */
  onReorder?: (orderedIds: string[]) => Promise<void>;
  /**
   * What a game's settings do. The rows carry no gear (2026-10-23): the game
   * on the board is configured from the card at the foot of the list, and
   * without them, for whoever only reads, there is none.
   */
  settings?: GameSettingsActions;
}

/**
 * The games of a study in the layout of its game pages. The layout is not
 * rendered again from one game to the next — that is why the list holds
 * still — so which game is the current one cannot arrive as a prop from the
 * server: it is read here from the address, the one thing that changes.
 *
 * For the same reason the list carries every game and its pages are turned
 * here, with no trip to the server. It opens on the page the current game
 * falls on, and goes back to it when one moves to another game.
 *
 * Under it, the game on the board: «Partida abierta», its name and result,
 * and «Configurar» for whoever may (2026-10-23, the owner's choice «B»). A
 * game is configured only once it is open, so the rows stay one line each.
 */
export function StudyGames({ games, pageSize, onReorder, settings }: StudyGamesProps) {
  const { gameId = "" } = useParams<{ gameId?: string }>();
  const pageCount = pageCountOf(games.length, pageSize);
  const ownPage = pageOfGame(games, gameId, pageSize);
  // The page that was turned to belongs to the game one was on when turning:
  // on another game it is forgotten, with no effect to reset it.
  const [turned, setTurned] = useState({ gameId, page: ownPage });
  const page = turned.gameId === gameId ? Math.min(turned.page, pageCount) : ownPage;
  const turnTo = (target: number) => setTurned({ gameId, page: target });
  const open = games.find((game) => game.id === gameId);

  return (
    <div className="study-games">
      {/* A list of its own per page: the scroll starts at the top of each. */}
      <GameList
        key={page}
        games={gamesOfPage(games, page, pageSize)}
        currentId={gameId}
        onReorder={onReorder}
        // The study's side column, in the new design system (2026-10-23).
        look="material"
      />

      {pageCount > 1 && (
        <nav className="study-games__pages" aria-label="Páginas de partidas">
          <button
            type="button"
            className={mdButton("text", "xs")}
            disabled={page <= 1}
            onClick={() => turnTo(page - 1)}
          >
            ← Anteriores
          </button>
          <span className="study-games__page-status">
            Página {page} de {pageCount}
          </span>
          <button
            type="button"
            className={mdButton("text", "xs")}
            disabled={page >= pageCount}
            onClick={() => turnTo(page + 1)}
          >
            Siguientes →
          </button>
        </nav>
      )}

      {open && (
        <section className="study-games__open" aria-label="Partida abierta">
          <p className="study-games__open-text">
            <span className="study-games__open-label">Partida abierta</span>
            <span className="study-games__open-name" title={open.name}>
              {open.name}
              {open.resultLabel !== "*" && ` · ${open.resultLabel}`}
            </span>
          </p>
          {settings && (
            <GameSettings
              game={{ ...open, orientationCode: open.orientationCode ?? "WHITE" }}
              isCurrent
              actions={settings}
              look="material"
              trigger="button"
            />
          )}
        </section>
      )}
    </div>
  );
}
