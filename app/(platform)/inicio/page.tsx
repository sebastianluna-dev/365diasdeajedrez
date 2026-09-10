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

// What am I studying, how am I doing and what should I do now?
// Each section gets its data from its service; cache() deduplicates per request.
export default async function DashboardPage() {
  // Border of the private area: without a valid session, redirect to the login.
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
