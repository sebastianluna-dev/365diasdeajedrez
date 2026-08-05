import type { Metadata } from "next";
import { ClockHeader } from "@/components/sections/chess-clock/header/clock-header.comp";
import { ChessClock } from "@/components/sections/chess-clock/chess-clock.comp";
import "./reloj-page.css";

export const metadata: Metadata = {
  title: "Reloj de Ajedrez | 365 Días de Ajedrez",
  description: "Reloj de ajedrez gratuito en línea. Elige tu control de tiempo y juega con incremento.",
};

export default function RelojDeAjedrezPage() {
  return (
    <div className="reloj-page">
      <ClockHeader />
      <ChessClock />
    </div>
  );
}
