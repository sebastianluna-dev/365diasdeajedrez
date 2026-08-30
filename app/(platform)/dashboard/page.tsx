import type { Metadata } from "next";
import { ActivityStatsSection } from "@/components/sections/platform/dashboard/activity-stats/activity-stats.section";
import { ContinueStudyingSection } from "@/components/sections/platform/dashboard/continue-studying/continue-studying.section";
import { NextClassSection } from "@/components/sections/platform/dashboard/next-class/next-class.section";
import { ProfileSummarySection } from "@/components/sections/platform/dashboard/profile-summary/profile-summary.section";
import { RecentActivitySection } from "@/components/sections/platform/dashboard/recent-activity/recent-activity.section";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import "./dashboard-page.css";

export const metadata: Metadata = {
  title: "Inicio",
};

// ¿Qué estoy estudiando, cómo voy y qué debería hacer ahora?
// Cada sección obtiene sus datos de su servicio; cache() deduplica por request.
export default async function DashboardPage() {
  // Frontera de la zona privada: sin sesión válida, redirige al login.
  await getCurrentUser();

  return (
    <div className="platform-page dashboard-page">
      <ProfileSummarySection />

      <div className="dashboard-page__row">
        <ContinueStudyingSection />
        <NextClassSection />
      </div>

      <ActivityStatsSection />
      <RecentActivitySection />
    </div>
  );
}
