import type { Metadata } from "next";
import {
  ProfileStatisticsSection,
  parseStatisticsTab,
} from "@/components/platform/sections/profile/profile-statistics/profile-statistics.section";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";
import { parseStatsPeriod } from "@/lib/stats-period";
import { getContinueStudyingCourse } from "@/services/courses/courses.service";
import { getProfileHeadOf } from "@/services/profile/profile.service";
import { getStudentStatistics } from "@/services/stats/stats.service";

export const metadata: Metadata = {
  title: "Estadísticas",
};

interface StatisticsPageProps {
  /** `periodo`: semana, mes (the default), anio or todo; `seccion`: estudio (the default), ejercicios or jugar. */
  searchParams: Promise<{ periodo?: string; seccion?: string }>;
}

/**
 * «Estadísticas» (2026-10-25, the owner's «Estadísticas · C · Por
 * secciones»), in the new design system: the own person's only — it takes
 * no user name, and every read resolves the session in the DAL. The page
 * takes the window and bleeds onto the canvas; the section draws the
 * workspace: the profile's views and the period in the side column, the
 * three sections as tabs in the panel. «Jugar» and the profile's other views
 * exist only with `PLAY_ENABLED`, «Ejercicios» only with `EXERCISES_ENABLED`
 * (the service returns null for a section switched off).
 */
export default async function StatisticsPage({ searchParams }: StatisticsPageProps) {
  const { periodo, seccion } = await searchParams;
  const user = await getCurrentUser();
  const [statistics, course, head] = await Promise.all([
    getStudentStatistics(parseStatsPeriod(periodo)),
    getContinueStudyingCourse(),
    PLAY_ENABLED ? getProfileHeadOf(user.slug) : Promise.resolve(null),
  ]);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <ProfileStatisticsSection
        statistics={statistics}
        tab={parseStatisticsTab(seccion, statistics)}
        continueHref={course?.continueHref ?? platformRoutes.courses}
        profile={head ? { slug: head.slug, games: head.counts.games } : null}
      />
    </div>
  );
}
