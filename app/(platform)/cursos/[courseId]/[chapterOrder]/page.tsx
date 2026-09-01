import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChapterDetailSection } from "@/components/sections/platform/courses/chapter-detail/chapter-detail.section";
import { getChapterView } from "@/services/courses/courses.service";
import "./chapter-page.css";

interface ChapterPageProps {
  params: Promise<{ courseId: string; chapterOrder: string }>;
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { courseId, chapterOrder } = await params;
  const chapter = await getChapterView(courseId, Number(chapterOrder));
  return chapter ? { title: chapter.name } : {};
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { courseId, chapterOrder } = await params;
  const chapter = await getChapterView(courseId, Number(chapterOrder));
  if (!chapter) notFound();

  return (
    <div className="platform-page chapter-page">
      <ChapterDetailSection chapter={chapter} />
    </div>
  );
}
