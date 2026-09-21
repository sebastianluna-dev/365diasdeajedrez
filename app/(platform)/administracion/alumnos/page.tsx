import type { Metadata } from "next";
import { StudentsTableSection } from "@/components/platform/sections/staff/students/students-table.section";
import { requireStaff } from "@/lib/platform-auth/roles";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Alumnos" };
}

interface StaffStudentsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function StaffStudentsPage({ searchParams }: StaffStudentsPageProps) {
  await requireStaff();
  const { q } = await searchParams;

  return (
    <div className="platform-page staff-students-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Alumnos</h1>
        <p className="platform-page__subtitle">Cuentas de la plataforma, su acceso y su profesor asignado.</p>
      </header>

      <StudentsTableSection query={q} />
    </div>
  );
}
