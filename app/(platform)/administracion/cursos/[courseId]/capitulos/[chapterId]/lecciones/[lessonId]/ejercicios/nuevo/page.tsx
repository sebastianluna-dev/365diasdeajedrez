import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { LessonExerciseEditorSection } from "@/components/platform/sections/staff/courses/lesson-exercise-editor.section";
import { getNewLessonExerciseEditor } from "@/services/staff-courses/lesson-exercises.service";

interface NewLessonExercisePageProps {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}

export async function generateMetadata({ params }: NewLessonExercisePageProps): Promise<Metadata> {
  const { courseId, chapterId, lessonId } = await params;
  const editor = await getNewLessonExerciseEditor(courseId, chapterId, lessonId);
  return editor ? { title: `Nuevo ejercicio · ${editor.lessonName}` } : {};
}

/**
 * A new exercise of a lesson, for the staff (D04, D05): the editor on the
 * standard start, saved as a draft of the lesson or published into it. Not
 * behind `EXERCISES_ENABLED`: it replaces the lesson's panel that was live
 * before phase 2. A lesson the URL makes up answers 404.
 */
export default async function NewLessonExercisePage({ params }: NewLessonExercisePageProps) {
  const { courseId, chapterId, lessonId } = await params;
  const editor = await getNewLessonExerciseEditor(courseId, chapterId, lessonId);
  if (!editor) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={editor.lessonHref} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          {editor.lessonName}
        </Link>
        <h1 className="platform-page__title">Nuevo ejercicio</h1>
        <p className="platform-page__subtitle">
          Coloca la posición, juega la solución y escribe sus datos. Se guarda como borrador de la lección hasta que lo
          publiques.
        </p>
      </header>
      <LessonExerciseEditorSection editor={editor} />
    </div>
  );
}
