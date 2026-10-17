import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { StaffExerciseImportSection } from "@/components/platform/sections/staff/exercises/staff-exercise-import.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { staffRoutes } from "@/lib/platform-routes";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireStaff();
  return { title: "Importar PGN" };
}

/**
 * «Importar PGN» (D12, phase 5): a file with one exercise per game into the
 * academy's bank, or straight into the library — reviewed first, written
 * after. Behind `EXERCISES_ENABLED`.
 */
export default async function StaffExerciseImportPage() {
  if (!EXERCISES_ENABLED) notFound();
  await requireStaff();
  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={staffRoutes.exercises} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Biblioteca
        </Link>
        <h1 className="platform-page__title">Importar PGN</h1>
        <p className="platform-page__subtitle">
          Un archivo con varias partidas se convierte en un ejercicio por partida: con «En la biblioteca», lo que pase
          la revisión entra publicado. Primero revisas qué pasará con cada una; después se importan.
        </p>
      </header>
      <StaffExerciseImportSection />
    </div>
  );
}
