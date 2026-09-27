import type { Metadata } from "next";
import { LevelsAdminSection } from "@/components/platform/sections/staff/levels/levels-admin.section";
import { requireStaff } from "@/lib/platform-auth/roles";
import { listLevels } from "@/services/staff-levels/staff-levels.service";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Niveles" };
}

interface StaffLevelsPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function StaffLevelsPage({ searchParams }: StaffLevelsPageProps) {
  await requireStaff();
  const [levels, { error }] = await Promise.all([listLevels(), searchParams]);

  return (
    <div className="platform-page staff-levels-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Niveles</h1>
        <p className="platform-page__subtitle">
          A quién va dirigido cada curso, de menor a mayor dificultad, con su rango orientativo de Elo. Se asignan desde
          la ficha de cada curso.
        </p>
      </header>

      <LevelsAdminSection levels={levels} errorCode={error} />
    </div>
  );
}
