import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonEditorSection } from "@/components/platform/sections/staff/courses/lesson-editor.section";
import {
  getLessonAdmin,
  listCollectionGames,
  listExerciseModes,
  listTopics,
} from "@/services/staff-courses/staff-courses.service";

interface StaffLessonPageProps {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
  /** `partida` is the search within the course collection. */
  searchParams: Promise<{ error?: string; partida?: string }>;
}

export async function generateMetadata({ params }: StaffLessonPageProps): Promise<Metadata> {
  const { chapterId, lessonId } = await params;
  const lesson = await getLessonAdmin(chapterId, lessonId);
  return lesson ? { title: lesson.name } : {};
}

export default async function StaffLessonPage({ params, searchParams }: StaffLessonPageProps) {
  const { courseId, chapterId, lessonId } = await params;
  const lesson = await getLessonAdmin(chapterId, lessonId);
  // The chapter has to belong to this course: otherwise the URL is made up.
  if (!lesson || lesson.courseId !== courseId) notFound();

  const { error, partida } = await searchParams;
  const [exerciseModes, topics, courseGames] = await Promise.all([
    listExerciseModes(),
    listTopics(),
    listCollectionGames({ chapterId }, partida),
  ]);

  // The header goes inside the section: it carries the breadcrumbs up to the chapter.
  return (
    <div className="platform-page staff-lesson-page">
      <LessonEditorSection
        lesson={lesson}
        exerciseModes={exerciseModes}
        topics={topics}
        courseGames={courseGames}
        gameQuery={partida}
        errorCode={error}
      />
    </div>
  );
}
