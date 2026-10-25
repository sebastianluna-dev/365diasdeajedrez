"use client";

import { Slider } from "radix-ui";
import { useId, useState } from "react";
import { dot, f1, percentOf, polyline } from "@/lib/charts/chart-geometry";
import "./platform-line-chart.comp.css";

export interface PlatformLinePoint {
  /** When it was: «13 oct». */
  label: string;
  value: number;
}

interface PlatformLineChartProps {
  /** The series, oldest first; fewer than two points draw nothing. */
  points: readonly PlatformLinePoint[];
  /** The chart in words: every point with its value. */
  label: string;
  /** The slider's name: what it chooses («Partida elegida»). */
  sliderLabel: string;
  /** Before a value in the tag and the slider's text: «≈ ». */
  valuePrefix?: string;
  /** Every how much a dashed line crosses the chart, with its value at the left. */
  gridStep?: number;
  /** The drawing's box: it stretches to its container's width, keeping this ratio. */
  width?: number;
  height?: number;
}

const PAD_X = 12;
const PAD_TOP = 34;

/**
 * A series in time over its filled area, with a slider under it that picks
 * a point (2026-10-25, the owner's «Gráficas del perfil», chart 4): the
 * chosen point is marked, a hatched slice drops from it to the axis and its
 * value rides in a tag over it; the slider says its date under the thumb.
 * It starts on the last point. A Client Component for the slider; the
 * drawing is the one image, named by `label`, and the slider is Radix's,
 * moved with the arrows, Inicio and Fin or the pointer.
 */
export function PlatformLineChart({
  points,
  label,
  sliderLabel,
  valuePrefix = "",
  gridStep = 50,
  width = 580,
  height = 120,
}: PlatformLineChartProps) {
  const hatch = `line-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const count = points.length;
  const [chosen, setChosen] = useState(count - 1);
  if (count < 2) return null;
  const at = Math.min(Math.max(chosen, 0), count - 1);

  const values = points.map((point) => point.value);
  const low = Math.floor((Math.min(...values) - 30) / gridStep) * gridStep;
  const high = Math.max(...values) + 8;
  const step = (width - 2 * PAD_X) / (count - 1);
  const x = (index: number) => PAD_X + index * step;
  const y = (value: number) => PAD_TOP + ((high - value) * (height - PAD_TOP)) / (high - low);
  /** The line's height at any x, between its points: where the slice meets it. */
  const yAt = (position: number) => {
    const index = Math.min(count - 2, Math.max(0, Math.floor((position - PAD_X) / step)));
    const share = (position - x(index)) / step;
    const from = values[index] ?? 0;
    return y(from + ((values[index + 1] ?? from) - from) * share);
  };

  const line = polyline(values.map((value, index) => [x(index), y(value)] as const));
  const area = `${line}L${f1(x(count - 1))},${height}L${f1(x(0))},${height}Z`;
  const half = Math.min(12, step * 0.32);
  const left = Math.max(x(0), x(at) - half);
  const right = Math.min(x(count - 1), x(at) + half);
  const chosenValue = values[at] ?? 0;
  const slice =
    `M${f1(left)},${height}L${f1(left)},${f1(yAt(left))}L${f1(x(at))},${f1(y(chosenValue))}` +
    `L${f1(right)},${f1(yAt(right))}L${f1(right)},${height}Z`;
  const grid: number[] = [];
  for (let value = low + gridStep; value < high; value += gridStep) grid.push(value);
  const dots = values.map((value, index) => (index === at ? "" : dot(x(index), y(value), 2.5))).join("");
  const chosenText = `${valuePrefix}${chosenValue}`;

  return (
    <div className="platform-line-chart">
      <div className="platform-line-chart__stage">
        <svg className="platform-line-chart__svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
          <defs>
            <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect className="platform-line-chart__hatch-ground" width="6" height="6" />
              <rect className="platform-line-chart__hatch-stripe" width="2.5" height="6" />
            </pattern>
          </defs>
          <path
            className="platform-line-chart__grid"
            d={grid.map((value) => `M0,${f1(y(value))}L${width},${f1(y(value))}`).join("")}
          />
          <path className="platform-line-chart__area" d={area} />
          <path d={slice} fill={`url(#${hatch})`} />
          <path className="platform-line-chart__line" d={line} />
          <path className="platform-line-chart__dots" d={dots} />
          <path className="platform-line-chart__chosen" d={dot(x(at), y(chosenValue), 4.5)} />
        </svg>
        {grid.map((value) => (
          <span
            key={value}
            className="platform-line-chart__grid-label"
            style={{ top: percentOf(y(value) - 15, height) }}
            aria-hidden="true"
          >
            {value}
          </span>
        ))}
        <span
          className="platform-line-chart__tag"
          style={{ left: percentOf(Math.min(width - 26, x(at)), width), top: percentOf(y(chosenValue) - 10, height) }}
          aria-hidden="true"
        >
          {chosenText}
        </span>
      </div>

      <div className="platform-line-chart__control" style={{ marginInline: percentOf(PAD_X, width) }}>
        <Slider.Root
          className="platform-line-chart__slider"
          min={0}
          max={count - 1}
          step={1}
          value={[at]}
          onValueChange={([next]) => setChosen(next ?? count - 1)}
        >
          <Slider.Track className="platform-line-chart__track" />
          <Slider.Thumb
            className="platform-line-chart__thumb"
            aria-label={sliderLabel}
            aria-valuetext={`${points[at]?.label ?? ""}, ${chosenText}`}
          />
        </Slider.Root>
        <div className="platform-line-chart__dates" aria-hidden="true">
          {at > 1 && <span className="platform-line-chart__first">{points[0]?.label}</span>}
          <span className="platform-line-chart__date" style={{ left: percentOf(at, count - 1) }}>
            {points[at]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
