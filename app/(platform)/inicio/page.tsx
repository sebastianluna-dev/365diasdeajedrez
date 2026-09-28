import type { Metadata } from "next";
import { ActivityStatsSection } from "@/components/platform/sections/dashboard/activity-stats/activity-stats.section";
import { ContinueStudyingSection } from "@/components/platform/sections/dashboard/continue-studying/continue-studying.section";
import { NextClassSection } from "@/components/platform/sections/dashboard/next-class/next-class.section";
import { ProfileSummarySection } from "@/components/platform/sections/dashboard/profile-summary/profile-summary.section";
import { RecentActivitySection } from "@/components/platform/sections/dashboard/recent-activity/recent-activity.section";
import { StudyGoalSection } from "@/components/platform/sections/dashboard/study-goal/study-goal.section";
import { getStudyGoal } from "@/services/study-goal/study-goal.service";
import "./dashboard-page.css";

export const metadata: Metadata = {
  title: "Inicio",
};

interface DashboardPageProps {
  /** `error`: what the daily goal's form bounced back with. */
  searchParams: Promise<{ error?: string }>;
}

// What am I studying, how am I doing and what should I do now?
// Each section gets its data from its service; cache() deduplicates per request.
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Border of the private area: the goal goes through getCurrentUser, so this
  // first await acts as the session check as well as fetching the data.
  const [goal, { error }] = await Promise.all([getStudyGoal(), searchParams]);

  return (
    <div className="platform-page dashboard-page">
      <ProfileSummarySection />

      <div className="dashboard-page__row">
        <ContinueStudyingSection />
        <NextClassSection />
      </div>

      <StudyGoalSection goal={goal} errorCode={error} />

      <ActivityStatsSection />
      <RecentActivitySection />
    </div>
  );
}
