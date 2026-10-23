import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { StudyAside } from "@/components/platform/sections/studies/game-view/study-aside.comp";
import {
  getClassGames,
  getGameResultOptions,
  getShareableStudents,
  getStudyKinds,
  getStudyWithGames,
} from "@/services/studies/studies.service";
import { canShareStudy } from "@/services/studies/study-rules";
import "./game-page.css";

interface StudyGamesLayoutProps {
  children: ReactNode;
  params: Promise<{ studyId: string }>;
}

/**
 * What every game page of a study shares, in the new design system
 * (2026-10-23, «M4» of the owner's canvas): the workspace, the bar's search,
 * the study's side column — its name, «Nueva partida», its games to jump
 * between. It is a layout so that going from one game to
 * another leaves all of that as it is: Next renders the page again, not
 * this, and the list keeps its scroll and does not blink. The page under it
 * brings what is about the game — its record and the board.
 *
 * So nothing here may depend on the current game or on the query string: the
 * layout is not told when they change. Which game is the current one is read
 * from the address in the browser (`StudyGames`). After a
 * server action that revalidates, the layout is rendered again like the
 * page, which is how a renamed, reordered, new or deleted game reaches the
 * list.
 */
export default async function StudyGamesLayout({ children, params }: StudyGamesLayoutProps) {
  const { studyId } = await params;
  // `getStudyWithGames` goes through the DAL, so this await is the session's
  // border here; the page has its own, since a layout is not run again on
  // every navigation.
  const study = await getStudyWithGames(studyId);
  if (!study) notFound();

  // The catalogs feed forms that only exist when writing is allowed, so for
  // what arrives ready-made — course databases, received collections — nothing
  // is queried and the aside gets empty lists.
  const canWrite = study.permissions.canEditGames;
  const [results, classGames, kinds, students] = await Promise.all([
    canWrite ? getGameResultOptions() : [],
    canWrite ? getClassGames() : [],
    canWrite ? getStudyKinds() : [],
    canShareStudy(study) ? getShareableStudents() : [],
  ]);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed game-page">
      <div className="platform-workspace">
        <div className="platform-workspace__side">
          <StudyAside study={study} results={results} classGames={classGames} kinds={kinds} students={students} />
        </div>

        <section className="platform-workspace__panel game-page__panel" aria-label={study.name}>
          {/* The page: the board, the game's record heading its moves' column. */}
          {children}
        </section>
      </div>
    </div>
  );
}
