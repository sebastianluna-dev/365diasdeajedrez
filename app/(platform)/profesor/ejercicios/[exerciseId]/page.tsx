import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { TeacherExerciseEditorSection } from "@/components/platform/sections/teacher/exercises/teacher-exercise-editor.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { teacherRoutes } from "@/lib/platform-routes";
import { getTeacherExerciseEditor } from "@/services/teacher-exercises/teacher-exercises.service";

interface TeacherExercisePageProps {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: TeacherExercisePageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { exerciseId } = await params;
  const editor = await getTeacherExerciseEditor(exerciseId);
  return editor ? { title: editor.exercise.title } : {};
}

/** One of the teacher's exercises, in the editor. Another teacher's is a 404 (the service filters by owner). */
export default async function TeacherExercisePage({ params, searchParams }: TeacherExercisePageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const [{ exerciseId }, { aviso, error }] = await Promise.all([params, searchParams]);
  const editor = await getTeacherExerciseEditor(exerciseId);
  if (!editor) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={teacherRoutes.exercises} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Ejercicios
        </Link>
        <h1 className="platform-page__title">{editor.exercise.title}</h1>
        {editor.statusLabel && (
          <p className="platform-page__subtitle">
            <span className="platform-tag">{editor.statusLabel}</span>
          </p>
        )}
      </header>
      <TeacherExerciseEditorSection
        editor={editor}
        notice={readExerciseNotice(aviso) ?? undefined}
        errorMessage={error ? (EXERCISE_ERROR_MESSAGES[error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined}
      />
    </div>
  );
}
