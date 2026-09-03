import Link from "next/link";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { StudiesNavigation } from "@/components/common/studies-navigation.comp";
import { EditGame } from "@/components/sections/platform/studies/game-view/edit-game.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { GameView, StudyKindOption } from "@/services/studies/studies.types";
import { DeleteGame } from "./delete-game.comp";
import { GameEditBoard } from "./game-edit-board.comp";
import "./game-edit.section.css";

interface GameEditSectionProps {
  game: GameView;
  results: StudyKindOption[];
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  gameInClasses:
    "Esta partida está usada en el contenido de alguna clase. Si la borras, esos bloques se quedarán vacíos. Marca la casilla para confirmarlo.",
};

/**
 * Edición de una partida del estudio.
 *
 * Las jugadas no llevan botón de guardar: se guardan solas mientras se trabaja.
 * Los datos y el borrado son decisiones aparte y viven en sus propios modales,
 * para que la pantalla sea el tablero y no un formulario con un tablero encima.
 */
export function GameEditSection({ game, results, errorCode }: GameEditSectionProps) {
  const gameHref = platformRoutes.gameDetail(game.studyId, game.id);
  const heading = game.title ?? `${game.white} – ${game.black}`;

  return (
    <section className="game-edit">
      <StudiesNavigation
        studyName={game.studyName}
        studyHref={game.studyHref}
        gameName={heading}
        gameHref={gameHref}
        current="Editar"
      />

      <header className="game-edit__head">
        <div className="game-edit__heading">
          <h1 className="game-edit__title">Editar la partida</h1>
          <p className="game-edit__subtitle">
            Juega sobre el tablero para construir la línea. Se guarda sola mientras trabajas.
          </p>
        </div>

        <div className="game-edit__actions">
          <DeleteGame
            studyId={game.studyId}
            gameId={game.id}
            name={heading}
            classBlockCount={game.classBlockCount}
          />

          <EditGame
            studyId={game.studyId}
            gameId={game.id}
            results={results}
            values={{
              title: game.title,
              white: game.white,
              black: game.black,
              whiteElo: game.whiteElo,
              blackElo: game.blackElo,
              resultCode: game.resultCode,
              playedAtValue: game.playedAtValue,
              event: game.event,
              site: game.site,
              round: game.round,
              eco: game.eco,
            }}
            label="Datos de la partida"
          />

          <Link href={gameHref} className="platform-button game-edit__done">
            Terminar
          </Link>
        </div>
      </header>

      {errorCode && <PlatformNotice message={ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

      <GameEditBoard studyId={game.studyId} gameId={game.id} pgn={game.pgn} />
    </section>
  );
}
