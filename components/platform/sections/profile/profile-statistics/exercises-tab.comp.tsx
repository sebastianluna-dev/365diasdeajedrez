import { PlatformBigNumber } from "@/components/platform/shared/platform-big-number/platform-big-number.comp";
import { PlatformCompareBars } from "@/components/platform/shared/platform-compare-bars/platform-compare-bars.comp";
import { PlatformDonut } from "@/components/platform/shared/platform-donut/platform-donut.comp";
import { PlatformPillColumns } from "@/components/platform/shared/platform-pill-columns/platform-pill-columns.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { weeksUpTo } from "@/lib/study-streak";
import type { ExerciseStatistics, StudentStatistics } from "@/services/stats/stats.types";
import { StatsCard } from "./stats-card.comp";
import { formatCount, periodOver, periodPhrase, plural, shortDayLabel } from "./statistics-copy";

const HISTORY = { label: "Ver tu historial", href: platformRoutes.exerciseHistory };

/** «82.5 %» of the attempts passed, as Mexico writes a decimal; null with none. */
function passedShare(outcomes: ExerciseStatistics["outcomes"]): number | null {
  const attempts = outcomes.clean + outcomes.hinted + outcomes.wrong + outcomes.shown;
  return attempts === 0 ? null : Math.round(((outcomes.clean + outcomes.hinted) / attempts) * 1000) / 10;
}

/**
 * «Ejercicios»: the exercises passed week by week, the last eight with this
 * one hatched, beside the period's figure and its share of attempts solved;
 * under them how the period's attempts went, the topics most tried and what
 * comes back today to review. The attempts made from a class block count
 * for the class and are left out here (D49).
 */
export function ExercisesTab({
  statistics,
  exercises,
}: {
  statistics: StudentStatistics;
  exercises: ExerciseStatistics;
}) {
  const { period, today } = statistics;
  const { outcomes } = exercises;
  const attempts = outcomes.clean + outcomes.hinted + outcomes.wrong + outcomes.shown;
  const share = passedShare(outcomes);
  const weeks = weeksUpTo(today, exercises.weeklyPassed.length);
  const columns = exercises.weeklyPassed.map((value, index) => {
    const monday = weeks[index]?.[0] ?? today;
    return { key: monday, axis: shortDayLabel(monday), long: `semana del ${shortDayLabel(monday)}`, value };
  });
  const hardest = [...exercises.themes]
    .filter((theme) => theme.tried > 0)
    .sort((left, right) => left.solved / left.tried - right.solved / right.tried)[0];

  return (
    <div className="profile-statistics__tab-panel">
      <StatsCard
        size="hero"
        icon="circle-check"
        title="Superados por semana"
        subtitle={`Las últimas ${exercises.weeklyPassed.length} semanas`}
        link={HISTORY}
        reads="Cada columna es una semana: los ejercicios que superaste por primera vez. La rayada es esta, que cierra el domingo. No cambia con el periodo."
      >
        <div className="profile-statistics__hero">
          <div className="profile-statistics__hero-side">
            <PlatformBigNumber
              label={`superados ${periodOver(period)}`}
              value={exercises.passed}
              note={
                share === null
                  ? `Sin intentos ${periodPhrase(period.key)}`
                  : `${share.toLocaleString("es-MX")} % de tus ${formatCount(attempts)} intentos, resueltos`
              }
            />
          </div>
          <div className="profile-statistics__hero-chart">
            <PlatformPillColumns
              columns={columns}
              unit={exercises.weeklyPassed.at(-1) === 1 ? "superado" : "superados"}
              label={`Ejercicios superados por semana, las últimas ${columns.length}`}
              maxColumn={40}
            />
          </div>
        </div>
      </StatsCard>

      <div className="profile-statistics__row">
        <StatsCard
          icon="lightbulb"
          title="Tus intentos"
          subtitle={`${plural(attempts, "ejercicio", "ejercicios")} ${periodPhrase(period.key)}`}
          link={HISTORY}
          reads="Cómo te fue cada vez que intentaste uno. Con pista también cuenta como superado; los de tus clases cuentan para la clase y no aquí."
        >
          <PlatformDonut
            segments={[
              { key: "clean", label: "Resueltos", value: outcomes.clean, tone: "hatch" },
              { key: "hinted", label: "Con pista", value: outcomes.hinted, tone: "mid" },
              { key: "wrong", label: "Fallados", value: outcomes.wrong, tone: "ink" },
              { key: "shown", label: "Viste la solución", value: outcomes.shown, tone: "neutral" },
            ]}
            label={`Tus ${attempts} intentos de ejercicios ${periodPhrase(period.key)}: ${outcomes.clean} resueltos, ${outcomes.hinted} resueltos con pista, ${outcomes.wrong} fallados y ${outcomes.shown} en los que viste la solución.`}
          />
        </StatsCard>

        <StatsCard
          icon="tag"
          title="Por tema"
          subtitle="Resueltos de cada tema"
          link={{ label: "Practicar por tema", href: platformRoutes.exerciseTrainer() }}
          reads={
            hardest
              ? `La cifra es cuántos resolviste; abajo, cuántos intentaste. ${hardest.label} es el que más te cuesta.`
              : "Cuando intentes ejercicios con tema, verás aquí cómo te va en cada uno."
          }
        >
          <PlatformCompareBars
            height={100}
            bars={exercises.themes.map((theme) => ({
              key: theme.label,
              name: theme.label,
              value: theme.solved,
              detail: `de ${theme.tried}`,
              highlighted: theme === hardest,
            }))}
            label={`Ejercicios ${periodPhrase(period.key)} por tema: ${
              exercises.themes
                .map((theme) => `${theme.label}, ${theme.solved} resueltos de ${theme.tried}`)
                .join("; ") || "ninguno todavía"
            }.`}
          />
        </StatsCard>

        <StatsCard
          icon="rotate-left"
          title="Para repasar hoy"
          subtitle="Los que fallaste, de vuelta tras unos días"
          link={HISTORY}
          reads={
            exercises.reviewDue > 0
              ? "Son ejercicios que fallaste y que ya toca volver a intentar: están en tu historial. No cambia con el periodo."
              : "Nada pendiente: cuando falles uno, aparecerá aquí unos días después."
          }
        >
          <PlatformBigNumber
            label="para repasar"
            value={exercises.reviewDue}
            unit={exercises.reviewDue === 1 ? "ejercicio" : "ejercicios"}
          />
        </StatsCard>
      </div>
    </div>
  );
}
