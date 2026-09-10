import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { DeleteStudy } from "@/components/platform/sections/studies/studies-list/delete-study.comp";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import type { ClassGameItem, StudentOption, StudyDetail, StudyKindOption } from "@/services/studies/studies.types";
import { EditStudy } from "./edit-study.comp";
import { GameTable } from "./game-table.comp";
import { NewGame } from "./new-game.comp";
import { ShareCollection } from "./share-collection.comp";
import "./study-detail.section.css";

interface StudyDetailSectionProps {
  study: StudyDetail;
  /** Kinds the student can set when editing. Empty in course databases. */
  kinds: StudyKindOption[];
  /** Results from the catalog, for the blank-game form. */
  results: StudyKindOption[];
  /** Games seen in class that can be copied. Empty = that tab does not appear. */
  classGames: ClassGameItem[];
  /** Students to hand it to, if this is a teacher's own collection. */
  students: StudentOption[];
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  confirmStudyDelete: "Este estudio tiene contenido. Marca la casilla para confirmar que quieres borrarlo.",
  fen: "Esa posición de partida no es válida. Revisa el FEN.",
};

export function StudyDetailSection({
  study,
  kinds,
  results,
  classGames,
  students,
  errorCode,
}: StudyDetailSectionProps) {
  // What the viewer can do comes from services/studies/study-rules, the same
  // table the server actions apply: here only what is shown is decided.
  const canWrite = study.permissions.canEditGames;
  // The sharing panel belongs to the OWNER of a collection; whoever receives
  // it gets `shares` empty and does not pass this filter either.
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
