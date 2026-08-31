import type { Metadata } from "next";
import { CoursesAdminSection } from "@/components/sections/platform/staff/courses/courses-admin.section";
import { requireStaff } from "@/lib/platform-auth/roles";

export const metadata: Metadata = {
  title: "Cursos",
};

export default async function StaffCoursesPage() {
  await requireStaff();

  return (
    <div className="platform-page staff-courses-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Cursos</h1>
        <p className="platform-page__subtitle">
          Los cursos nacen en borrador y sólo se ven en la plataforma al publicarlos.
        </p>
      </header>

      <CoursesAdminSection />
    </div>
  );
}
