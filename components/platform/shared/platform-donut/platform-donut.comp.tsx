import { useId } from "react";
import { f1, percentOf } from "@/lib/charts/chart-geometry";
import "./platform-donut.comp.css";

/**
 * A segment's fill, by what it is and not by its colour: `hatch` the one to
 * look at, `deep`, `mid` and `light` three blues for the next ones, `ink`
 * the dark grey of what went wrong, `neutral` the light grey of the rest,
 * and `open` an outline only, for what is not over yet.
 */
export type PlatformDonutTone = "hatch" | "deep" | "mid" | "light" | "ink" | "neutral" | "open";

export interface PlatformDonutSegment {
  /** Unique among the segments. */
  key: string;
  /** In the legend: «Resueltos». */
  label: string;
  value: number;
  tone: PlatformDonutTone;
}

interface PlatformDonutProps {
  segments: readonly PlatformDonutSegment[];
  /** The chart in words: the total and every segment. */
  label: string;
  /**
   * The white tag on the first segment: its share («56 %») when not given,
   * or what is given («6 de 10»).
   */
  tag?: string;
  /** The drawing's side and the ring's thickness, in px. */
  size?: number;
  thickness?: number;
}

/** Degrees left empty between two segments. */
const GAP_DEGREES = 7;
/** The radius of a segment's rounded corners. */
const CORNER = 5;

/**
 * A ring of separate segments with round ends and a gap between each
 * (2026-10-25, the owner's «Estadísticas · C»: what the period was about,
 * how the attempts went, the record), its first segment hatched with a
 * white tag on it and the legend beside it, each label with its figure.
 * The ring is one image named by `label`; the legend is a list a screen
 * reader reads too. A segment of nothing is left out of the ring, not of
 * the legend; with nothing at all the ring is a grey track.
 */
export function PlatformDonut({ segments, label, tag, size = 112, thickness = 20 }: PlatformDonutProps) {
  const hatch = `donut-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const centre = size / 2;
  const radius = size / 2 - thickness / 2 - 2;
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0);
  const point = (r: number, degrees: number) => {
    const rad = (degrees * Math.PI) / 180;
    return `${f1(centre + r * Math.sin(rad))},${f1(centre - r * Math.cos(rad))}`;
  };
  const corner = ((CORNER / radius) * 180) / Math.PI;
  const inner = radius - thickness / 2 + CORNER;
  const outer = radius + thickness / 2 - CORNER;
  const drawn = segments.filter((segment) => segment.value > 0);
  const gap = drawn.length > 1 ? GAP_DEGREES : 0;

  let at = 0;
  let first: { x: number; y: number; share: number } | null = null;
  const paths = drawn.map((segment) => {
    const start = (at / total) * 360;
    const end = ((at + segment.value) / total) * 360;
    at += segment.value;
    if (first === null) {
      const middle = (((start + end) / 2) * Math.PI) / 180;
      first = {
        x: centre + radius * Math.sin(middle),
        y: centre - radius * Math.cos(middle),
        share: Math.round((segment.value / total) * 100),
      };
    }
    // A whole ring is two halves: one arc cannot start and end on the same point.
    let from = start + gap / 2 + corner;
    let to = end - gap / 2 - corner;
    if (drawn.length === 1) {
      from = 0;
      to = 359.9;
    }
    if (to <= from) {
      const middle = (start + end) / 2;
      from = middle - 0.3;
      to = middle + 0.3;
    }
    const large = to - from > 180 ? 1 : 0;
    const d =
      `M${point(outer, from)}A${outer},${outer} 0 ${large} 1 ${point(outer, to)}` +
      `L${point(inner, to)}A${inner},${inner} 0 ${large} 0 ${point(inner, from)}Z`;
    return { segment, d };
  });
  const tagAt = first as { x: number; y: number; share: number } | null;

  return (
    <div className="platform-donut">
      <div className="platform-donut__chart" style={{ width: size, height: size }}>
        <svg
          className="platform-donut__svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={label}
        >
          <defs>
            <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect className="platform-donut__hatch-ground" width="6" height="6" />
              <rect className="platform-donut__hatch-stripe" width="2.5" height="6" />
            </pattern>
          </defs>
          {total === 0 ? (
            <circle className="platform-donut__track" cx={centre} cy={centre} r={radius} strokeWidth={thickness} />
          ) : (
            paths.map(({ segment, d }) => (
              <path
                key={segment.key}
                d={d}
                className={`platform-donut__segment platform-donut__segment_tone_${segment.tone}`}
                fill={segment.tone === "hatch" ? `url(#${hatch})` : undefined}
                stroke={segment.tone === "hatch" ? `url(#${hatch})` : undefined}
              />
            ))
          )}
        </svg>
        {tagAt && (
          <span
            className="platform-donut__tag"
            style={{ left: percentOf(tagAt.x, size), top: percentOf(tagAt.y, size) }}
            aria-hidden="true"
          >
            {tag ?? `${tagAt.share} %`}
          </span>
        )}
      </div>
      <ul className="platform-donut__legend">
        {segments.map((segment) => (
          <li key={segment.key} className="platform-donut__item">
            <span className={`platform-donut__swatch platform-donut__swatch_tone_${segment.tone}`} aria-hidden="true" />
            <span className="platform-donut__name">{segment.label}</span>
            <span className="platform-donut__value">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
