import { dot, f1, polyline } from "@/lib/charts/chart-geometry";
import "./platform-sparkline.comp.css";

interface PlatformSparklineProps {
  /** The series, oldest first; fewer than two points draw nothing. */
  values: readonly number[];
  /** What the line says, in words: where it started and where it is («De ≈ 796 el 13 oct a ≈ 850 el 25 oct»). */
  label: string;
  /** The drawing's box, in px; it is drawn at that size. */
  width?: number;
  height?: number;
}

const PAD = 4;

/**
 * A mini line beside a figure (2026-10-25, the owner's «Gráficas del
 * perfil», chart 7): the series as a line over its filled area and its last
 * point marked, with no axes and no labels — the figure it goes with says
 * the number. One image, named by `label`.
 */
export function PlatformSparkline({ values, label, width = 96, height = 36 }: PlatformSparklineProps) {
  if (values.length < 2) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const span = high - low || 1;
  const x = (index: number) => PAD + (index * (width - 2 * PAD)) / (values.length - 1);
  const y = (value: number) => PAD + ((high - value) * (height - 2 * PAD)) / span;
  const line = polyline(values.map((value, index) => [x(index), y(value)] as const));
  const last = values.length - 1;
  const area = `${line}L${f1(x(last))},${height}L${f1(x(0))},${height}Z`;

  return (
    <svg
      className="platform-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      <path className="platform-sparkline__area" d={area} />
      <path className="platform-sparkline__line" d={line} />
      <path className="platform-sparkline__end" d={dot(x(last), y(values[last] ?? 0), 3.5)} />
    </svg>
  );
}
