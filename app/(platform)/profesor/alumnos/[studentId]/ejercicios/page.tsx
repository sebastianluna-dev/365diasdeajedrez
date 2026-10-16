import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentExerciseAttemptsSection } from "@/components/platform/sections/teacher/students/student-exercise-attempts.section";
import { StudentPageTabs } from "@/components/platform/sections/teacher/students/student-page-tabs.comp";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { getStudentExerciseAttempts } from "@/services/teacher-exercises/teacher-exercises.service";

interface StudentExercisesPageProps {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ pagina?: string }>;
}

/** `?pagina=`: how many pages of attempts are shown, from 1. */
function pageOf(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 1 ? page : 1;
}

export async function generateMetadata({ params }: StudentExercisesPageProps): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  const { studentId } = await params;
  const view = await getStudentExerciseAttempts(studentId);
  return view ? { title: `Ejercicios de ${view.student.displayName}` } : {};
}

/**
 * The student's attempts at exercises, for their teacher (D24). The service
 * opens with requireTeacher() and answers only for a student assigned to
 * them now: by direct URL, someone else's student is a 404.
 */
export default async function StudentExercisesPage({ params, searchParams }: StudentExercisesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const [{ studentId }, { pagina }] = await Promise.all([params, searchParams]);
  const view = await getStudentExerciseAttempts(studentId, pageOf(pagina));
  if (!view) notFound();

  return (
    <div className="platform-page teacher-student-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{view.student.displayName}</h1>
        <p className="platform-page__subtitle">Sus intentos en los ejercicios que le diste</p>
      </header>
      <StudentPageTabs studentId={studentId} current="ejercicios" />
      <StudentExerciseAttemptsSection view={view} />
    </div>
  );
}
