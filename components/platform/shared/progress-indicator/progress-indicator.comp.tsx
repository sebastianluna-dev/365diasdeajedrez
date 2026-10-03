import "./progress-indicator.comp.css";

interface ProgressIndicatorProps {
  percent: number;
  /** "3 de 7 lecciones", optional. */
  detail?: string;
  /**
   * `inline` (default): bar and label on the same line.
   * `stacked`: percentage and detail at the ends and the bar below.
   * `figure`: the stacked one with the percentage as a large figure and the
   * detail small at the other end, as the catalog's course card draws it.
   */
  layout?: "inline" | "stacked" | "figure";
  /**
   * `progress` (default): the fill in the progress blue.
   * `success`: the fill in green, for what is finished. Not read from the
   * percentage, which is rounded: 199 lessons of 200 are 100% and unfinished.
   */
  tone?: "progress" | "success";
}

export function ProgressIndicator({ percent, detail, layout = "inline", tone = "progress" }: ProgressIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const className = [
    "progress-indicator",
    layout === "inline" ? null : `progress-indicator_layout_${layout}`,
    tone === "success" ? "progress-indicator_tone_success" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const track = (
    <div className="progress-indicator__track">
      <div className="progress-indicator__fill" style={{ width: `${clamped}%` }} />
    </div>
  );

  if (layout === "inline") {
    return (
      <div className={className}>
        {track}
        <span className="progress-indicator__label">
          {clamped}%{detail ? ` · ${detail}` : ""}
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="progress-indicator__legend">
        <span className="progress-indicator__percent">{clamped}%</span>
        {detail && <span className="progress-indicator__detail">{detail}</span>}
      </div>

      {track}
    </div>
  );
}
