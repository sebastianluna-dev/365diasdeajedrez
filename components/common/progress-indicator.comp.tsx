import "./progress-indicator.comp.css";

interface ProgressIndicatorProps {
  percent: number;
  /** "3 de 7 lecciones", optional. */
  detail?: string;
  /**
   * `inline` (default): bar and label on the same line.
   * `stacked`: percentage and detail at the ends and the bar below, as in
   * the course card.
   */
  layout?: "inline" | "stacked";
}

export function ProgressIndicator({ percent, detail, layout = "inline" }: ProgressIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  if (layout === "stacked") {
    return (
      <div className="progress-indicator progress-indicator_layout_stacked">
        <div className="progress-indicator__legend">
          <span className="progress-indicator__percent">{clamped}%</span>
          {detail && <span className="progress-indicator__detail">{detail}</span>}
        </div>

        <div className="progress-indicator__track">
          <div className="progress-indicator__fill" style={{ width: `${clamped}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="progress-indicator">
      <div className="progress-indicator__track">
        <div className="progress-indicator__fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className="progress-indicator__label">
        {clamped}%{detail ? ` · ${detail}` : ""}
      </span>
    </div>
  );
}
