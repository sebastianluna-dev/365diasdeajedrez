import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/(frontend)/globals.css";
import { chessGlyph, gramatika, sfProDisplay, suisseIntl } from "@/app/(frontend)/fonts";
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
// header/footer ni analytics con el sitio público.
//
// Sin checks de auth aquí (regla de Next 16: el layout no controla el render
// de sus segmentos). La identidad se resuelve en el DAL, y la regla para toda
// página de este grupo es: su PRIMER await tiene que ser un servicio de datos
// (que llama a getCurrentUser) o el propio getCurrentUser. Las páginas índice
// lo llaman en claro porque delegan los datos en sus secciones.
export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${gramatika.variable} ${suisseIntl.variable} ${chessGlyph.variable} ${sfProDisplay.variable}`}
    >
      <body className="platform-theme">
        <PlatformShell>{children}</PlatformShell>
      </body>
    </html>
  );
}
