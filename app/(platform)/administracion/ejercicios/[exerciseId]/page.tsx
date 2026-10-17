import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { StaffExerciseEditorSection } from "@/components/platform/sections/staff/exercises/staff-exercise-editor.section";
import { EXERCISE_STATUS } from "@/constants/platform/exercise-codes.const";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { staffRoutes } from "@/lib/platform-routes";
import { getStaffExerciseEditor } from "@/services/staff-exercises/staff-exercises.service";

interface StaffExercisePageProps {
  params: Promise<{ exerciseId: string }>;
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: StaffExercisePageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireStaff();
  const { exerciseId } = await params;
  const editor = await getStaffExerciseEditor(exerciseId);
  return editor ? { title: editor.exercise.title } : {};
}

/**
 * A bank's exercise for the staff (PLAN.md §8): the editor — the academy's
 * to write, a teacher's proposal read-only and open on «Probar» — and the
 * review bar under it. A lesson's exercise, or a teacher's that was never
 * proposed, is a 404 (the service decides). Behind `EXERCISES_ENABLED`.
 */
export default async function StaffExercisePage({ params, searchParams }: StaffExercisePageProps) {
  if (!EXERCISES_ENABLED) notFound();
  await requireStaff();
  const [{ exerciseId }, { aviso, error }] = await Promise.all([params, searchParams]);
  const editor = await getStaffExerciseEditor(exerciseId);
  if (!editor || !editor.review) notFound();
  const fromQueue = editor.review.statusCode === EXERCISE_STATUS.IN_REVIEW;

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={fromQueue ? staffRoutes.exercisesReview : staffRoutes.exercises} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          {fromQueue ? "En revisión" : "Biblioteca"}
        </Link>
        <h1 className="platform-page__title">{editor.exercise.title}</h1>
        <p className="platform-page__subtitle">
          <span className="platform-tag">{editor.review.statusLabel}</span> {editor.review.authorLabel}
        </p>
      </header>
      <StaffExerciseEditorSection
        editor={editor}
        notice={readExerciseNotice(aviso) ?? undefined}
        errorMessage={error ? (EXERCISE_ERROR_MESSAGES[error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined}
      />
    </div>
  );
}
