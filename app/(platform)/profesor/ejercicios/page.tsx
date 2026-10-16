import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { NewSeriesButton } from "@/components/platform/sections/teacher/exercises/series-data-popup/series-data-popup.comp";
import { TeacherExercisesSection } from "@/components/platform/sections/teacher/exercises/teacher-exercises.section";
import { EXERCISE_ERROR_MESSAGES, readExerciseNotice } from "@/constants/platform/exercise-messages.const";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { teacherRoutes } from "@/lib/platform-routes";
import { createExerciseSeries } from "@/services/teacher-exercises/teacher-exercises.actions";
import { getTeacherExercises } from "@/services/teacher-exercises/teacher-exercises.service";
import type { TeacherExercisesTab } from "@/services/teacher-exercises/teacher-exercises.types";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireTeacher();
  return { title: "Ejercicios" };
}

interface TeacherExercisesPageProps {
  searchParams: Promise<{ vista?: string; aviso?: string; error?: string }>;
}

/** The bank's view from `?vista=`: anything else is what is in use. */
function tabOf(raw: string | undefined): TeacherExercisesTab {
  return raw === "archivados" || raw === "series" ? raw : "activos";
}

/** «Ejercicios»: the teacher's bank (D06, D07) and their series (D18, D31). */
export default async function TeacherExercisesPage({ searchParams }: TeacherExercisesPageProps) {
  if (!EXERCISES_ENABLED) notFound();
  await requireTeacher();
  const raw = await searchParams;
  const view = await getTeacherExercises(tabOf(raw.vista));
  const errorMessage = raw.error ? (EXERCISE_ERROR_MESSAGES[raw.error] ?? EXERCISE_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Ejercicios</h1>
        <p className="platform-page__subtitle">
          Los ejercicios que preparas para tus alumnos: la posición, la solución jugada en el tablero y lo que leen
          antes y después de resolverlos. Con ellos armas las series que les das.
        </p>
        <div className="platform-page__actions">
          <Link href={teacherRoutes.newExercise()} className="platform-button platform-button_variant_accent">
            <PlusIcon variant="classic-solid" className="platform-button__icon" />
            Nuevo ejercicio
          </Link>
          <NewSeriesButton save={createExerciseSeries} />
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
