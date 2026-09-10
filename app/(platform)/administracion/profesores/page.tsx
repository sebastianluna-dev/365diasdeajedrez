import type { Metadata } from "next";
import { TeachersTableSection } from "@/components/platform/sections/staff/teachers/teachers-table.section";
import { requireStaff } from "@/lib/platform-auth/roles";

export const metadata: Metadata = {
  title: "Profesores",
};

export default async function StaffTeachersPage() {
  await requireStaff();

  return (
    <div className="platform-page staff-teachers-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Profesores</h1>
        <p className="platform-page__subtitle">
          Un profesor nunca se borra: se desactiva, y sus clases y asignaciones quedan como historial.
        </p>
      </header>

      <TeachersTableSection />
    </div>
  );
}
