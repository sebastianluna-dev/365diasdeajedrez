"use client";

import { PlatformError } from "@/components/common/platform-error.comp";

export default function PlatformErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // El `digest` es lo único del error que llega al navegador en producción, y
  // es el mismo que registra `instrumentation.ts` en el servidor: enseñarlo es
  // lo que permite que un alumno diga «me salió el código X» y se encuentre.
  return <PlatformError retry={retry} digest={error.digest} />;
}
