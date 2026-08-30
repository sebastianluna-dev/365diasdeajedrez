import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/(frontend)/globals.css";
import { chessGlyph, gramatika, suisseIntl } from "@/app/(frontend)/fonts";
import { PlatformShell } from "@/components/sections/platform/shell/platform-shell.section";
import "./platform.css";

export const metadata: Metadata = {
  title: {
    default: "Plataforma | 365 Días de Ajedrez",
    template: "%s | 365 Días de Ajedrez",
  },
  description: "Plataforma de estudio de la academia 365 Días de Ajedrez.",
  // Zona privada del alumno: fuera de los buscadores.
  robots: { index: false, follow: false },
};

// Zona autenticada: siempre render por request (nunca prerender con los datos
// del build). Válido mientras cacheComponents siga deshabilitado.
export const dynamic = "force-dynamic";

// Root layout propio del route group (platform): la plataforma no comparte
// header/footer ni analytics con el sitio público. Sin checks de auth aquí
// (regla de Next 16): la identidad se resuelve en el DAL por página/servicio.
export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${gramatika.variable} ${suisseIntl.variable} ${chessGlyph.variable}`}>
      <body>
        <PlatformShell>{children}</PlatformShell>
      </body>
    </html>
  );
}
