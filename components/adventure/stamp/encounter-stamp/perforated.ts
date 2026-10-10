const round = (value: number) => Math.round(value * 10) / 10;

/**
 * The outline of a postage stamp: a rectangle from the origin whose four edges
 * are bitten by half circles of radius `radius` at a regular `pitch`, as a path
 * (ported from the mockup's `perforated`). Each edge has at least two bites and
 * as many as fit at the pitch, spread evenly along it.
 */
export function perforated(width: number, height: number, radius = 3.2, pitch = 10): string {
  const side = (x0: number, y0: number, x1: number, y1: number) => {
    const length = Math.hypot(x1 - x0, y1 - y0);
    const bites = Math.max(2, Math.round(length / pitch));
    const ux = (x1 - x0) / length;
    const uy = (y1 - y0) / length;
    const gap = length / bites;
    let d = "";
    for (let index = 0; index < bites; index += 1) {
      const cx = x0 + ux * gap * (index + 0.5);
      const cy = y0 + uy * gap * (index + 0.5);
      d += `L${round(cx - ux * radius)} ${round(cy - uy * radius)}A${radius} ${radius} 0 0 0 ${round(cx + ux * radius)} ${round(cy + uy * radius)}`;
    }
    return `${d}L${round(x1)} ${round(y1)}`;
  };
  return `M0 0${side(0, 0, width, 0)}${side(width, 0, width, height)}${side(width, height, 0, height)}${side(0, height, 0, 0)}Z`;
}

/** A hex colour moved toward white (`amount` > 0) or black (< 0) by that fraction, as the mockup's `shade`. */
export function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const part = Math.abs(amount);
  const channel = (value: number) => Math.round((target - value) * part + value);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(channel) as [number, number, number];
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
