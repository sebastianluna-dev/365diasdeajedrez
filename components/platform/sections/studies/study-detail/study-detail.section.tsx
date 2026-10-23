import { STUDY_ERROR_MESSAGES } from "@/constants/platform/student-messages.const";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { StudyAside } from "@/components/platform/sections/studies/game-view/study-aside.comp";
import type { ClassGameItem, StudentOption, StudyDetail, StudyKindOption } from "@/services/studies/studies.types";
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

/**
 * The study WITHOUT games, in the new design system (2026-10-23). A study is
 * read on its game page — the study's own URL redirects to a game — so this
 * section only ever renders when there is no game to go to. It is the game
 * pages' workspace with nothing on the board: the study's side column
 * (`StudyAside`: its name and kind, the sliders that open its form — where
 * it is edited and deleted —, «Nuevo capítulo» as the FAB and, for a
 * collection's owner, who it is shared with), and in the panel the trail
 * and the empty state.
 */
export function StudyDetailSection({
  study,
  kinds,
  results,
  classGames,
  students,
  errorCode,
}: StudyDetailSectionProps) {
  const canWrite = study.permissions.canEditGames;

  return (
    <div className="platform-workspace">
      <div className="platform-workspace__side">
        <StudyAside study={study} results={results} classGames={classGames} kinds={kinds} students={students} />
      </div>

      <section className="platform-workspace__panel study-detail" aria-label={study.name}>
        {errorCode && <PlatformNotice message={STUDY_ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

        <EmptyState
          title="Sin capítulos todavía"
          description={
            canWrite
              ? "Este estudio no tiene capítulos. Agrega uno con «Nuevo capítulo»."
              : "Todavía no tiene capítulos."
          }
        />
      </section>
    </div>
  );
}
