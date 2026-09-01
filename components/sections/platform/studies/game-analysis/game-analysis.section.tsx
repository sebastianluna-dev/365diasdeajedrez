import Link from "next/link";
import { AnalysisBoard } from "@/components/common/analysis-board/analysis-board.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { updateGamePgn } from "@/services/studies/studies.actions";
import type { GameView } from "@/services/studies/studies.types";
import "./game-analysis.section.css";

interface GameAnalysisSectionProps {
  game: GameView;
}

export function GameAnalysisSection({ game }: GameAnalysisSectionProps) {
  const gameHref = platformRoutes.gameDetail(game.studyId, game.id);

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
          {game.white} – {game.black}
        </Link>
        <span className="game-analysis__breadcrumb-separator">/</span>
        <span className="game-analysis__breadcrumb-current">Analizar</span>
      </nav>

      <header className="game-analysis__head">
        <h1 className="platform-page__title">
          {game.white} – {game.black}
        </h1>
        <p className="platform-page__subtitle">
          Añade variantes, comentarios y anotaciones. Se guardan en la partida al pulsar «Guardar».
        </p>
      </header>

      {/* El tablero publica el PGN en un input oculto, así que guardar es un
          envío de formulario normal y la action no sabe nada del editor. */}
      <form action={updateGamePgn.bind(null, game.studyId, game.id)} className="game-analysis__form">
        <AnalysisBoard name="pgn" defaultPgn={game.pgn} />

        <div className="game-analysis__actions">
          <button type="submit" className="platform-button platform-button_variant_primary">
            Guardar
          </button>
          <Link href={gameHref} className="platform-button">
            Volver a la partida
          </Link>
        </div>
      </form>
    </section>
  );
}
