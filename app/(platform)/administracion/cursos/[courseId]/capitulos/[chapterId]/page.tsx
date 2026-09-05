import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterEditorSection } from "@/components/sections/platform/staff/courses/chapter-editor.section";
import { countCollectionGames, getChapterAdmin } from "@/services/staff-courses/staff-courses.service";

interface StaffChapterPageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StaffChapterPageProps): Promise<Metadata> {
  const { courseId, chapterId } = await params;
  const chapter = await getChapterAdmin(courseId, chapterId);
  return chapter ? { title: chapter.name } : {};
}

export default async function StaffChapterPage({ params, searchParams }: StaffChapterPageProps) {
  const { courseId, chapterId } = await params;
  const chapter = await getChapterAdmin(courseId, chapterId);
  if (!chapter) notFound();

  const [{ error }, gameCount] = await Promise.all([searchParams, countCollectionGames({ chapterId })]);

  // La cabecera va dentro de la sección: lleva las migas hasta el curso.
  return (
    <div className="platform-page staff-chapter-page">
      <ChapterEditorSection chapter={chapter} gameCount={gameCount} errorCode={error} />
    </div>
  );
}
