import { PlatformBigNumber } from "@/components/platform/shared/platform-big-number/platform-big-number.comp";
import { PlatformDonut } from "@/components/platform/shared/platform-donut/platform-donut.comp";
import { PlatformLineChart } from "@/components/platform/shared/platform-line-chart/platform-line-chart.comp";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { platformRoutes } from "@/lib/platform-routes";
import { dayKey } from "@/lib/study-streak";
import type { PlayStatistics, StudentStatistics } from "@/services/stats/stats.types";
import { StatsCard } from "./stats-card.comp";
import { periodPhrase, plural, shortDayLabel } from "./statistics-copy";

interface PlayTabProps {
  statistics: StudentStatistics;
  play: PlayStatistics;
  /** The profile's «Partidas», where every game is; null without a profile. */
  gamesHref: string | null;
}

/**
 * «Jugar»: the level against the bots after each of the last games, with
 * the slider that picks one, and the period's record against them. Playing
 * is its own: none of this is in the streak, the minutes or the topics.
 */
export function PlayTab({ statistics, play, gamesHref }: PlayTabProps) {
  const { period } = statistics;
  const points = play.level.series.map((point) => ({
    label: shortDayLabel(dayKey(point.at, STUDY_DAY_TIMEZONE)),
    value: point.level,
  }));
  const first = points[0];
  const last = points.at(-1);
  const { wins, losses, draws, open } = play.record;
  const finished = wins + losses + draws;
  const games = finished + open;
  const winShare = finished > 0 ? Math.round((wins / finished) * 1000) / 10 : null;
  const gamesLink = gamesHref ? { label: "Ver tus partidas", href: gamesHref } : undefined;

  return (
    <div className="profile-statistics__tab-panel">
      <StatsCard
        size="hero"
        icon="robot"
        title="Nivel contra bots"
        subtitle={`Aproximado, ${play.level.sampleSize === 1 ? "tu última partida" : `tus últimas ${play.level.sampleSize} partidas`}`}
        link={{ label: "Jugar", href: platformRoutes.play }}
        reads={
          points.length >= 2 && first && last
            ? `Tu nivel después de cada partida: de ≈ ${first.value} a ≈ ${last.value}. Mueve el punto para ver cada una. No cambia con el periodo.`
            : "Juega un par de partidas contra los bots y aquí verás cómo cambia tu nivel."
        }
      >
        <div className="profile-statistics__hero">
          <div className="profile-statistics__hero-side">
            <PlatformBigNumber label="tu nivel" value={play.level.level} prefix="≈" note="Contra los bots" />
          </div>
          <div className="profile-statistics__hero-chart">
            <PlatformLineChart
              points={points}
              label={`Nivel contra bots después de cada una de tus últimas ${points.length} partidas: ${points
                .map((point) => `${point.label} ≈ ${point.value}`)
                .join(", ")}.`}
              sliderLabel="Partida elegida"
              valuePrefix="≈ "
            />
          </div>
        </div>
      </StatsCard>

      <div className="profile-statistics__row profile-statistics__row_count_2">
        <StatsCard
          icon="trophy"
          title="Tus partidas"
          subtitle={`${plural(games, "partida", "partidas")} contra los bots ${periodPhrase(period.key)}`}
          link={gamesLink}
          reads="Las partidas que empezaste en el periodo. Jugar no cuenta para tu racha ni para tus minutos de estudio."
        >
          <PlatformDonut
            segments={[
              { key: "win", label: "Ganadas", value: wins, tone: "hatch" },
              { key: "loss", label: "Perdidas", value: losses, tone: "ink" },
              { key: "draw", label: "Tablas", value: draws, tone: "neutral" },
              { key: "open", label: "En curso", value: open, tone: "open" },
            ]}
            tag={finished > 0 ? `${wins} de ${finished}` : undefined}
            label={`Partidas contra los bots ${periodPhrase(period.key)}: ${games}, ${wins} ganadas, ${losses} perdidas, ${draws} tablas y ${open} en curso.`}
          />
        </StatsCard>

        <StatsCard
          icon="chart-simple"
          title="Ganadas"
          subtitle={`De las que terminaste ${periodPhrase(period.key)}`}
          reads={
            finished > 0
              ? "Las tablas cuentan como terminadas; las que siguen en curso, no."
              : "Cuando termines una partida contra los bots, verás aquí cuántas ganaste."
          }
        >
          <PlatformBigNumber
            label="ganadas"
            value={winShare}
            fractionDigits={winShare !== null && !Number.isInteger(winShare) ? 1 : 0}
            unit="%"
            note={finished > 0 ? `${wins} de ${finished}` : undefined}
          />
        </StatsCard>
      </div>
    </div>
  );
}
