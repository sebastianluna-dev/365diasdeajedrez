import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameRecord } from "@/components/platform/sections/studies/game-view/game-record.comp";
import { GameViewSection } from "@/components/platform/sections/studies/game-view/game-view.section";
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
 * What is about the game: the board and, in the study's column, the game's
 * record. The frame and the study itself — its name, its list of games — are
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
      {/* Two of the layout's three pieces: the stylesheet beside it places them. */}
      <GameViewSection
        game={game}
        asReader={vista === "lector"}
        errorCode={error}
        importReport={readImportReport(importadas)}
      />
      <GameRecord game={game} results={results} />
    </>
  );
}
