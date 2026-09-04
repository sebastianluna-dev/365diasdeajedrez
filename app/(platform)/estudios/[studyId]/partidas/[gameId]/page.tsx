import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameViewSection } from "@/components/sections/platform/studies/game-view/game-view.section";
import { EditGame } from "@/components/sections/platform/studies/game-view/edit-game.comp";
import { NewGame } from "@/components/sections/platform/studies/study-detail/new-game.comp";
import { getClassGames, getGameById, getGameResultOptions, getStudyById } from "@/services/studies/studies.service";
import "./game-page.css";

interface GamePageProps {
  params: Promise<{ studyId: string; gameId: string }>;
  /** Lo que devuelve borrar sin confirmar: la partida está citada en clases. */
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
  // `getGameById` pasa por el DAL, así que este primer await hace de frontera
  // de sesión. El estudio se pide después para el listado del aside.
  const game = await getGameById(studyId, gameId);
  if (!game) notFound();

  const study = await getStudyById(studyId);
  const siblings = study?.games ?? [];
  const canWrite = study !== null && !study.isCourseStudy;

  // Los resultados los piden los DOS modales del aside, y cada uno se pinta con
  // su propia condición: se traen si cualquiera de las dos se cumple, o el
  // desplegable de resultado saldría vacío el día que dejen de coincidir.
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
            <EditGame
              studyId={game.studyId}
              gameId={game.id}
              results={results}
              values={{
                title: game.title,
                white: game.white,
                black: game.black,
                whiteElo: game.whiteElo,
                blackElo: game.blackElo,
                resultCode: game.resultCode,
                playedAtValue: game.playedAtValue,
                event: game.event,
                site: game.site,
                round: game.round,
                eco: game.eco,
              }}
            />
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
