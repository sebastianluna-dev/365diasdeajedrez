import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { LessonExerciseEditorSection } from "@/components/platform/sections/staff/courses/lesson-exercise-editor.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { getLessonExerciseEditor } from "@/services/staff-courses/lesson-exercises.service";

interface LessonExercisePageProps {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string; exerciseId: string }>;
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: LessonExercisePageProps): Promise<Metadata> {
  const { courseId, chapterId, lessonId, exerciseId } = await params;
  const editor = await getLessonExerciseEditor(courseId, chapterId, lessonId, exerciseId);
  return editor ? { title: `${editor.exercise.title} · ${editor.lessonName}` } : {};
}

/** One of the lesson's exercises, in the editor. One of another lesson, or of a bank, is a 404 (the service filters by lesson). */
export default async function LessonExercisePage({ params, searchParams }: LessonExercisePageProps) {
  const [{ courseId, chapterId, lessonId, exerciseId }, { aviso, error }] = await Promise.all([params, searchParams]);
  const editor = await getLessonExerciseEditor(courseId, chapterId, lessonId, exerciseId);
  if (!editor) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={editor.lessonHref} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          {editor.lessonName}
        </Link>
        <h1 className="platform-page__title">{editor.exercise.title}</h1>
        {editor.statusLabel && (
          <p className="platform-page__subtitle">
            <span className="platform-tag">{editor.statusLabel}</span>
          </p>
        )}
      </header>
      <LessonExerciseEditorSection
        editor={editor}
        notice={readExerciseNotice(aviso) ?? undefined}
        errorMessage={error ? (EXERCISE_ERROR_MESSAGES[error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined}
      />
    </div>
  );
}
