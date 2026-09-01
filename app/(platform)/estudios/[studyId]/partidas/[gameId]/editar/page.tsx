import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameEditSection } from "@/components/sections/platform/studies/game-edit/game-edit.section";
import { getGameById, getGameResultOptions } from "@/services/studies/studies.service";

interface GameEditPageProps {
  params: Promise<{ studyId: string; gameId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: GameEditPageProps): Promise<Metadata> {
  const { studyId, gameId } = await params;
  const game = await getGameById(studyId, gameId);
  return game ? { title: `Editar ${game.white} – ${game.black}` } : {};
}

export default async function GameEditPage({ params, searchParams }: GameEditPageProps) {
  const { studyId, gameId } = await params;
  const [game, results, { error }] = await Promise.all([
    getGameById(studyId, gameId),
    getGameResultOptions(),
    searchParams,
  ]);
  // Ruta aparte de la vista de lectura a propósito: quien no es el dueño no
  // llega aquí ni por URL, y la página que ve un profesor sigue siendo la otra.
  if (!game || !game.canEdit) notFound();

  return (
    <div className="platform-page">
      <GameEditSection game={game} results={results} errorCode={error} />
    </div>
  );
}
