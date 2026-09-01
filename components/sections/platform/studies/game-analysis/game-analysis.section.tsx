import Link from "next/link";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { deleteStudyGame, updateGameDetails } from "@/services/studies/studies.actions";
import type { GameView, StudyKindOption } from "@/services/studies/studies.types";
import { GameFields } from "../game-fields.comp";
import { GameAnalysisBoard } from "./game-analysis-board.comp";
import "./game-analysis.section.css";

interface GameAnalysisSectionProps {
  game: GameView;
  results: StudyKindOption[];
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  gameInClasses:
    "Esta partida está usada en el contenido de alguna clase. Si la borras, esos bloques se quedarán vacíos. Marca la casilla para confirmarlo.",
};

/**
 * Tres tarjetas independientes —datos, análisis y borrado— con el mismo criterio
 * que el editor de lecciones: son tres decisiones distintas y guardar una no
 * debería arrastrar a las otras.
 *
 * El análisis no lleva botón: se guarda solo.
 */
export function GameAnalysisSection({ game, results, errorCode }: GameAnalysisSectionProps) {
  const gameHref = platformRoutes.gameDetail(game.studyId, game.id);
  const heading = game.title ?? `${game.white} – ${game.black}`;

  return (
    <section className="game-analysis">
      <nav className="game-analysis__breadcrumb" aria-label="Ruta de estudios">
        <Link href={platformRoutes.studies} className="game-analysis__breadcrumb-link">
          Mis estudios
        </Link>
        <span className="game-analysis__breadcrumb-separator">/</span>
        <Link href={game.studyHref} className="game-analysis__breadcrumb-link">
          {game.studyName}
        </Link>
        <span className="game-analysis__breadcrumb-separator">/</span>
        <Link href={gameHref} className="game-analysis__breadcrumb-link">
          {heading}
        </Link>
        <span className="game-analysis__breadcrumb-separator">/</span>
        <span className="game-analysis__breadcrumb-current">Analizar</span>
      </nav>

      <header className="game-analysis__head">
        <h1 className="platform-page__title">{heading}</h1>
        <p className="platform-page__subtitle">
          Juega sobre el tablero para construir la partida. Se guarda sola mientras trabajas.
        </p>
      </header>

      {errorCode && <PlatformNotice message={ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

      <section className="platform-card">
        <h2 className="platform-card__title">Análisis</h2>
        <GameAnalysisBoard studyId={game.studyId} gameId={game.id} pgn={game.pgn} />
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Datos de la partida</h2>
        <form action={updateGameDetails.bind(null, game.studyId, game.id)} className="game-analysis__form">
          <GameFields
            results={results}
            titleHint="Cómo se distingue esta partida dentro del estudio. Puedes dejarlo vacío."
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
          />
          <p className="game-analysis__note">
            Al guardar, estos datos se escriben también en las cabeceras del PGN, para que un PGN exportado
            diga lo mismo que esta ficha.
          </p>
          <button type="submit" className="platform-button">
            Guardar datos
          </button>
        </form>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Borrar la partida</h2>
        <form action={deleteStudyGame.bind(null, game.studyId, game.id)} className="game-analysis__delete">
          <p className="game-analysis__note">
            Se borra la partida entera, con sus variantes y comentarios. No se puede deshacer.
          </p>
          {game.classBlockCount > 0 && (
            <label className="game-analysis__confirm">
              <input type="checkbox" name="confirmClassBlocks" value="yes" />
              Esta partida se usa en {game.classBlockCount} bloque
              {game.classBlockCount === 1 ? "" : "s"} de clase. Entiendo que se quedarán vacíos.
            </label>
          )}
          <button type="submit" className="platform-button platform-button_variant_danger">
            Borrar partida
          </button>
        </form>
      </section>

      <p className="game-analysis__back">
        <Link href={gameHref} className="platform-button platform-button_variant_secondary">
          Volver a la partida
        </Link>
      </p>
    </section>
  );
}
