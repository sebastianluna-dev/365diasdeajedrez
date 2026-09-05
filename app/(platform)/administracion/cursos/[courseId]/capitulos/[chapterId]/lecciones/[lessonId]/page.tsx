import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonEditorSection } from "@/components/sections/platform/staff/courses/lesson-editor.section";
import {
  getLessonAdmin,
  listCourseGames,
  listExerciseModes,
  listInitialPositionTypes,
  listPresentationModes,
  listTopics,
} from "@/services/staff-courses/staff-courses.service";

interface StaffLessonPageProps {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
  /** `partida` es la búsqueda en la colección del curso. */
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
  // El capítulo tiene que pertenecer a este curso: si no, la URL es inventada.
  if (!lesson || lesson.courseId !== courseId) notFound();

  const { error, partida } = await searchParams;
  const [presentationModes, initialPositionTypes, exerciseModes, topics, courseGames] = await Promise.all([
    listPresentationModes(),
    listInitialPositionTypes(),
    listExerciseModes(),
    listTopics(),
    listCourseGames(courseId, partida),
  ]);

  // La cabecera va dentro de la sección: lleva las migas hasta el capítulo.
  return (
    <div className="platform-page staff-lesson-page">
      <LessonEditorSection
        lesson={lesson}
        presentationModes={presentationModes}
        initialPositionTypes={initialPositionTypes}
        exerciseModes={exerciseModes}
        topics={topics}
        courseGames={courseGames}
        gameQuery={partida}
        errorCode={error}
      />
    </div>
  );
}
