import type { Metadata } from "next";
import { StaffDashboardSection } from "@/components/platform/sections/staff/dashboard/staff-dashboard.section";
import { requireStaff } from "@/lib/platform-auth/roles";
import "./staff-page.css";

export const metadata: Metadata = {
  title: "Administración",
};

export default async function StaffPage() {
  // Panel border: no Staff row, to the dashboard; no session, to the login.
  await requireStaff();

  return (
    <div className="platform-page staff-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Administración</h1>
        <p className="platform-page__subtitle">Alumnos, profesores y contenido de la plataforma.</p>
      </header>

      <StaffDashboardSection />
    </div>
  );
}
