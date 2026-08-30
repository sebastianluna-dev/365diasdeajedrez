"use client";

import "./platform-error.comp.css";

interface PlatformErrorProps {
  /** `retry` del error boundary de Next 16: reintenta datos y render. */
  retry: () => void;
  message?: string;
}

export function PlatformError({ retry, message = "Algo salió mal al cargar esta página." }: PlatformErrorProps) {
  return (
    <div className="platform-error">
      <p className="platform-error__message">{message}</p>
      <button type="button" onClick={retry} className="platform-error__retry">
        Reintentar
      </button>
    </div>
  );
}
