const PERCENT = new Intl.NumberFormat("es", { style: "percent", maximumFractionDigits: 1 });

/**
 * A percentage as Spanish writes it: decimal comma and the sign apart, joined
 * by a non-breaking space ("69,5 %", not "69.5%"). Takes the figure out of
 * 100, as it is stored, and keeps at most one decimal.
 */
export function formatSpanishPercent(percentage: number): string {
  return PERCENT.format(percentage / 100);
}
