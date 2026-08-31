import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterEditorSection } from "@/components/sections/platform/staff/courses/chapter-editor.section";
import { getChapterAdmin } from "@/services/staff-courses/staff-courses.service";

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

  const { error } = await searchParams;

  return (
    <div className="platform-page staff-chapter-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{chapter.name}</h1>
        <p className="platform-page__subtitle">Capítulo {chapter.order} de {chapter.courseName}</p>
      </header>

      <ChapterEditorSection chapter={chapter} errorCode={error} />
    </div>
  );
}
