// The shapes of the platform's charts (2026-10-25, the owner's «Gráficas del
// perfil»: pill columns, a hatched highlight with its tag, big thin figures),
// as SVG path data. Pure, so the paths are the same on the server and in a
// Client Component, and a test can read them without drawing anything.

/** A coordinate with one decimal: enough for a screen, and short paths. */
export function f1(value: number): string {
  return String(Math.round(value * 10) / 10);
}

/** A vertical capsule: a column `width` wide whose two ends are half circles; never shorter than it is wide. */
export function capsule(x: number, y: number, width: number, height: number): string {
  const r = width / 2;
  const h = Math.max(height, width);
  return (
    `M${f1(x)},${f1(y + r)}A${r},${r} 0 0 1 ${f1(x + width)},${f1(y + r)}` +
    `L${f1(x + width)},${f1(y + h - r)}A${r},${r} 0 0 1 ${f1(x)},${f1(y + h - r)}Z`
  );
}

/** A dot as a path, so many of them share one `<path>` and one fill. */
export function dot(cx: number, cy: number, r: number): string {
  return `M${f1(cx - r)},${f1(cy)}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;
}

/** A polyline through the points, as path data. */
export function polyline(points: readonly (readonly [number, number])[]): string {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${f1(x)},${f1(y)}`).join("");
}

/** A position along a box as a percentage, for what an HTML label sets over an SVG drawn to its width. */
export function percentOf(value: number, of: number): string {
  return `${f1(of === 0 ? 0 : (value / of) * 100)}%`;
}

/**
 * A percentage change, as the band chart's tag writes it: «+12 %», «−8 %»
 * (a true minus sign). Null when there is nothing to compare with.
 */
export function changeLabel(now: number, before: number): string | null {
  if (before <= 0) return null;
  const change = Math.round(((now - before) / before) * 100);
  return `${change >= 0 ? "+" : "−"}${Math.abs(change)} %`;
}
