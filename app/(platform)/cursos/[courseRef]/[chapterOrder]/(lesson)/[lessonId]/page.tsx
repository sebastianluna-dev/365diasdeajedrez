import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LessonBoardSection } from "@/components/platform/sections/courses/lesson-view/lesson-board.section";
import { getLessonView } from "@/services/courses/courses.service";

interface LessonPageProps {
  params: Promise<{ courseRef: string; chapterOrder: string; lessonId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await getLessonView(lessonId);
  return lesson ? { title: lesson.name } : {};
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const [{ courseRef, chapterOrder, lessonId }, { error }] = await Promise.all([params, searchParams]);
  const lesson = await getLessonView(lessonId);
  if (!lesson) notFound();

  // The lesson is resolved by its id alone, so the course and the chapter of
  // the URL are checked against it and not trusted: a lesson reached under the
  // wrong chapter is sent to its own address, where the column beside it is
  // the one it belongs to.
  if (lesson.courseId !== courseRef || lesson.chapterOrder !== Number(chapterOrder)) redirect(lesson.href);

  return <LessonBoardSection lesson={lesson} errorCode={error} />;
}
