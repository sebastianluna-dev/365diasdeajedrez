import { notFound } from "next/navigation";
import { LessonFrame } from "@/components/platform/sections/courses/lesson-view/lesson-frame.comp";
import { isCourseId } from "@/services/courses/course-rules";
import { getChapterOutline } from "@/services/courses/courses.service";
import "./lesson-page.css";

interface LessonLayoutProps {
  params: Promise<{ courseRef: string; chapterOrder: string }>;
  children: React.ReactNode;
}

/**
 * The lesson's screen, minus the lesson: the column of lessons of the chapter.
 *
 * It hangs from the CHAPTER and not from the lesson, and that is the whole
 * reason the lessons live at `/cursos/<id>/<capítulo>/<lección>`: a layout is
 * fetched once and is not rendered again while one moves inside it, so going
 * from one lesson to the next costs its PGN and nothing else — the column is
 * not queried, not drawn and not scrolled back to the top.
 *
 * It is a route group, so the chapter's own page — which is another screen
 * entirely — does not get it.
 */
export default async function LessonLayout({ params, children }: LessonLayoutProps) {
  const { courseRef, chapterOrder } = await params;
  const order = Number(chapterOrder);
  if (!isCourseId(courseRef) || !Number.isInteger(order)) notFound();

  const outline = await getChapterOutline(courseRef, order);
  if (!outline) notFound();

  return (
    <div className="platform-page lesson-page platform-page_width_full platform-page_height_screen platform-page_scale_base">
      <LessonFrame outline={outline}>{children}</LessonFrame>
    </div>
  );
}
