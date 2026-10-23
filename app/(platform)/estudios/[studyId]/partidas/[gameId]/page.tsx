import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { gameRecordOf } from "@/components/platform/sections/studies/game-view/game-record";
import { GameViewSection } from "@/components/platform/sections/studies/game-view/game-view.section";
import { RememberOpenedGame } from "@/components/platform/sections/studies/game-view/remember-opened-game.comp";
import { readImportReport } from "@/services/shared/pgn-import-report";
import { getGameById, getGameResultOptions } from "@/services/studies/studies.service";

interface GamePageProps {
  params: Promise<{ studyId: string; gameId: string }>;
  /**
   * `error`: what a server action bounced with (a delete without confirmation,
   * a new game that did not validate). `importadas`: the result of a PGN
   * import, to say how many games went in. `vista=lector`: the owner looks at
   * the game as a reader would, to see what its analysis mode does to whoever
   * cannot edit it.
   */
  searchParams: Promise<{ error?: string; importadas?: string; vista?: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  return game ? { title: `${game.white} – ${game.black}` } : {};
}

/**
 * What is about the game: the board and, heading its moves' column, its
 * record, in the panel under the layout's trail. The frame and the study itself — its name, its list of games — are
 * the layout's (`../layout.tsx`), which is not rendered again from one game to
 * the next. The page loads and hands over; what each piece shows is decided
 * inside it, with the permission table of `services/studies/study-rules`.
 */
export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { studyId, gameId } = await params;
  const { error, importadas, vista } = await searchParams;
  // `getGameById` goes through the DAL, so this first await acts as the session
  // border, on every game: the layout's own is only crossed on arrival.
  const game = await getGameById(studyId, gameId);
  if (!game) notFound();

  // The results feed "Editar", which only exists for whoever may edit the game.
  const results = game.canEdit ? await getGameResultOptions() : [];

  return (
    <>
      {/* Under the layout's trail, in the panel: the board, with the game's
          record at the head of the moves' column. */}
      <GameViewSection
        game={game}
        record={gameRecordOf(game)}
        results={results}
        asReader={vista === "lector"}
        errorCode={error}
        importReport={readImportReport(importadas)}
      />
      {/* The study opens here next time: said from the browser, once shown. */}
      <RememberOpenedGame studyId={studyId} gameId={gameId} />
    </>
  );
}
