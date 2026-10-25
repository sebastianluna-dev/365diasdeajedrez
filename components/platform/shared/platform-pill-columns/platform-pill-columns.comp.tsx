import { useId } from "react";
import { capsule, dot, f1, percentOf } from "@/lib/charts/chart-geometry";
import "./platform-pill-columns.comp.css";

export interface PlatformPillColumn {
  /** Unique among the columns: a day's key, a month's. */
  key: string;
  /** Under the column; empty to leave it unnamed (only some days of a month are). */
  axis: string;
  /** What a screen reader says for it: «domingo 25». */
  long: string;
  value: number;
}

interface PlatformPillColumnsProps {
  columns: readonly PlatformPillColumn[];
  /** After every value, in the tag and in words: «min», «superados». */
  unit: string;
  /** What the chart is, before its values in words: «Minutos de estudio cada día del 1 al 25 de octubre». */
  label: string;
  /** The column to look at, hatched with its value in a tag over it: the last (today) when not given. */
  highlight?: number;
  /** A dashed line across at this value, named at the right: the daily goal. */
  goal?: { value: number; label: string };
  /** The drawing's box: it stretches to its container's width, keeping this ratio. */
  width?: number;
  height?: number;
  /** The widest a column gets, in the box's units. */
  maxColumn?: number;
}

/** Room over the tallest column for the tag. */
const PAD_TOP = 34;

/**
 * A column per value, each a pill (2026-10-25, the owner's «Estadísticas · C»
 * and the chart vocabulary of «Gráficas del perfil»): the columns in the
 * neutral grey with a dot on each top, the one to look at hatched in the
 * primary with its value in a tag over it, a dot on the axis for a column
 * of nothing, and, when given, the goal as a dashed line across with its
 * name at the right. One image, named by `label` followed by every value;
 * the axis under it is hidden from a screen reader, which reads the label.
 */
export function PlatformPillColumns({
  columns,
  unit,
  label,
  highlight,
  goal,
  width = 712,
  height = 170,
  maxColumn = 24,
}: PlatformPillColumnsProps) {
  const hatch = `pill-columns-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const count = columns.length;
  if (count === 0) return null;
  const on = highlight ?? count - 1;
  const gap = Math.max(6, Math.round((width / count) * 0.2));
  const column = Math.max(4, Math.min(maxColumn, Math.floor((width - gap * (count - 1)) / count)));
  const left = (width - (column * count + gap * (count - 1))) / 2;
  const top = Math.max(1, goal?.value ?? 0, ...columns.map((entry) => entry.value));
  const heightOf = (value: number) => (value <= 0 ? 0 : Math.max(column, ((height - PAD_TOP) * value) / top));
  const xOf = (index: number) => left + index * (column + gap);

  let base = "";
  let dots = "";
  let lit = "";
  let litDot = "";
  let tag: { x: number; y: number; text: string } | null = null;
  columns.forEach((entry, index) => {
    const x = xOf(index);
    const h = heightOf(entry.value);
    const y = height - h;
    if (h === 0) {
      dots += dot(x + column / 2, height - 3, 3);
      if (index === on) tag = { x: x + column / 2, y: height - 10, text: `${entry.value} ${unit}` };
      return;
    }
    if (index === on) {
      lit = capsule(x, y, column, h);
      litDot = dot(x + column / 2, y + column / 2, 3.5);
      tag = { x: x + column / 2, y: y - 6, text: `${entry.value} ${unit}` };
    } else {
      base += capsule(x, y, column, h);
      dots += dot(x + column / 2, y + column / 2, 2.5);
    }
  });
  const goalY = goal ? height - ((height - PAD_TOP) * goal.value) / top : null;
  const shown = tag as { x: number; y: number; text: string } | null;
  const words = columns.map((entry) => `${entry.long} ${entry.value} ${unit}`).join(", ");

  return (
    <div className="platform-pill-columns">
      <div className="platform-pill-columns__stage">
        <svg
          className="platform-pill-columns__svg"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${label}${goal ? ` (${goal.label})` : ""}: ${words}.`}
        >
          <defs>
            <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect className="platform-pill-columns__hatch-ground" width="6" height="6" />
              <rect className="platform-pill-columns__hatch-stripe" width="2.5" height="6" />
            </pattern>
          </defs>
          <path className="platform-pill-columns__base" d={base} />
          {lit && <path d={lit} fill={`url(#${hatch})`} />}
          {goalY !== null && (
            <path className="platform-pill-columns__goal" d={`M0,${f1(goalY)}L${width},${f1(goalY)}`} />
          )}
          <path className="platform-pill-columns__dots" d={dots} />
          {litDot && <path className="platform-pill-columns__lit-dot" d={litDot} />}
        </svg>
        {goal && goalY !== null && (
          <span
            className="platform-pill-columns__goal-label"
            style={{ top: percentOf(goalY - 16, height) }}
            aria-hidden="true"
          >
            {goal.label}
          </span>
        )}
        {shown && (
          <span
            className="platform-pill-columns__tag"
            style={{ left: percentOf(shown.x, width), top: percentOf(shown.y, height) }}
            aria-hidden="true"
          >
            {shown.text}
          </span>
        )}
      </div>
      <div className="platform-pill-columns__axis" aria-hidden="true">
        {columns.map((entry, index) =>
          entry.axis ? (
            <span
              key={entry.key}
              className={`platform-pill-columns__axis-label${index === on ? " platform-pill-columns__axis-label_state_on" : ""}`}
              style={{ left: percentOf(xOf(index) + column / 2, width) }}
            >
              {entry.axis}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}
