import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameViewSection } from "@/components/platform/sections/studies/game-view/game-view.section";
import { EditGame } from "@/components/platform/sections/studies/game-view/edit-game.comp";
import { DeleteStudy } from "@/components/platform/sections/studies/studies-list/delete-study.comp";
import { EditStudy } from "@/components/platform/sections/studies/study-detail/edit-study.comp";
import { NewGame } from "@/components/platform/sections/studies/study-detail/new-game.comp";
import { ShareCollection } from "@/components/platform/sections/studies/study-detail/share-collection.comp";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
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

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { studyId, gameId } = await params;
  const { error, pagina } = await searchParams;
  // `getGameById` goes through the DAL, so this first await acts as the session
  // border. The study is requested afterwards for the aside's listing.
  const game = await getGameById(studyId, gameId);
  if (!game) notFound();

  // The study is read on this screen — its own URL only redirects here — so the
  // aside carries the study: its games around the current one, and for its
  // owner the study's actions and, for a collection, who it is shared with.
  const page = pagina ? Number.parseInt(pagina, 10) : await getStudyPageOfGame(studyId, gameId);
  const study = await getStudyById(studyId, page);
  if (!study) notFound();

  // What the viewer can do comes from services/studies/study-rules, the same
  // table the server actions apply: here only what is shown is decided.
  const canWrite = study.permissions.canEditGames;
  // The sharing card belongs to the OWNER of a collection; whoever receives
  // it gets `shares` empty and does not pass this filter either.
  const canShare = study.kindCode === DATABASE_KIND.COLLECTION && study.permissions.canDelete;

  // The results are requested by BOTH modals of the aside, and each one renders
  // under its own condition: they are fetched when either holds, or the result
  // dropdown would come out empty the day the two stop coinciding.
  const [results, classGames, kinds, students] = await Promise.all([
    canWrite || game.canEdit ? getGameResultOptions() : [],
    canWrite ? getClassGames() : [],
    canWrite ? getStudyKinds() : [],
    canShare ? getShareableStudents() : [],
  ]);

  const pageHref = (target: number) => `${platformRoutes.gameDetail(studyId, gameId)}?pagina=${target}`;

  return (
    <div className="platform-page game-page">
      <GameViewSection
        game={game}
        siblings={study.games}
        studyName={study.name}
        gameCount={study.gameCount}
        errorCode={error}
        // Reordering needs the whole list in hand: with more than one page the
        // order is read-only.
        canReorder={canWrite && study.pageCount === 1}
        pages={
          study.pageCount > 1
            ? {
                page: study.page,
                pageCount: study.pageCount,
                previousHref: study.page > 1 ? pageHref(study.page - 1) : undefined,
                nextHref: study.page < study.pageCount ? pageHref(study.page + 1) : undefined,
              }
            : undefined
        }
        studyTools={
          canWrite ? (
            <>
              <EditStudy
                id={study.id}
                name={study.name}
                description={study.description}
                kindCode={study.kindCode}
                kindLabel={study.kindLabel}
                kinds={kinds}
                canChangeKind={study.permissions.canChangeKind}
                size="inline"
              />
              {study.permissions.canDelete && (
                <DeleteStudy
                  id={study.id}
                  name={study.name}
                  gameCount={study.gameCount}
                  citedGameCount={study.citedGameCount}
                  trigger="inline"
                />
              )}
            </>
          ) : undefined
        }
        editGame={
          game.canEdit ? (
            /* The whole record, without going field by field: `GameView` already
               contains every field of `GameFieldValues`, and listing them here is
               how the title and the federation got lost once — the form asked for
               them and this list did not pass them, so saving erased them. */
            <EditGame studyId={game.studyId} gameId={game.id} results={results} values={game} />
          ) : undefined
        }
        newGame={
          canWrite ? (
            <NewGame studyId={study.id} studyName={study.name} results={results} classGames={classGames} />
          ) : undefined
        }
        share={
          canShare ? (
            <ShareCollection studyId={study.id} shares={study.shares} students={students} layout="compact" />
          ) : undefined
        }
      />
    </div>
  );
}
