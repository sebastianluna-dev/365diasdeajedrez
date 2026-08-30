import "./loading-panel.comp.css";

interface LoadingPanelProps {
  label?: string;
}

export function LoadingPanel({ label = "Cargando…" }: LoadingPanelProps) {
  return (
    <div className="loading-panel" role="status" aria-live="polite">
      <span className="loading-panel__spinner" aria-hidden />
      <span className="loading-panel__label">{label}</span>
    </div>
  );
}
