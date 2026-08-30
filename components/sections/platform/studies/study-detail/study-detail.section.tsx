import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { importPgnGames } from "@/services/studies/studies.actions";
import type { StudyDetail } from "@/services/studies/studies.types";
import { GameTable } from "./game-table.comp";
import "./study-detail.section.css";

interface StudyDetailSectionProps {
  study: StudyDetail;
}

export function StudyDetailSection({ study }: StudyDetailSectionProps) {
  const importAction = importPgnGames.bind(null, study.id);

  return (
    <section className="study-detail">
      <nav className="study-detail__breadcrumb" aria-label="Ruta de estudios">
        <Link href={platformRoutes.studies} className="study-detail__breadcrumb-link">
          Mis estudios
        </Link>
        <span className="study-detail__breadcrumb-separator">/</span>
        <span className="study-detail__breadcrumb-current">{study.name}</span>
      </nav>

      <header className="platform-page__head">
        <div className="study-detail__tags">
          <span className="platform-tag platform-tag_variant_accent">{study.kindLabel}</span>
          {study.courseName && <span className="platform-tag">{study.courseName}</span>}
          {study.isCourseStudy && <span className="platform-tag">Sólo lectura</span>}
        </div>
        <h1 className="platform-page__title">{study.name}</h1>
        {study.description && <p className="platform-page__subtitle">{study.description}</p>}
      </header>

      {study.games.length > 0 ? (
        <GameTable games={study.games} />
      ) : (
        <EmptyState
          title="Sin partidas todavía"
          description="Este estudio no tiene partidas. Crea una o importa un PGN para empezar."
        />
      )}

      {!study.isCourseStudy && (
        <form className="study-detail__import platform-card" action={importAction}>
          <h2 className="platform-card__title">Importar partidas (PGN)</h2>
          <p className="study-detail__import-hint">
            Pega una o varias partidas en formato PGN: cada una se guardará como una partida del estudio.
          </p>
          <textarea
            className="study-detail__import-field"
            name="pgn"
            rows={8}
            required
            placeholder={'[Event "Torneo"]\n[White "Capablanca"]\n[Black "Alekhine"]\n\n1. e4 e5 2. Cf3 *'}
          />
          <button type="submit" className="platform-button platform-button_variant_secondary">
            Importar partidas
          </button>
        </form>
      )}
    </section>
  );
}
