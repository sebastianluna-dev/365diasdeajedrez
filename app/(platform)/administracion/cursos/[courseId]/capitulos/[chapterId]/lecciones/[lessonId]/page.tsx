import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonEditorSection } from "@/components/sections/platform/staff/courses/lesson-editor.section";
import {
  getLessonAdmin,
  listExerciseModes,
  listInitialPositionTypes,
  listPresentationModes,
  listTopics,
} from "@/services/staff-courses/staff-courses.service";

interface StaffLessonPageProps {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StaffLessonPageProps): Promise<Metadata> {
  const { chapterId, lessonId } = await params;
  const lesson = await getLessonAdmin(chapterId, lessonId);
  return lesson ? { title: lesson.name } : {};
}

export default async function StaffLessonPage({ params, searchParams }: StaffLessonPageProps) {
  const { courseId, chapterId, lessonId } = await params;
  const lesson = await getLessonAdmin(chapterId, lessonId);
  // El capítulo tiene que pertenecer a este curso: si no, la URL es inventada.
  if (!lesson || lesson.courseId !== courseId) notFound();

  const [presentationModes, initialPositionTypes, exerciseModes, topics, { error }] = await Promise.all([
    listPresentationModes(),
    listInitialPositionTypes(),
    listExerciseModes(),
    listTopics(),
    searchParams,
  ]);

  return (
    <div className="platform-page staff-lesson-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{lesson.name}</h1>
        <p className="platform-page__subtitle">
          Lección {lesson.order} de {lesson.chapterName}
        </p>
      </header>

      <LessonEditorSection
        lesson={lesson}
        presentationModes={presentationModes}
        initialPositionTypes={initialPositionTypes}
        exerciseModes={exerciseModes}
        topics={topics}
        errorCode={error}
      />
    </div>
  );
}
