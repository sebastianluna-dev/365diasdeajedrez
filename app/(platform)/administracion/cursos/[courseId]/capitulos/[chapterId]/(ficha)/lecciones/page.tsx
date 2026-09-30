import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterLessonsSection } from "@/components/platform/sections/staff/courses/chapter-lessons.section";
import { getChapterAdmin } from "@/services/staff-courses/staff-courses.service";

interface ChapterLessonsPageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: ChapterLessonsPageProps): Promise<Metadata> {
  const { courseId, chapterId } = await params;
  const chapter = await getChapterAdmin(courseId, chapterId);
  return chapter ? { title: `Lecciones · ${chapter.name}` } : {};
}

export default async function ChapterLessonsPage({ params, searchParams }: ChapterLessonsPageProps) {
  const { courseId, chapterId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const chapter = await getChapterAdmin(courseId, chapterId);
  if (!chapter) notFound();

  const { error } = await searchParams;

  return <ChapterLessonsSection chapter={chapter} errorCode={error} />;
}
