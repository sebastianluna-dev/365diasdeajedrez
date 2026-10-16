import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { TeacherExerciseEditorSection } from "@/components/platform/sections/teacher/exercises/teacher-exercise-editor.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { teacherRoutes } from "@/lib/platform-routes";
import { getNewTeacherExerciseEditor } from "@/services/teacher-exercises/teacher-exercises.service";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireTeacher();
  return { title: "Nuevo ejercicio" };
}

/** A new exercise of the teacher's bank: the editor on the standard start. */
export default async function NewTeacherExercisePage() {
  if (!EXERCISES_ENABLED) notFound();
  const editor = await getNewTeacherExerciseEditor();

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={teacherRoutes.exercises} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Ejercicios
        </Link>
        <h1 className="platform-page__title">Nuevo ejercicio</h1>
        <p className="platform-page__subtitle">
          Coloca la posición, juega la solución y escribe sus datos. Se guarda como borrador hasta que lo marques como
          listo.
        </p>
      </header>
      <TeacherExerciseEditorSection editor={editor} />
    </div>
  );
}
