"use client";

import "./platform-error.comp.css";

interface PlatformErrorProps {
  /** Next 16's error boundary `retry`: retries data and render. */
  retry: () => void;
  message?: string;
  /** Identifier of the error Next logs on the server (see instrumentation.ts). */
  digest?: string;
}

export function PlatformError({
  retry,
  message = "Algo salió mal al cargar esta página.",
  digest,
}: PlatformErrorProps) {
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
