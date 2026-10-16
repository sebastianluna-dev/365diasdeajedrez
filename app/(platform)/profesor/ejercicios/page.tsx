import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { TeacherExercisesSection } from "@/components/platform/sections/teacher/exercises/teacher-exercises.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { teacherRoutes } from "@/lib/platform-routes";
import { getTeacherExercises } from "@/services/teacher-exercises/teacher-exercises.service";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireTeacher();
  return { title: "Ejercicios" };
}

interface TeacherExercisesPageProps {
  searchParams: Promise<{ vista?: string; aviso?: string; error?: string }>;
}

/** «Ejercicios»: the teacher's bank (D06, D07). */
export default async function TeacherExercisesPage({ searchParams }: TeacherExercisesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  await requireTeacher();
  const raw = await searchParams;
  const view = await getTeacherExercises(raw.vista === "archivados" ? "archivados" : "activos");
  const errorMessage = raw.error ? (EXERCISE_ERROR_MESSAGES[raw.error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ejercicios</h1>
        <p className="platform-page__subtitle">
          Los problemas que preparas para tus alumnos: la posición, la solución jugada en el tablero y lo que leen antes
          y después de resolverlos.
        </p>
        <div className="platform-page__actions">
          <Link href={teacherRoutes.newExercise()} className="platform-button platform-button_variant_accent">
            <PlusIcon variant="classic-solid" className="platform-button__icon" />
            Nuevo ejercicio
          </Link>
        </div>
      </header>
      <TeacherExercisesSection
        view={view}
        notice={readExerciseNotice(raw.aviso) ?? undefined}
        errorMessage={errorMessage}
      />
    </div>
  );
}
