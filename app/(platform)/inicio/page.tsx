import type { Metadata } from "next";
import { ActivityStatsSection } from "@/components/platform/sections/dashboard/activity-stats/activity-stats.section";
import { ContinueStudyingSection } from "@/components/platform/sections/dashboard/continue-studying/continue-studying.section";
import { NextClassSection } from "@/components/platform/sections/dashboard/next-class/next-class.section";
import { ProfileSummarySection } from "@/components/platform/sections/dashboard/profile-summary/profile-summary.section";
import { RecentActivitySection } from "@/components/platform/sections/dashboard/recent-activity/recent-activity.section";
import { StudyGoalSection } from "@/components/platform/sections/dashboard/study-goal/study-goal.section";
import { dayKeyIn } from "@/lib/timezone";
import { getNextClass } from "@/services/classes/classes.service";
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
// On the day of a class, «Próxima clase» comes first and takes the row:
// entering the class is what there is to do, and «Continuar» steps back.
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Border of the private area: the goal goes through getCurrentUser, so this
  // first await acts as the session check as well as fetching the data.
  const [goal, nextClass, { error }] = await Promise.all([getStudyGoal(), getNextClass(), searchParams]);
  const classDay =
    nextClass !== null &&
    dayKeyIn(new Date(nextClass.startIso), nextClass.timeZone) ===
      dayKeyIn(new Date(nextClass.nowIso), nextClass.timeZone);

  return (
    <div className="platform-page dashboard-page">
      <ProfileSummarySection />

      {classDay ? (
        <>
          <NextClassSection />
          <div className="dashboard-page__row">
            <ContinueStudyingSection emphasis="secondary" />
            <StudyGoalSection goal={goal} errorCode={error} />
          </div>
        </>
      ) : (
        <>
          <div className="dashboard-page__row">
            <ContinueStudyingSection />
            <NextClassSection />
          </div>
          <StudyGoalSection goal={goal} errorCode={error} />
        </>
      )}

      <ActivityStatsSection />
      <RecentActivitySection />
    </div>
  );
}
