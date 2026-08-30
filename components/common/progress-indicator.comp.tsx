import "./progress-indicator.comp.css";

interface ProgressIndicatorProps {
  percent: number;
  /** "3 de 7 lecciones", opcional. */
  detail?: string;
}

export function ProgressIndicator({ percent, detail }: ProgressIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

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
