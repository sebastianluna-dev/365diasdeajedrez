import type { Metadata } from "next";
import { HomeSection } from "@/components/platform/sections/dashboard/home/home.section";
import { getClassExercisesToDo, getNextClass } from "@/services/classes/classes.service";
import { getUserDashboard } from "@/services/dashboard/dashboard.service";
import { getStudyGoal } from "@/services/study-goal/study-goal.service";

export const metadata: Metadata = {
  title: "Inicio",
};

/**
 * «Inicio», the student's home page, in the new design system (2026-10-23,
 * the owner's «Inicio: un solo foco»): the page takes the window and bleeds
 * onto the canvas, with no side column — the white panel alone, as wide as
 * the workspace —, and the section decides what comes first.
 */
export default async function DashboardPage() {
  // Border of the private area: every read goes through getCurrentUser, so
  // this first await acts as the session check as well as fetching the data.
  const [dashboard, nextClass, classExercises, goal] = await Promise.all([
    getUserDashboard(),
    getNextClass(),
    getClassExercisesToDo(),
    getStudyGoal(),
  ]);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace platform-workspace_side_none">
        <HomeSection dashboard={dashboard} nextClass={nextClass} classExercises={classExercises} goal={goal} />
      </div>
    </div>
  );
}
