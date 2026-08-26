import type { Metadata } from "next";
import { Header } from "@/components/sections/common/header/header.section";
import { ChessClockDesktop } from "@/components/sections/chess-clock/chess-clock-desktop.comp";
import { ChessClockMobile } from "@/components/sections/chess-clock/chess-clock-mobile.comp";
import "./reloj-page.css";

export const metadata: Metadata = {
  title: "Reloj de Ajedrez | 365 Días de Ajedrez",
  description: "Reloj de ajedrez gratuito en línea. Elige tu control de tiempo y juega con incremento.",
};

export default function RelojDeAjedrezPage() {
  return (
    <div className="reloj-page">
      <Header />
      <ChessClockDesktop />
      <ChessClockMobile />
    </div>
  );
}
