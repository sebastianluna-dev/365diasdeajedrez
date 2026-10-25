import "./platform-compare-bars.comp.css";

export interface PlatformCompareBar {
  /** Unique among the bars. */
  key: string;
  /** Under the column: «Don Chuy». */
  name: string;
  /** Under the name, small: its rating, «783». */
  caption?: string;
  /** The column's height, and the large figure inside its top. */
  value: number;
  /** Under the figure, small: «3–2–1». */
  detail?: string;
  /** The one to look at, filled with the primary. */
  highlighted?: boolean;
}

interface PlatformCompareBarsProps {
  bars: readonly PlatformCompareBar[];
  /** The chart in words: every column with its figure and detail. */
  label: string;
  /** The tallest column's height, in px. */
  height?: number;
}

/**
 * Columns side by side with their figure written inside the top (2026-10-25,
 * the owner's «Gráficas del perfil», chart 5): each as tall as its value
 * against the largest, its name and caption under it, one of them
 * highlighted in the primary. One image, named by `label`; what is written
 * on it is hidden from a screen reader, which reads the label.
 */
export function PlatformCompareBars({ bars, label, height = 120 }: PlatformCompareBarsProps) {
  const top = Math.max(1, ...bars.map((bar) => bar.value));
  return (
    <div className="platform-compare-bars" role="img" aria-label={label}>
      {bars.map((bar) => (
        <div key={bar.key} className="platform-compare-bars__column" aria-hidden="true">
          <div className="platform-compare-bars__stage" style={{ height: `${height}px` }}>
            <div
              className={`platform-compare-bars__bar${bar.highlighted ? " platform-compare-bars__bar_state_highlighted" : ""}`}
              style={{ height: `${Math.max(Math.round((height * bar.value) / top), 60)}px` }}
            >
              <span className="platform-compare-bars__value">{bar.value}</span>
              {bar.detail && <span className="platform-compare-bars__detail">{bar.detail}</span>}
            </div>
          </div>
          <span className="platform-compare-bars__name">{bar.name}</span>
          {bar.caption && <span className="platform-compare-bars__caption">{bar.caption}</span>}
        </div>
      ))}
    </div>
  );
}
