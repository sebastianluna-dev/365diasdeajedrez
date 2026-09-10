"use client";

import Link from "next/link";
import { SiteMessage } from "@/components/sections/common/site-message/site-message.section";

// Error boundary del sitio público. Es un Client Component, así que no puede
// pintar la cabecera ni el pie (son de servidor): sólo el aviso, con la
// paleta del sitio y el `digest` que registra instrumentation.ts.
export default function SiteErrorBoundary({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main id="contenido">
      <SiteMessage
        eyebrow="Algo salió mal"
        title="No pudimos cargar esta página"
        description={
          error.digest
            ? `Inténtalo de nuevo en un momento. Código del error: ${error.digest}`
            : "Inténtalo de nuevo en un momento."
        }
      >
        <button type="button" onClick={retry} className="site-message__action">
          Reintentar
        </button>
        <Link href="/" className="site-message__action site-message__action_variant_secondary">
          Volver a la portada
        </Link>
      </SiteMessage>
    </main>
  );
}
