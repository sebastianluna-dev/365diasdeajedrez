import { useId } from "react";
import { dot, f1, percentOf, polyline } from "@/lib/charts/chart-geometry";
import "./platform-band-chart.comp.css";

interface PlatformBandChartProps {
  /** The period on screen, as running totals: index 0 is its first day; it may stop short of `length` (today). */
  current: readonly number[];
  /** The period it is set against, as running totals, whole. */
  previous: readonly number[];
  /** Days on the axis: the longer of the two periods (31 for a month). */
  length: number;
  /** The days the axis names, 1-based: `{ at: 1, label: "1 oct" }`. */
  ticks: readonly { at: number; label: string }[];
  /** The chart in words: both totals at the marker and the previous period's end. */
  label: string;
  /** The pill over the marker: the change at that day («+12 %»); none when there is nothing to compare. */
  tag?: string | null;
  /** The drawing's box: it stretches to its container's width, keeping this ratio. */
  width?: number;
  height?: number;
}

const PAD_X = 6;
const PAD_TOP = 34;
const PAD_BOTTOM = 6;
/** Every how many days a point is marked on each line. */
const DOT_EVERY = 5;

/**
 * Two running totals and the band between them (2026-10-25, the owner's
 * «Gráficas del perfil», chart 2): this period as a solid blue line, the one
 * before as a dashed grey one, the stretch between them hatched, and a
 * marker on the last day of this period with the change in a tag over it.
 * One image, named by `label`; the axis under it says the days.
 */
export function PlatformBandChart({
  current,
  previous,
  length,
  ticks,
  label,
  tag,
  width = 432,
  height = 120,
}: PlatformBandChartProps) {
  const hatch = `band-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const days = Math.max(length, current.length, previous.length, 2);
  const top = Math.max(current.at(-1) ?? 0, previous.at(-1) ?? 0, 1) * 1.04;
  const x = (day: number) => PAD_X + ((day - 1) * (width - 2 * PAD_X)) / (days - 1);
  const y = (value: number) => height - PAD_BOTTOM - (value * (height - PAD_TOP - PAD_BOTTOM)) / top;
  const previousAt = (day: number) => previous[Math.min(day, previous.length) - 1] ?? 0;
  const pointsOf = (series: readonly number[]) => series.map((value, index) => [x(index + 1), y(value)] as const);

  const reached = current.length;
  const band =
    reached > 0 && previous.length > 0
      ? `${polyline(pointsOf(current))}${Array.from({ length: reached }, (_, index) => reached - index)
          .map((day) => `L${f1(x(day))},${f1(y(previousAt(day)))}`)
          .join("")}Z`
      : "";
  const marks = (series: readonly number[], skip?: number) =>
    series
      .map((value, index) => ({ value, day: index + 1 }))
      .filter(({ day }) => (day === 1 || day % DOT_EVERY === 0) && day !== skip)
      .map(({ value, day }) => dot(x(day), y(value), 2.5))
      .join("");

  const now = current.at(-1) ?? 0;
  const before = previousAt(reached);
  const markerTop = Math.min(y(now), y(before));

  return (
    <div className="platform-band-chart">
      <div className="platform-band-chart__stage">
        <svg className="platform-band-chart__svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
          <defs>
            <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect className="platform-band-chart__hatch-ground" width="6" height="6" />
              <rect className="platform-band-chart__hatch-stripe" width="1.4" height="6" />
            </pattern>
          </defs>
          {band && <path d={band} fill={`url(#${hatch})`} />}
          {previous.length > 0 && <path className="platform-band-chart__previous" d={polyline(pointsOf(previous))} />}
          {reached > 0 && <path className="platform-band-chart__current" d={polyline(pointsOf(current))} />}
          {reached > 0 && (
            <path
              className="platform-band-chart__marker"
              d={`M${f1(x(reached))},${f1(markerTop - 4)}L${f1(x(reached))},${height - PAD_BOTTOM}`}
            />
          )}
          <path className="platform-band-chart__previous-dots" d={marks(previous, reached)} />
          <path className="platform-band-chart__current-dots" d={marks(current.slice(0, -1))} />
          {previous.length > 0 && reached > 0 && (
            <path className="platform-band-chart__previous-dots" d={dot(x(reached), y(before), 3)} />
          )}
          {reached > 0 && <path className="platform-band-chart__end" d={dot(x(reached), y(now), 4)} />}
        </svg>
        {tag && reached > 0 && (
          <span
            className="platform-band-chart__tag"
            style={{ left: percentOf(x(reached), width), top: percentOf(markerTop - 8, height) }}
            aria-hidden="true"
          >
            {tag}
          </span>
        )}
      </div>
      <div className="platform-band-chart__ticks" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick.at} className="platform-band-chart__tick" style={{ left: percentOf(x(tick.at), width) }}>
            {tick.label}
          </span>
        ))}
      </div>
    </div>
  );
}
