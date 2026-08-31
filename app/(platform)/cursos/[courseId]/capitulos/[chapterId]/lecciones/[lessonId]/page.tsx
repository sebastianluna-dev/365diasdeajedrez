import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonViewSection } from "@/components/sections/platform/courses/lesson-view/lesson-view.section";
import { getLessonView } from "@/services/courses/courses.service";
import "./lesson-page.css";

interface LessonPageProps {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  const lesson = await getLessonView(courseId, lessonId);
  return lesson ? { title: lesson.name } : {};
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params;
  const lesson = await getLessonView(courseId, lessonId);
  if (!lesson) notFound();

  return (
    <div className="platform-page lesson-page">
      <LessonViewSection lesson={lesson} />
    </div>
  );
}
