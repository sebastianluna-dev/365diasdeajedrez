import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/sections/shell/site-header/site-header.section";
import { ChessClock } from "@/components/site/sections/chess-clock/chess-clock.comp";
import "./reloj-page.css";

export const metadata: Metadata = {
  title: "Reloj de Ajedrez | 365 Días de Ajedrez",
  description: "Reloj de ajedrez gratuito en línea. Elige tu control de tiempo y juega con incremento.",
  alternates: { canonical: "/reloj-de-ajedrez" },
};

export default function RelojDeAjedrezPage() {
  return (
    <div className="reloj-page">
      <SiteHeader />
      <main id="contenido">
        <ChessClock />
      </main>
    </div>
  );
}
