import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameAside } from "@/components/platform/sections/studies/game-view/game-aside.comp";
import { GameViewSection } from "@/components/platform/sections/studies/game-view/game-view.section";
import { platformRoutes } from "@/lib/platform-routes";
import {
  getClassGames,
  getGameById,
  getGameResultOptions,
  getShareableStudents,
  getStudyById,
  getStudyKinds,
  getStudyPageOfGame,
} from "@/services/studies/studies.service";
import { canShareStudy } from "@/services/studies/study-rules";
import "./game-page.css";

interface GamePageProps {
  params: Promise<{ studyId: string; gameId: string }>;
  /**
   * `error`: what a server action bounced with (a delete without confirmation,
   * a new game that did not validate). `pagina`: which page of the study's
   * games the aside lists; without it, the one the current game falls on.
   */
  searchParams: Promise<{ error?: string; pagina?: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  return game ? { title: `${game.white} – ${game.black}` } : {};
}

/**
 * Two columns: the study, in the aside, and the game, on the board. The page
 * loads and hands over; what each column shows is decided inside it, with
 * the permission table of `services/studies/study-rules`.
 */
export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { studyId, gameId } = await params;
  const { error, pagina } = await searchParams;
  // `getGameById` goes through the DAL, so this first await acts as the session
  // border. The study is requested afterwards for the aside.
  const game = await getGameById(studyId, gameId);
  if (!game) notFound();

  // The study is read on this screen — its own URL only redirects here — so the
  // aside carries it: its games around the current one, and for its owner the
  // study's actions and, for a collection, who it is shared with.
  const page = pagina ? Number.parseInt(pagina, 10) : await getStudyPageOfGame(studyId, gameId);
  const study = await getStudyById(studyId, page);
  if (!study) notFound();

  // The catalogs feed forms that only exist when writing is allowed, so for
  // what arrives ready-made — course databases, received collections — nothing
  // is queried and the aside gets empty lists. The results are asked for when
  // EITHER modal can render: the game's ("Editar") or the study's ("Nueva
  // partida"), or the result dropdown would come out empty the day the two
  // conditions stop coinciding.
  const canWrite = study.permissions.canEditGames;
  const [results, classGames, kinds, students] = await Promise.all([
    canWrite || game.canEdit ? getGameResultOptions() : [],
    canWrite ? getClassGames() : [],
    canWrite ? getStudyKinds() : [],
    canShareStudy(study) ? getShareableStudents() : [],
  ]);

  const pageHref = (target: number) => `${platformRoutes.gameDetail(studyId, gameId)}?pagina=${target}`;

  return (
    <div className="platform-page game-page">
      <div className="game-page__layout">
        <GameAside
          game={game}
          study={study}
          results={results}
          classGames={classGames}
          kinds={kinds}
          students={students}
          pageHref={pageHref}
        />
        <GameViewSection game={game} errorCode={error} />
      </div>
    </div>
  );
}
