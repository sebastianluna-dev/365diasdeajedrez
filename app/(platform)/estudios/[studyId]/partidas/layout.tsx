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
 * What every game page of a study shares: the page's frame and the study's
 * column — its name, its games to jump between, «Nueva partida». It is a
 * layout so that going from one game to another leaves all of that as it is:
 * Next renders the page again, not this, and the list keeps its scroll and
 * does not blink. The page under it brings what is about the game — the board
 * and the game's record.
 *
 * So nothing here may depend on the current game or on the query string: the
 * layout is not told when they change. Which row is the current one is read
 * from the address in the browser (`StudyGames`). After a server action that
 * revalidates, the layout is rendered again like the page, which is how a
 * renamed, reordered, new or deleted game reaches the list.
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
    <div className="platform-page game-page platform-page_width_wide">
      <div className="game-page__layout">
        {/* The page first in the markup — the board, then the game's record —
            and the study after it; the stylesheet places the three. */}
        {children}
        <StudyAside study={study} results={results} classGames={classGames} kinds={kinds} students={students} />
      </div>
    </div>
  );
}
