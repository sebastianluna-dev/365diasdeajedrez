import { EmptyState } from "@/components/common/empty-state.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { DeleteStudy } from "@/components/sections/platform/studies/studies-list/delete-study.comp";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import type { ClassGameItem, StudentOption, StudyDetail, StudyKindOption } from "@/services/studies/studies.types";
import { EditStudy } from "./edit-study.comp";
import { GameTable } from "./game-table.comp";
import { NewGame } from "./new-game.comp";
import { ShareCollection } from "./share-collection.comp";
import "./study-detail.section.css";

interface StudyDetailSectionProps {
  study: StudyDetail;
  /** Tipos que el alumno puede poner al editar. Vacío en bases de curso. */
  kinds: StudyKindOption[];
  /** Resultados del catálogo, para el formulario de partida en blanco. */
  results: StudyKindOption[];
  /** Partidas vistas en clase que puede copiarse. Vacío = no sale esa pestaña. */
  classGames: ClassGameItem[];
  /** Alumnos a los que repartir, si esto es una colección propia de un maestro. */
  students: StudentOption[];
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  confirmStudyDelete: "Este estudio tiene contenido. Marca la casilla para confirmar que quieres borrarlo.",
};

export function StudyDetailSection({
  study,
  kinds,
  results,
  classGames,
  students,
  errorCode,
}: StudyDetailSectionProps) {
  // Lo que puede hacer quien mira sale de services/studies/study-rules, la misma
  // tabla que aplican las server actions: aquí sólo se decide qué se enseña.
  const canWrite = study.permissions.canEditGames;
  // El panel de reparto es del DUEÑO de una colección; a quien la recibe le
  // llega `shares` vacío y además no pasa este filtro.
  const canShare = study.kindCode === DATABASE_KIND.COLLECTION && study.permissions.canDelete;

  return (
    <section className="study-detail">
      <header className="study-detail__head">
        <div className="study-detail__heading">
          <div className="study-detail__tags">
            <span className="study-detail__kind">{study.kindLabel}</span>
            {study.courseName && <span className="study-detail__origin">{study.courseName}</span>}
            {study.sharedByName && (
              <span className="study-detail__origin">Te la compartió {study.sharedByName}</span>
            )}
            {!canWrite && <span className="study-detail__readonly">Sólo lectura</span>}
          </div>

          <h1 className="study-detail__name">{study.name}</h1>

          <p className="study-detail__meta">
            {study.description && <span>{study.description}</span>}
            {study.description && <span className="study-detail__dot">·</span>}
            <span>
              {study.games.length} {study.games.length === 1 ? "partida" : "partidas"}
            </span>
            <span className="study-detail__dot">·</span>
            <span>Creado el {study.createdAtLabel}</span>
          </p>
        </div>

        {canWrite && (
          <div className="study-detail__actions">
            {study.permissions.canDelete && (
              <DeleteStudy
                id={study.id}
                name={study.name}
                gameCount={study.games.length}
                citedGameCount={study.citedGameCount}
                trigger="button"
              />
            )}
            <EditStudy
              id={study.id}
              name={study.name}
              description={study.description}
              kindCode={study.kindCode}
              kindLabel={study.kindLabel}
              kinds={kinds}
              canChangeKind={study.permissions.canChangeKind}
            />
            <NewGame
              studyId={study.id}
              studyName={study.name}
              results={results}
              classGames={classGames}
            />
          </div>
        )}
      </header>

      {errorCode && <PlatformNotice message={ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

      {canShare && <ShareCollection studyId={study.id} shares={study.shares} students={students} />}

      {study.games.length > 0 ? (
        <GameTable studyId={study.id} games={study.games} canReorder={canWrite} />
      ) : (
        <EmptyState
          title="Sin partidas todavía"
          description={
            canWrite
              ? "Este estudio no tiene partidas. Crea una para empezar."
              : "Todavía no tiene partidas."
          }
        />
      )}
    </section>
  );
}
