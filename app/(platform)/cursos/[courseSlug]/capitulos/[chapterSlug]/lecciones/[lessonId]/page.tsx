import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonViewSection } from "@/components/sections/platform/courses/lesson-view/lesson-view.section";
import { getLessonView } from "@/services/courses/courses.service";
import "./lesson-page.css";

interface LessonPageProps {
  params: Promise<{ courseSlug: string; chapterSlug: string; lessonId: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonId } = await params;
  const lesson = await getLessonView(courseSlug, lessonId);
  return lesson ? { title: lesson.name } : {};
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonId } = await params;
  const lesson = await getLessonView(courseSlug, lessonId);
  if (!lesson) notFound();

  return (
    <div className="platform-page lesson-page">
      <LessonViewSection lesson={lesson} />
    </div>
  );
}
