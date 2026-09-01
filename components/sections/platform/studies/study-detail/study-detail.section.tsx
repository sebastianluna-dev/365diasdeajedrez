import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { deleteStudy } from "@/services/studies/studies.actions";
import type { StudyDetail } from "@/services/studies/studies.types";
import { GameTable } from "./game-table.comp";
import "./study-detail.section.css";

interface StudyDetailSectionProps {
  study: StudyDetail;
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  confirmStudyDelete: "Este estudio tiene contenido. Marca la casilla para confirmar que quieres borrarlo.",
};

export function StudyDetailSection({ study, errorCode }: StudyDetailSectionProps) {
  const hasContent = study.games.length > 0 || study.citedGameCount > 0;

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

      {errorCode && <PlatformNotice message={ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

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

      {!study.isCourseStudy && (
        <section className="platform-card study-detail__danger">
          <h2 className="platform-card__title">Borrar el estudio</h2>
          <form action={deleteStudy.bind(null, study.id)} className="study-detail__delete">
            <p className="study-detail__delete-text">
              Se borra el estudio con sus {study.games.length} partida{study.games.length === 1 ? "" : "s"}, y con
              ellas sus variantes y comentarios. No se puede deshacer.
            </p>
            {hasContent && (
              <label className="study-detail__confirm">
                <input type="checkbox" name="confirmDelete" value="yes" />
                {study.citedGameCount > 0
                  ? `Entiendo que se borrará todo, y que ${study.citedGameCount} partida${study.citedGameCount === 1 ? " citada" : "s citadas"} en clases dejará${study.citedGameCount === 1 ? "" : "n"} esos bloques vacíos.`
                  : "Entiendo que se borrará todo su contenido."}
              </label>
            )}
            <button type="submit" className="platform-button platform-button_variant_danger">
              Borrar estudio
            </button>
          </form>
        </section>
      )}
    </section>
  );
}
