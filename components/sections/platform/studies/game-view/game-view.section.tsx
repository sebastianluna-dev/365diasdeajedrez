import Link from "next/link";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { GameView } from "@/services/studies/studies.types";
import "./game-view.section.css";

interface GameViewSectionProps {
  game: GameView;
}

export function GameViewSection({ game }: GameViewSectionProps) {
  return (
    <section className="game-view">
      <nav className="game-view__breadcrumb" aria-label="Ruta de estudios">
        <Link href={platformRoutes.studies} className="game-view__breadcrumb-link">
          Mis estudios
        </Link>
        <span className="game-view__breadcrumb-separator">/</span>
        <Link href={game.studyHref} className="game-view__breadcrumb-link">
          {game.studyName}
        </Link>
        <span className="game-view__breadcrumb-separator">/</span>
        <span className="game-view__breadcrumb-current">
          {game.white} – {game.black}
        </span>
      </nav>

      <header className="game-view__head">
        <h1 className="platform-page__title">
          {game.white}
          {game.whiteElo ? ` (${game.whiteElo})` : ""} – {game.black}
          {game.blackElo ? ` (${game.blackElo})` : ""}
        </h1>
        <p className="platform-page__subtitle">
          {[game.event, game.site, game.playedAtLabel, game.eco, game.resultLabel]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {game.canEdit && (
        <p className="game-view__analyse">
          <Link href={platformRoutes.gameEdit(game.studyId, game.id)} className="platform-button">
            Editar
          </Link>
        </p>
      )}

      <GameViewer pgn={game.pgn} />

      <p className="game-view__source">Origen: {game.sourceLabel}</p>
    </section>
  );
}
