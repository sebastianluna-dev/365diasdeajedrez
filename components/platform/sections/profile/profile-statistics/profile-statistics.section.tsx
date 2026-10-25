import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { RobotIcon } from "@/components/icons/robot-icon.comp";
import { PlatformSideNav, type PlatformSideNavGroup } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { PlatformSparkline } from "@/components/platform/shared/platform-sparkline/platform-sparkline.comp";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { platformRoutes } from "@/lib/platform-routes";
import { STATS_PERIODS, type StatsPeriodKey } from "@/lib/stats-period";
import { dayKey } from "@/lib/study-streak";
import type { StudentStatistics } from "@/services/stats/stats.types";
import { ExercisesTab } from "./exercises-tab.comp";
import { PlayTab } from "./play-tab.comp";
import { StudyTab } from "./study-tab.comp";
import { formatCount, plural, shortDayLabel } from "./statistics-copy";
import "./profile-statistics.section.css";

export type StatisticsTab = "estudio" | "ejercicios" | "jugar";

/** The tab an address asks for, when that section is on; «Estudio» otherwise. */
export function parseStatisticsTab(value: string | undefined, statistics: StudentStatistics): StatisticsTab {
  if (value === "ejercicios" && statistics.exercises) return "ejercicios";
  if (value === "jugar" && statistics.play) return "jugar";
  return "estudio";
}

interface ProfileStatisticsSectionProps {
  statistics: StudentStatistics;
  tab: StatisticsTab;
  /** Where «Seguir estudiando» leads: the course in progress, or the courses. */
  continueHref: string;
  /** The profile's other views, with the games' count; null without «Jugar», where there is no profile. */
  profile: { slug: string; games: number } | null;
}

/** «Este mes» as the title's line says it, before the dates. */
const PERIOD_LINE: Record<StatsPeriodKey, string> = {
  semana: "Esta semana",
  mes: "Este mes",
  anio: "Este año",
  todo: "Todo el tiempo",
};

/**
 * «Estadísticas» (2026-10-25, the owner's «Estadísticas · C · Por
 * secciones»), the student's own, in the new design system: a workspace
 * whose side column has «Seguir estudiando» as the FAB, the profile's views
 * — «Visión general», «Estadísticas» lit, «Partidas» with its count — and
 * the period as four links with a radio's ring, each in the address; and
 * whose panel is the title with the streak, three tabs — «Estudio»,
 * «Ejercicios», «Jugar», each with its figure and its sparkline, links in
 * the address too — and the open one's charts. Playing never enters the
 * study's figures: the note under the column says so, as the streak's pill does.
 */
export function ProfileStatisticsSection({ statistics, tab, continueHref, profile }: ProfileStatisticsSectionProps) {
  const { period, study, exercises, play } = statistics;
  const statisticsHref = (periodo: StatsPeriodKey, seccion: StatisticsTab) =>
    platformRoutes.profileStatistics({ periodo, seccion });

  const groups: PlatformSideNavGroup[] = [
    {
      title: "Perfil",
      links: [
        ...(profile
          ? [{ label: "Visión general", href: platformRoutes.userProfile(profile.slug), icon: "user" as const }]
          : []),
        { label: "Estadísticas", href: statisticsHref(period.key, tab), icon: "chart-simple", current: true },
        ...(profile
          ? [
              {
                label: "Partidas",
                href: platformRoutes.userProfileGames(profile.slug),
                icon: "chess-board" as const,
                count: profile.games,
              },
            ]
          : []),
      ],
    },
    {
      title: "Periodo",
      links: STATS_PERIODS.map((entry) => ({
        label: entry.label,
        href: statisticsHref(entry.key, tab),
        choice: true,
        current: entry.key === period.key,
        count: entry.key === period.key ? period.shortLabel : undefined,
      })),
    },
  ];

  const streakDays = study.streak.streak.days;
  const levelSeries = play?.level.series ?? [];
  const tabs = [
    {
      key: "estudio" as const,
      label: "Estudio",
      Icon: GraduationCapIcon,
      figure: formatCount(study.minutes),
      unit: "min",
      spark: { values: study.weekly, label: `Minutos de estudio por semana, las últimas ${study.weekly.length}: ${study.weekly.join(", ")}` },
    },
    ...(exercises
      ? [
          {
            key: "ejercicios" as const,
            label: "Ejercicios",
            Icon: LightbulbIcon,
            figure: formatCount(exercises.passed),
            unit: exercises.passed === 1 ? "superado" : "superados",
            spark: {
              values: exercises.weeklyPassed,
              label: `Ejercicios superados por semana, las últimas ${exercises.weeklyPassed.length}: ${exercises.weeklyPassed.join(", ")}`,
            },
          },
        ]
      : []),
    ...(play
      ? [
          {
            key: "jugar" as const,
            label: "Jugar",
            Icon: RobotIcon,
            figure: play.level.level === null ? "—" : `≈ ${play.level.level}`,
            unit: "nivel",
            spark: {
              values: levelSeries.map((point) => point.level),
              label: `Nivel contra bots en tus últimas ${levelSeries.length} partidas: ${levelSeries
                .map((point) => `${shortDayLabel(dayKey(point.at, STUDY_DAY_TIMEZONE))} ≈ ${point.level}`)
                .join(", ")}`,
            },
          },
        ]
      : []),
  ];

  return (
    <div className="platform-workspace profile-statistics">
      <div className="platform-workspace__side profile-statistics__side">
        <PlatformSideNav
          label="Tu perfil"
          action={{ label: "Seguir estudiando", href: continueHref, icon: "play" }}
          groups={groups}
        />
        <p className="profile-statistics__note">
          <CircleCheckIcon variant="duotone-light" className="profile-statistics__note-icon" />
          <span>
            Tu racha cuenta lecciones, {exercises ? "ejercicios, " : ""}clases y partidas analizadas. Jugar contra los
            bots no la mueve.
          </span>
        </p>
      </div>

      <section className="platform-workspace__panel profile-statistics__panel" aria-labelledby="estadisticas">
        <header className="profile-statistics__head">
          <div className="profile-statistics__heading">
            <h1 id="estadisticas" className="profile-statistics__title">
              Estadísticas
            </h1>
            <p className="profile-statistics__period">
              {PERIOD_LINE[period.key]}, {period.label.charAt(0).toLowerCase()}
              {period.label.slice(1)}
            </p>
          </div>
          <p className="profile-statistics__streak">
            <FireIcon variant="duotone-solid" className="profile-statistics__streak-icon" />
            <span>
              Racha de <strong>{plural(streakDays, "día", "días")}</strong>
              {play ? " · jugar no cuenta" : ""}
            </span>
          </p>
        </header>

        <nav className="profile-statistics__tabs" aria-label="Secciones de tus estadísticas">
          {tabs.map((entry) => {
            const on = entry.key === tab;
            return (
              <Link
                key={entry.key}
                href={statisticsHref(period.key, entry.key)}
                className={`profile-statistics__tab${on ? " profile-statistics__tab_state_current" : ""}`}
                aria-current={on ? "page" : undefined}
              >
                <span className="profile-statistics__tab-icon" aria-hidden="true">
                  <entry.Icon variant="duotone-light" className="profile-statistics__tab-glyph" />
                </span>
                <span className="profile-statistics__tab-text">
                  <span className="profile-statistics__tab-label">{entry.label}</span>
                  <span className="profile-statistics__tab-figure">
                    {entry.figure}
                    <span className="profile-statistics__tab-unit"> {entry.unit}</span>
                  </span>
                </span>
                <span className="profile-statistics__tab-spark">
                  <PlatformSparkline values={entry.spark.values} label={entry.spark.label} width={64} height={26} />
                </span>
              </Link>
            );
          })}
        </nav>

        {tab === "estudio" && <StudyTab statistics={statistics} />}
        {tab === "ejercicios" && exercises && <ExercisesTab statistics={statistics} exercises={exercises} />}
        {tab === "jugar" && play && (
          <PlayTab statistics={statistics} play={play} gamesHref={profile ? platformRoutes.userProfileGames(profile.slug) : null} />
        )}
      </section>
    </div>
  );
}
