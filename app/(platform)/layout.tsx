import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/(frontend)/globals.css";
import { chessGlyph, gramatika, suisseIntl } from "@/app/(frontend)/fonts";
import { sfProDisplay } from "@/app/(platform)/fonts";
import { PlatformShell } from "@/components/sections/platform/shell/platform-shell.section";
import "./platform.css";

export const metadata: Metadata = {
  title: {
    default: "Plataforma | 365 Días de Ajedrez",
    template: "%s | 365 Días de Ajedrez",
  },
  description: "Plataforma de estudio de la academia 365 Días de Ajedrez.",
  // The student's private area: out of the search engines.
  robots: { index: false, follow: false },
};

// Authenticated area: always rendered per request (never prerendered with
// build-time data). Valid as long as cacheComponents stays disabled.
export const dynamic = "force-dynamic";

// Root layout of the (platform) route group: the platform shares neither
// header/footer nor analytics with the public site.
//
// No auth checks here (Next 16 rule: the layout does not control the render
// of its segments). Identity is resolved in the DAL, and the rule for every
// page of this group is: its FIRST await has to be a data service (which
// calls getCurrentUser) or getCurrentUser itself. Index pages call it
// explicitly because they delegate the data to their sections.
export default function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${gramatika.variable} ${suisseIntl.variable} ${chessGlyph.variable} ${sfProDisplay.variable}`}
    >
      <body className="platform-theme">
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <PlatformShell>{children}</PlatformShell>
      </body>
    </html>
  );
}
