import type { Metadata } from "next";
import { StudentsTableSection } from "@/components/sections/platform/staff/students/students-table.section";
import { requireStaff } from "@/lib/platform-auth/roles";

export const metadata: Metadata = {
  title: "Alumnos",
};

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
