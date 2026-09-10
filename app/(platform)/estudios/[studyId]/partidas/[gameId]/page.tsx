import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameViewSection } from "@/components/platform/sections/studies/game-view/game-view.section";
import { EditGame } from "@/components/platform/sections/studies/game-view/edit-game.comp";
import { NewGame } from "@/components/platform/sections/studies/study-detail/new-game.comp";
import { getClassGames, getGameById, getGameResultOptions, getStudyById } from "@/services/studies/studies.service";
import "./game-page.css";

interface GamePageProps {
  params: Promise<{ studyId: string; gameId: string }>;
  /** What deleting without confirmation returns: the game is cited in classes. */
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  return game ? { title: `${game.white} – ${game.black}` } : {};
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { studyId, gameId } = await params;
  const { error } = await searchParams;
  // `getGameById` goes through the DAL, so this first await acts as the session
  // border. The study is requested afterwards for the aside's listing.
  const game = await getGameById(studyId, gameId);
  if (!game) notFound();

  const study = await getStudyById(studyId);
  const siblings = study?.games ?? [];
  const canWrite = study !== null && !study.isCourseStudy;

  // The results are requested by BOTH modals of the aside, and each one renders
  // under its own condition: they are fetched when either holds, or the result
  // dropdown would come out empty the day the two stop coinciding.
  const [results, classGames] = await Promise.all([
    canWrite || game.canEdit ? getGameResultOptions() : [],
    canWrite ? getClassGames() : [],
  ]);
  return (
    <div className="platform-page game-page">
      <GameViewSection
        game={game}
        siblings={siblings}
        errorCode={error}
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
          canWrite && study ? (
            <NewGame
              studyId={study.id}
              studyName={study.name}
              results={results}
              classGames={classGames}
            />
          ) : undefined
        }
      />
    </div>
  );
}
