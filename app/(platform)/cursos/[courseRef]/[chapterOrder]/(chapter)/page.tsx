import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ChapterStudySection,
  chapterLessonsViewOf,
} from "@/components/platform/sections/courses/course-study/chapter-study.section";
import { isCourseId } from "@/services/courses/course-rules";
import { getChapterView } from "@/services/courses/courses.service";

interface ChapterPageProps {
  /** The course by its id: a chapter is part of the course to study, never of its information page. */
  params: Promise<{ courseRef: string; chapterOrder: string }>;
  /** `lecciones`: the tab (`por-aprender`, `aprendidas`; none is «Todas»); `error`: what a setting bounced back with. */
  searchParams: Promise<{ error?: string; lecciones?: string }>;
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
  return chapter ? { title: `${chapter.name} ·${chapter.course.name}` } : {};
}

export default async function ChapterPage({ params, searchParams }: ChapterPageProps) {
  const { courseRef, chapterOrder } = await params;
  const [chapter, { error, lecciones }] = await Promise.all([chapterOf(courseRef, chapterOrder), searchParams]);
  if (!chapter) notFound();

  // The same border as the course's page: it is studied once it is added.
  if (!chapter.course.isAdded) redirect(chapter.course.infoHref);

  return (
    // The new design system (2026-10-22): the page takes the window and
    // bleeds onto the canvas; the section draws the workspace.
    <div className="platform-page platform-page_width_full platform-page_frame_bleed chapter-page">
      <ChapterStudySection chapter={chapter} view={chapterLessonsViewOf(lecciones)} errorCode={error} />
    </div>
  );
}
