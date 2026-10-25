import { PlatformBigNumber } from "@/components/platform/shared/platform-big-number/platform-big-number.comp";
import { PlatformCompareBars } from "@/components/platform/shared/platform-compare-bars/platform-compare-bars.comp";
import { PlatformDonut, type PlatformDonutTone } from "@/components/platform/shared/platform-donut/platform-donut.comp";
import { PlatformPillColumns } from "@/components/platform/shared/platform-pill-columns/platform-pill-columns.comp";
import { PlatformStreakCalendar } from "@/components/platform/shared/platform-streak-calendar/platform-streak-calendar.comp";
import { PlatformStreakLegend } from "@/components/platform/shared/platform-streak-legend/platform-streak-legend.comp";
import { changeLabel } from "@/lib/charts/chart-geometry";
import { platformRoutes } from "@/lib/platform-routes";
import type { StatsPeriod } from "@/lib/stats-period";
import type { StudentStatistics, StudyStatistics } from "@/services/stats/stats.types";
import { StatsCard } from "./stats-card.comp";
import { formatCount, periodOver, periodPhrase, plural, previousShort } from "./statistics-copy";

/** The topics' fills, the largest first: the hatch, then the blues, the grey last. */
const TOPIC_TONES: PlatformDonutTone[] = ["hatch", "deep", "mid", "light", "neutral"];

/** The days of a month the axis names: the 1st and every fifth, as the design draws them. */
const NAMED_DAYS = new Set(["1", "5", "10", "15", "20", "25", "30"]);

const ACTIVITY = { label: "Ver tu actividad", href: platformRoutes.dashboard };

/** The hero's title and what each column is, by how the period is grouped. */
function heroWords(period: StatsPeriod) {
  if (period.bucket === "day") {
    return {
      title: "Minutos de estudio, día por día",
      reads:
        "Cada columna es un día: los minutos de las lecciones que terminaste. Un punto solo: ese día no terminaste ninguna lección.",
    };
  }
  const unit = period.bucket === "month" ? "mes" : "año";
  return {
    title: `Minutos de estudio, ${unit} por ${unit}`,
    reads: `Cada columna es un ${unit}: los minutos de las lecciones que terminaste en él.`,
  };
}

/** «+12 % que septiembre a estas alturas», or what there was then when it was nothing. */
function changeNote(study: StudyStatistics, period: StatsPeriod): string | undefined {
  if (!period.previous || study.previousSoFar === null) return undefined;
  const change = changeLabel(study.minutes, study.previousSoFar);
  if (change) return `${change} que ${period.previous.name} a estas alturas`;
  return `${period.previous.name.charAt(0).toUpperCase()}${period.previous.name.slice(1)} a estas alturas: 0 min`;
}

/** «Ya llevas más lecciones que septiembre.», for the figure that grew the most; nothing when none grew. */
function didInsight(study: StudyStatistics, period: StatsPeriod): string {
  const grown = study.did
    .filter((entry) => entry.previous !== null && entry.current > entry.previous)
    .sort((left, right) => right.current - (right.previous ?? 0) - (left.current - (left.previous ?? 0)))[0];
  if (!period.previous) return "Todo lo que has hecho desde que entraste.";
  const base = `La cifra grande es ${periodPhrase(period.key)}; abajo, ${period.previous.name} completo.`;
  return grown ? `${base} Ya llevas más ${grown.label.toLowerCase()} que ${period.previous.name}.` : base;
}

/**
 * «Estudio»: the minutes of the period in pill columns with today hatched
 * and the daily goal dashed across, beside its total against the period
 * before; under them the streak's calendar, the period by topic and «Lo que
 * hiciste» against the period before. Only the activity and the lessons
 * finished: no game played is in any of them.
 */
export function StudyTab({ statistics }: { statistics: StudentStatistics }) {
  const { period, study } = statistics;
  const hero = heroWords(period);
  const daily = period.bucket === "day";
  const columns = study.columns.map((column) => ({
    ...column,
    axis: period.key === "mes" && !NAMED_DAYS.has(column.axis) && column.key !== statistics.today ? "" : column.axis,
  }));
  const todayMinutes = study.columns.at(-1)?.value ?? 0;
  const topicsTotal = study.topics.reduce((total, slice) => total + slice.value, 0);
  const top = study.topics[0];
  const previous = previousShort(period);
  const highlighted = study.did.reduce(
    (best, entry, index) => (entry.current > (study.did[best]?.current ?? 0) ? index : best),
    0,
  );

  return (
    <div className="profile-statistics__tab-panel">
      <StatsCard
        size="hero"
        icon="clock"
        title={hero.title}
        subtitle={daily ? `${period.label} · tu meta, ${study.goalMinutes} min al día` : period.label}
        link={ACTIVITY}
        reads={hero.reads}
      >
        <div className="profile-statistics__hero">
          <div className="profile-statistics__hero-side">
            <PlatformBigNumber
              label={periodOver(period)}
              value={study.minutes}
              unit="min"
              note={changeNote(study, period)}
            />
            {daily && (
              <ul className="profile-statistics__legend">
                <li className="profile-statistics__legend-item">
                  <span
                    className="profile-statistics__swatch profile-statistics__swatch_kind_hatch"
                    aria-hidden="true"
                  />
                  Hoy<strong>{todayMinutes} min</strong>
                </li>
                {study.goalMinutes > 0 && (
                  <li className="profile-statistics__legend-item">
                    <span
                      className="profile-statistics__swatch profile-statistics__swatch_kind_dash"
                      aria-hidden="true"
                    />
                    Tu meta<strong>{study.goalMinutes} min</strong>
                  </li>
                )}
                {study.goalDays !== null && (
                  <li className="profile-statistics__legend-item">
                    <span
                      className="profile-statistics__swatch profile-statistics__swatch_kind_dot"
                      aria-hidden="true"
                    />
                    Días cumplidos
                    <strong>
                      {study.goalDays} de {study.columns.length}
                    </strong>
                  </li>
                )}
              </ul>
            )}
          </div>
          <div className="profile-statistics__hero-chart">
            <PlatformPillColumns
              columns={columns}
              unit="min"
              label={`Minutos de estudio ${daily ? "cada día" : period.bucket === "month" ? "cada mes" : "cada año"}, ${period.label.charAt(0).toLowerCase()}${period.label.slice(1)}`}
              goal={
                daily && study.goalMinutes > 0
                  ? { value: study.goalMinutes, label: `meta ${study.goalMinutes} min` }
                  : undefined
              }
            />
          </div>
        </div>
      </StatsCard>

      <div className="profile-statistics__row">
        <StatsCard
          icon="fire"
          title="Racha de estudio"
          subtitle={`${plural(study.streak.streak.days, "día seguido", "días seguidos")} · tu mejor, ${study.streak.bestStreak}`}
          link={ACTIVITY}
          reads="Las últimas 16 semanas, un punto por día; entre más azul, más hiciste. No cambia con el periodo."
        >
          <PlatformStreakCalendar
            weeks={study.streak.weeks}
            streak={study.streak.streak}
            tag={plural(study.streak.streak.days, "día", "días")}
            label={`Tus últimas 16 semanas: estudiaste ${plural(study.streak.daysStudied, "día", "días")}; tu racha es de ${plural(study.streak.streak.days, "día", "días")} y la mejor, de ${study.streak.bestStreak}.`}
          />
          <PlatformStreakLegend />
        </StatsCard>

        <StatsCard
          icon="tag"
          title="Por tema"
          subtitle={`${plural(topicsTotal, "cosa", "cosas")} que hiciste ${periodPhrase(period.key)}`}
          reads={
            top && topicsTotal > 0
              ? `De qué se trató lo que estudiaste: ${top.label.toLowerCase()} ${
                  top.value * 2 > topicsTotal ? "se lleva más de la mitad" : "es lo que más hiciste"
                }.`
              : "Cuando termines una lección o un ejercicio con tema, aparecerá aquí."
          }
        >
          <PlatformDonut
            segments={study.topics.map((slice, index) => ({
              key: slice.label,
              label: slice.label,
              value: slice.value,
              tone: TOPIC_TONES[index] ?? "neutral",
            }))}
            label={`De qué trató lo que hiciste ${periodPhrase(period.key)}: ${
              study.topics.map((slice) => `${slice.label} ${slice.value}`).join(", ") || "nada todavía"
            }.`}
          />
        </StatsCard>

        <StatsCard
          icon="circle-check"
          title="Lo que hiciste"
          subtitle={`${periodPhrase(period.key).charAt(0).toUpperCase()}${periodPhrase(period.key).slice(1)}${
            study.coursesCompleted > 0 ? ` · y terminaste ${plural(study.coursesCompleted, "curso", "cursos")}` : ""
          }`}
          link={ACTIVITY}
          reads={didInsight(study, period)}
        >
          <PlatformCompareBars
            height={100}
            bars={study.did.map((entry, index) => ({
              key: entry.key,
              name: entry.label,
              value: entry.current,
              detail: entry.previous === null ? undefined : `${previous}: ${formatCount(entry.previous)}`,
              highlighted: index === highlighted && entry.current > 0,
            }))}
            label={`Lo que hiciste ${periodPhrase(period.key)}${
              period.previous ? `, y en ${period.previous.name}` : ""
            }: ${study.did
              .map(
                (entry) =>
                  `${entry.label} ${entry.current}${entry.previous === null ? "" : ` (${period.previous?.name} ${entry.previous})`}`,
              )
              .join(", ")}.`}
          />
        </StatsCard>
      </div>
    </div>
  );
}
