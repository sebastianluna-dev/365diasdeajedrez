import type { Metadata } from "next";
import { CoursesAdminSection } from "@/components/sections/platform/staff/courses/courses-admin.section";
import { requireStaff } from "@/lib/platform-auth/roles";

export const metadata: Metadata = {
  title: "Cursos",
};

interface StaffCoursesPageProps {
  /** `q` es la búsqueda y `estado` el filtro; los dos viven en la URL. */
  searchParams: Promise<{ q?: string; estado?: string }>;
}

export default async function StaffCoursesPage({ searchParams }: StaffCoursesPageProps) {
  await requireStaff();
  const { q, estado } = await searchParams;

  // La cabecera va DENTRO de la sección: lleva el buscador, y ése necesita
  // saber lo que hay filtrado.
  return (
    <div className="platform-page staff-courses-page">
      <CoursesAdminSection query={q} status={estado} />
    </div>
  );
}
