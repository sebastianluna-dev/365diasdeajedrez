import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ChapterRecordHead } from "@/components/platform/sections/staff/courses/chapter-record-head.comp";
import { countCollectionGames, getChapterAdmin } from "@/services/staff-courses/staff-courses.service";

interface ChapterRecordLayoutProps {
  children: ReactNode;
  params: Promise<{ courseId: string; chapterId: string }>;
}

/**
 * The frame of a chapter record: its name, where it sits and the tabs, above
 * whichever of the three pages one is on — «Capítulo», «Lecciones»,
 * «Partidas». Same reasons as the course's layout, one level down; a lesson
 * and a game on the board hang from the chapter and are outside this group.
 */
export default async function ChapterRecordLayout({ children, params }: ChapterRecordLayoutProps) {
  const { courseId, chapterId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const chapter = await getChapterAdmin(courseId, chapterId);
  if (!chapter) notFound();

  const gameCount = await countCollectionGames({ chapterId });

  return (
    <div className="platform-page staff-chapter-record">
      <ChapterRecordHead chapter={chapter} gameCount={gameCount} />
      {children}
    </div>
  );
}
