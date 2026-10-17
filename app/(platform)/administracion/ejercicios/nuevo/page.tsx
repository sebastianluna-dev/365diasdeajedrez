import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { StaffExerciseEditorSection } from "@/components/platform/sections/staff/exercises/staff-exercise-editor.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { staffRoutes } from "@/lib/platform-routes";
import { getNewStaffExerciseEditor } from "@/services/staff-exercises/staff-exercises.service";

export async function generateMetadata(): Promise<Metadata> {
  if (!EXERCISES_ENABLED) return {};
  await requireStaff();
  return { title: "Nuevo ejercicio" };
}

interface NewStaffExercisePageProps {
  /** `estudio`, `partida` and `jugada`: a move of one of the staff member's own study games («Crear ejercicio desde aquí»). */
  searchParams: Promise<{ estudio?: string; partida?: string; jugada?: string }>;
}

/**
 * A new exercise of the academy's (PLAN.md §8): the editor on the standard
 * start, or, from «Crear ejercicio desde aquí» (D11), on the position after
 * a move of one of the staff member's own games; «Guardar y publicar» puts
 * it in the library at once — the staff is the reviewer. Behind
 * `EXERCISES_ENABLED`.
 */
export default async function NewStaffExercisePage({ searchParams }: NewStaffExercisePageProps) {
  if (!EXERCISES_ENABLED) notFound();
  await requireStaff();
  const { estudio, partida, jugada } = await searchParams;
  const from =
    estudio && partida && jugada !== undefined ? { studyId: estudio, gameId: partida, path: jugada } : undefined;
  const editor = await getNewStaffExerciseEditor(from);

  return (
    <div className="platform-page platform-page_width_wide">
      <header className="platform-page__head">
        <Link href={staffRoutes.exercises} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Biblioteca
        </Link>
        <h1 className="platform-page__title">Nuevo ejercicio</h1>
        <p className="platform-page__subtitle">
          Coloca la posición, juega la solución y escribe sus datos. Se guarda como borrador hasta que lo publiques; al
          publicarlo entra en la biblioteca.
        </p>
      </header>
      <StaffExerciseEditorSection editor={editor} />
    </div>
  );
}
