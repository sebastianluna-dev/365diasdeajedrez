import type { LevelPoint } from "@/services/play/play.types";
import "./level-sparkline.comp.css";

const WIDTH = 220;
const HEIGHT = 48;
const PAD = 3;

/** The points as an SVG path, scaled to the box with a little headroom. */
function pathOf(points: readonly LevelPoint[]): { line: string; area: string } {
  const levels = points.map((point) => point.level);
  const low = Math.min(...levels) - 25;
  const high = Math.max(...levels) + 25;
  const x = (index: number) => PAD + (index * (WIDTH - 2 * PAD)) / Math.max(1, points.length - 1);
  const y = (level: number) => HEIGHT - PAD - ((level - low) * (HEIGHT - 2 * PAD)) / (high - low);
  const line = points.map(
    (point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point.level).toFixed(1)}`,
  );
  return {
    line: line.join(" "),
    area: `${line.join(" ")} L${x(points.length - 1).toFixed(1)},${HEIGHT} L${x(0).toFixed(1)},${HEIGHT} Z`,
  };
}

/**
 * How the level against bots moved, one point per finished game from the
 * fifth on: an SVG drawn here, no chart library. Says in words where it
 * started and where it is.
 */
export function LevelSparkline({ points }: { points: readonly LevelPoint[] }) {
  if (points.length < 2) return null;
  const { line, area } = pathOf(points);
  const first = points[0]!.level;
  const last = points.at(-1)!.level;
  const label = `De ≈ ${first} a ≈ ${last} en ${points.length} partidas`;
  return (
    <svg className="level-sparkline" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label}>
      <title>{label}</title>
      <path className="level-sparkline__area" d={area} />
      <path className="level-sparkline__line" d={line} />
    </svg>
  );
}
