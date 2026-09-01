import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { StudyDetail } from "@/services/studies/studies.types";
import { GameTable } from "./game-table.comp";
import "./study-detail.section.css";

interface StudyDetailSectionProps {
  study: StudyDetail;
}

export function StudyDetailSection({ study }: StudyDetailSectionProps) {
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

      {!study.isCourseStudy && (
        <p className="study-detail__new-game">
          <Link href={platformRoutes.newStudyGame(study.id)} className="platform-button">
            Nueva partida
          </Link>
        </p>
      )}

      {study.games.length > 0 ? (
        <GameTable games={study.games} />
      ) : (
        <EmptyState
          title="Sin partidas todavía"
          description="Este estudio no tiene partidas. Crea una para empezar."
        />
      )}
    </section>
  );
}
