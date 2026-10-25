import "./platform-streak-legend.comp.css";

/**
 * «Menos ● ● ● ● Más»: the four depths of `PlatformStreakCalendar`, for
 * beside it — a grey speck for a day of nothing, then the three blues.
 * Decorative: the calendar's own label says the data.
 */
export function PlatformStreakLegend() {
  return (
    <div className="platform-streak-legend" aria-hidden="true">
      Menos
      {[0, 1, 2, 3].map((level) => (
        <span key={level} className={`platform-streak-legend__dot platform-streak-legend__dot_level_${level}`} />
      ))}
      Más
    </div>
  );
}
