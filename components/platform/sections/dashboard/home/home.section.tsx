import { ActivityList } from "@/components/platform/shared/activity-list/activity-list.comp";
import type { ClassCardData, ClassExercisesToDo } from "@/services/classes/classes.types";
import type { DashboardData } from "@/services/dashboard/dashboard.types";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import { StatsCards } from "@/components/platform/sections/dashboard/activity-stats/stats-cards.comp";
import { HomeDay } from "./home-day.comp";
import { HomeFocus } from "./home-focus.comp";
import { HomeLater } from "./home-later.comp";
import { homePlanOf } from "./home-plan";
import "./home.section.css";

/** Where «Ver tus estadísticas» leads, down the page. */
const STATS_ID = "estadisticas";

interface HomeSectionProps {
  /** The profile, the course in progress, the statistics and the recent activity (`getUserDashboard`). */
  dashboard: DashboardData;
  /** The first class ahead that is not cancelled (`getNextClass`). */
  nextClass: ClassCardData | null;
  /** A class's exercises still undone (`getClassExercisesToDo`). */
  classExercises: ClassExercisesToDo | null;
  /** The streak and today's minutes against the goal (`getStudyGoal`). */
  goal: StudyGoal;
}

/**
 * The student's home page, «Inicio», in the new design system (2026-10-23,
 * the owner's «Inicio: un solo foco»): no side column, the white panel on
 * the canvas with one column in its middle. Its first screen is the
 * greeting, «Lo siguiente» (`HomeFocus`: today's class, the course in
 * progress, the next class, or choosing what to study, by `homePlanOf`),
 * «Después» (`HomeLater`) and, at the screen's foot, the day
 * (`HomeDay`: the streak, today's minutes against the goal and «Ver tus
 * estadísticas»). Under it, «lo demás»: the statistics by period and the
 * recent activity. Data in; what comes first is decided here.
 */
export function HomeSection({ dashboard, nextClass, classExercises, goal }: HomeSectionProps) {
  const plan = homePlanOf({ nextClass, continueStudying: dashboard.continueStudying, classExercises });
  const firstName = dashboard.profile.displayName.split(/\s+/).find(Boolean) ?? dashboard.profile.displayName;

  return (
    <section className="platform-workspace__panel home" aria-labelledby="home-title">
      <div className="home__column">
        <div className="home__today">
          <header className="home__greeting">
            <h1 id="home-title" className="home__title">
              ¿Qué vamos a estudiar hoy, {firstName}?
            </h1>
            <p className="home__subtitle">Lo más importante primero; lo demás, debajo.</p>
          </header>

          <HomeFocus focus={plan.focus} />
          <HomeLater items={plan.later} />
          <div className="home__foot">
            <HomeDay goal={goal} statsId={STATS_ID} />
          </div>
        </div>

        <section id={STATS_ID} className="home__block" aria-labelledby="home-stats-title">
          <h2 id="home-stats-title" className="home__block-title">
            Tus estadísticas
          </h2>
          <StatsCards stats={dashboard.stats} />
        </section>

        <section className="home__block" aria-labelledby="home-activity-title">
          <h2 id="home-activity-title" className="home__block-title">
            Actividad reciente
          </h2>
          {dashboard.recentActivity.length > 0 ? (
            <ActivityList items={dashboard.recentActivity} />
          ) : (
            <p className="home__empty">
              Todavía no hay actividad. Completa lecciones o resuelve ejercicios para verla aquí.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
