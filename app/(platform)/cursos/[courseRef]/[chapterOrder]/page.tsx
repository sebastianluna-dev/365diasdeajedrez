import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChapterStudySection } from "@/components/platform/sections/courses/course-study/chapter-study.section";
import { isCourseId } from "@/services/courses/course-rules";
import { getChapterView } from "@/services/courses/courses.service";

interface ChapterPageProps {
  /** The course by its id: a chapter is part of the course to study, never of its information page. */
  params: Promise<{ courseRef: string; chapterOrder: string }>;
  searchParams: Promise<{ error?: string }>;
}

/** The chapter of the URL, or null when the URL is not one of a chapter. */
async function chapterOf(courseRef: string, chapterOrder: string) {
  const order = Number(chapterOrder);
  if (!isCourseId(courseRef) || !Number.isInteger(order)) return null;
  return getChapterView(courseRef, order);
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { courseRef, chapterOrder } = await params;
  const chapter = await chapterOf(courseRef, chapterOrder);
  return chapter ? { title: `${chapter.title} · ${chapter.course.name}` } : {};
}

export default async function ChapterPage({ params, searchParams }: ChapterPageProps) {
  const { courseRef, chapterOrder } = await params;
  const [chapter, { error }] = await Promise.all([chapterOf(courseRef, chapterOrder), searchParams]);
  if (!chapter) notFound();

  // The same border as the course's page: it is studied once it is added.
  if (!chapter.course.isAdded) redirect(chapter.course.infoHref);

  return (
    <div className="platform-page chapter-page">
      <ChapterStudySection chapter={chapter} errorCode={error} />
    </div>
  );
}
