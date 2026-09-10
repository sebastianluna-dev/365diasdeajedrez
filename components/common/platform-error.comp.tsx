"use client";

import "./platform-error.comp.css";

interface PlatformErrorProps {
  /** `retry` del error boundary de Next 16: reintenta datos y render. */
  retry: () => void;
  message?: string;
  /** Identificador del error que Next registra en el servidor (ver instrumentation.ts). */
  digest?: string;
}

export function PlatformError({ retry, message = "Algo salió mal al cargar esta página.", digest }: PlatformErrorProps) {
  return (
    <div className="platform-error">
      <p className="platform-error__message">{message}</p>
      <button type="button" onClick={retry} className="platform-error__retry">
        Reintentar
      </button>
      {digest && <p className="platform-error__digest">Código del error: {digest}</p>}
    </div>
  );
}
