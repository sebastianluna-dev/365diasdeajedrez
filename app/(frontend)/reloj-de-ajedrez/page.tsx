import type { Metadata } from "next";
import { Header } from "@/components/site/sections/shell/header/header.section";
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
      <Header />
      <main id="contenido">
        <ChessClock />
      </main>
    </div>
  );
}
