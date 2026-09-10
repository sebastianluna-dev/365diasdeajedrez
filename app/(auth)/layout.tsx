import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/(frontend)/globals.css";
import { chessGlyph, gramatika, suisseIntl } from "@/app/(frontend)/fonts";
import { sfProDisplay } from "@/app/(platform)/fonts";
import "@/app/(platform)/platform.css";

export const metadata: Metadata = {
  title: "Acceder | 365 Días de Ajedrez",
  description: "Accede a la plataforma de la academia 365 Días de Ajedrez.",
  robots: { index: false, follow: false },
};

// Entry door to the platform: without the internal shell (there is no
// navigation to offer someone who has not logged in yet) but with its visual tokens.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${gramatika.variable} ${suisseIntl.variable} ${chessGlyph.variable} ${sfProDisplay.variable}`}
    >
      <body className="platform-theme">
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
