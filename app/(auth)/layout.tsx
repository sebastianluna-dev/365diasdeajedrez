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

// Puerta de entrada a la plataforma: sin el shell interno (no hay navegación
// que ofrecer a quien todavía no ha entrado) pero con sus tokens visuales.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="es"
      className={`${gramatika.variable} ${suisseIntl.variable} ${chessGlyph.variable} ${sfProDisplay.variable}`}
    >
      <body className="platform-theme">{children}</body>
    </html>
  );
}
