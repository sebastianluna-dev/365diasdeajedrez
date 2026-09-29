import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonViewSection } from "@/components/platform/sections/courses/lesson-view/lesson-view.section";
import { getLessonView } from "@/services/courses/courses.service";
import "./lesson-page.css";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await getLessonView(lessonId);
  return lesson ? { title: lesson.name } : {};
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const { lessonId } = await params;
  const [lesson, { error }] = await Promise.all([getLessonView(lessonId), searchParams]);
  if (!lesson) notFound();

  return (
    <div className="platform-page lesson-page platform-page_width_full platform-page_height_screen">
      <LessonViewSection lesson={lesson} errorCode={error} />
    </div>
  );
}
