"use client";

import { type ReactNode, useState } from "react";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { federationFlag } from "@/lib/chess/federations";
import type { GameView, StudyGameItem } from "@/services/studies/studies.types";
import { GameAside } from "./game-aside.comp";
import { GameTools } from "./game-tools.comp";
import "./game-view.section.css";

interface GameViewSectionProps {
  game: GameView;
  /** Todas las del estudio, la actual incluida: alimentan el aside. */
  siblings: StudyGameItem[];
  /** Modal de nueva partida; ausente en las bases de curso. */
  newGame?: ReactNode;
  /** Modal de datos de la partida; ausente en las bases de curso. */
  editGame?: ReactNode;
}

interface PlayerProps {
  name: string;
  elo?: number;
  title?: string;
  country?: string;
  side: "white" | "black";
}

function Player({ name, elo, title, country, side }: PlayerProps) {
  const flag = federationFlag(country);

  return (
    <>
      <span className={`game-view__chip game-view__chip_side_${side}`} aria-hidden="true" />

      {country && <span className="game-view__player-country">{country}</span>}
      {/* La bandera es adorno del código que va al lado: si el código no está
          en la tabla no se pinta nada, en vez de inventarse una. */}
      {flag && (
        <span className="game-view__player-flag" aria-hidden="true">
          {flag}
        </span>
      )}
      {title && <span className="game-view__player-title">{title}</span>}

      <span className="game-view__player-name">{name}</span>
      {elo !== undefined && <span className="game-view__player-elo">{elo}</span>}
    </>
  );
}

export function GameViewSection({ game, siblings, newGame, editGame }: GameViewSectionProps) {
  // El PGN vive aquí porque lo comparten el visor —que lo lee— y el panel de
  // herramientas —que lo escribe—. Si cada uno guardara el suyo, comentar una
  // jugada no se vería en la lista hasta recargar.
  const [pgn, setPgn] = useState(game.pgn);
  const [currentPath, setCurrentPath] = useState("");

  return (
    <section className="game-view">
      <GameAside game={game} siblings={siblings} newGame={newGame} editGame={editGame} />

      <div className="game-view__board">
        <GameViewer
          pgn={pgn}
          // Sin cabecera en el panel: los jugadores ya están en las tiras del
          // tablero y en la ficha del aside, y repetirlos aquí robaba alto a
          // las jugadas, que es lo que se viene a mirar.
          // En Mis estudios la partida se recorre: los controles van junto a
          // las jugadas, no bajo el tablero.
          controls="panel"
          onPathChange={setCurrentPath}
          players={{
            white: (
              <Player
                name={game.white}
                elo={game.whiteElo}
                title={game.whiteTitle}
                country={game.whiteCountry}
                side="white"
              />
            ),
            black: (
              <Player
                name={game.black}
                elo={game.blackElo}
                title={game.blackTitle}
                country={game.blackCountry}
                side="black"
              />
            ),
          }}
          boardFooter={
            <GameTools
              studyId={game.studyId}
              gameId={game.id}
              pgn={pgn}
              currentPath={currentPath}
              canEdit={game.canEdit}
              onPgnChange={setPgn}
            />
          }
        />
      </div>
    </section>
  );
}
