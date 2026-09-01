import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameAnalysisSection } from "@/components/sections/platform/studies/game-analysis/game-analysis.section";
import { getGameById } from "@/services/studies/studies.service";

interface GameAnalysisPageProps {
  params: Promise<{ studyId: string; gameId: string }>;
}

export async function generateMetadata({ params }: GameAnalysisPageProps): Promise<Metadata> {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  return game ? { title: `Analizar ${game.white} – ${game.black}` } : {};
}

export default async function GameAnalysisPage({ params }: GameAnalysisPageProps) {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  // Ruta aparte de la vista de lectura a propósito: quien no es el dueño no
  // llega aquí ni por URL, y la página que ve un profesor sigue siendo la otra.
  if (!game || !game.canEdit) notFound();

  return (
    <div className="platform-page">
      <GameAnalysisSection game={game} />
    </div>
  );
}
