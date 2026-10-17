import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffSeriesEditorSection } from "@/components/platform/sections/staff/exercises/staff-series-editor.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getStaffSeriesEditor } from "@/services/staff-exercises/staff-exercises.service";

interface StaffSeriesEditorPageProps {
  params: Promise<{ seriesId: string }>;
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: StaffSeriesEditorPageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { seriesId } = await params;
  const editor = await getStaffSeriesEditor(seriesId);
  return editor ? { title: editor.series.title } : {};
}

/** One academy series: its exercises in order, «Agregar ejercicios» over the library, and the «Publicada» switch. A teacher's series is a 404. */
export default async function StaffSeriesEditorPage({ params, searchParams }: StaffSeriesEditorPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const [{ seriesId }, { aviso, error }] = await Promise.all([params, searchParams]);
  const editor = await getStaffSeriesEditor(seriesId);
  if (!editor) notFound();

  return (
    <div className="platform-page platform-page_width_wide">
      <StaffSeriesEditorSection
        editor={editor}
        notice={readExerciseNotice(aviso) ?? undefined}
        errorMessage={error ? (EXERCISE_ERROR_MESSAGES[error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined}
      />
    </div>
  );
}
