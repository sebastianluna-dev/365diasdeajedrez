import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterGamesSection } from "@/components/platform/sections/staff/courses/chapter-games.section";
import { readImportReport } from "@/services/shared/pgn-import-report";
import { getChapterAdmin, listCollectionGames } from "@/services/staff-courses/staff-courses.service";

interface ChapterGamesPageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
  /** `error`: what a server action bounced with. `importadas`: the result of a PGN import. */
  searchParams: Promise<{ error?: string; importadas?: string }>;
}

export async function generateMetadata({ params }: ChapterGamesPageProps): Promise<Metadata> {
  const { courseId, chapterId } = await params;
  const chapter = await getChapterAdmin(courseId, chapterId);
  return chapter ? { title: `Partidas · ${chapter.name}` } : {};
}

export default async function ChapterGamesPage({ params, searchParams }: ChapterGamesPageProps) {
  const { courseId, chapterId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const chapter = await getChapterAdmin(courseId, chapterId);
  if (!chapter) notFound();

  const [games, { error, importadas }] = await Promise.all([listCollectionGames({ chapterId }), searchParams]);

  return (
    <ChapterGamesSection
      chapter={chapter}
      games={games}
      errorCode={error}
      importReport={readImportReport(importadas)}
    />
  );
}
