import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherSeriesEditorSection } from "@/components/platform/sections/teacher/exercises/teacher-series-editor.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getTeacherSeriesEditor } from "@/services/teacher-exercises/teacher-exercises.service";

interface TeacherSeriesPageProps {
  params: Promise<{ seriesId: string }>;
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: TeacherSeriesPageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { seriesId } = await params;
  const editor = await getTeacherSeriesEditor(seriesId);
  return editor ? { title: editor.series.title } : {};
}

/** One of the teacher's series (D18, D31). Another teacher's is a 404 (the service filters by owner). */
export default async function TeacherSeriesPage({ params, searchParams }: TeacherSeriesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const [{ seriesId }, { aviso, error }] = await Promise.all([params, searchParams]);
  const editor = await getTeacherSeriesEditor(seriesId);
  if (!editor) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <TeacherSeriesEditorSection
        editor={editor}
        notice={readExerciseNotice(aviso) ?? undefined}
        errorMessage={error ? (EXERCISE_ERROR_MESSAGES[error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined}
      />
    </div>
  );
}
