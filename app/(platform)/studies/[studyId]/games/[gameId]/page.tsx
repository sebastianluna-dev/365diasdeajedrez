import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameViewSection } from "@/components/sections/platform/studies/game-view/game-view.section";
import { getGameById } from "@/services/studies/studies.service";
import "./game-page.css";

interface GamePageProps {
  params: Promise<{ studyId: string; gameId: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  return game ? { title: `${game.white} – ${game.black}` } : {};
}

export default async function GamePage({ params }: GamePageProps) {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  if (!game) notFound();

  return (
    <div className="platform-page game-page">
      <GameViewSection game={game} />
    </div>
  );
}
