import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterGameSection } from "@/components/platform/sections/staff/courses/chapter-game/chapter-game.section";
import { getChapterGame, listGameResults } from "@/services/staff-courses/staff-courses.service";

interface ChapterGamePageProps {
  params: Promise<{ courseId: string; chapterId: string; gameId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: ChapterGamePageProps): Promise<Metadata> {
  const { courseId, chapterId, gameId } = await params;
  const game = await getChapterGame(courseId, chapterId, gameId);
  return game ? { title: game.title ?? `${game.white} – ${game.black}` } : {};
}

export default async function ChapterGamePage({ params, searchParams }: ChapterGamePageProps) {
  const { courseId, chapterId, gameId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const game = await getChapterGame(courseId, chapterId, gameId);
  if (!game) notFound();

  const [results, { error }] = await Promise.all([listGameResults(), searchParams]);

  return (
    <div className="platform-page staff-chapter-game-page platform-page_width_wide">
      <ChapterGameSection game={game} results={results} errorCode={error} />
    </div>
  );
}
