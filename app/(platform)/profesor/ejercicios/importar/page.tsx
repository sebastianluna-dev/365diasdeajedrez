import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { TeacherExerciseImportSection } from "@/components/platform/sections/teacher/exercises/teacher-exercise-import.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { teacherRoutes } from "@/lib/platform-routes";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireTeacher();
  return { title: "Importar PGN" };
}

/**
 * «Importar PGN» (D12, phase 5): a file with one exercise per game into the
 * teacher's bank — reviewed first, written after. Behind `EXERCISES_ENABLED`.
 */
export default async function TeacherExerciseImportPage() {
  if (!EXERCISES_ENABLED) notFound();
  await requireTeacher();
  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={teacherRoutes.exercises} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Ejercicios
        </Link>
        <h1 className="platform-page__title">Importar PGN</h1>
        <p className="platform-page__subtitle">
          Un archivo con varias partidas se convierte en un ejercicio por partida. Primero revisas qué pasará con cada
          una; después se importan las que pasen la revisión.
        </p>
      </header>
      <TeacherExerciseImportSection />
    </div>
  );
}
