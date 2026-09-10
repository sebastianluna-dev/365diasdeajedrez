import type { Metadata } from "next";
import { TeacherDashboardSection } from "@/components/platform/sections/teacher/dashboard/teacher-dashboard.section";
import { requireTeacher } from "@/lib/platform-auth/roles";
import "./teacher-page.css";

export const metadata: Metadata = {
  title: "Panel del profesor",
};

export default async function TeacherPage() {
  // Panel border: no active Teacher row, to the dashboard; no session, to the login.
  const { teacher } = await requireTeacher();

  return (
    <div className="platform-page teacher-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Panel del profesor</h1>
        <p className="platform-page__subtitle">Hola, {teacher.displayName}. Esto es lo que tienes por delante.</p>
      </header>

      <TeacherDashboardSection />
    </div>
  );
}
