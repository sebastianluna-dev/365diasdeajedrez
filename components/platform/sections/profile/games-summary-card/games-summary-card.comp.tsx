import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import "./games-summary-card.comp.css";

interface GamesSummaryCardProps {
  record: { wins: number; losses: number; draws: number; open: number };
}

/** «Partidas» (N5): how many, and how they went — won, lost, drawn, still open. */
export function GamesSummaryCard({ record }: GamesSummaryCardProps) {
  const total = record.wins + record.losses + record.draws + record.open;
  return (
    <section className="games-summary-card" aria-labelledby="games-summary-card-title">
      <header className="games-summary-card__head">
        <ChessBoardIcon className="games-summary-card__icon" />
        <h2 id="games-summary-card-title" className="games-summary-card__title">
          Partidas
        </h2>
      </header>
      <p className="games-summary-card__figure">{total}</p>
      <p className="games-summary-card__record">
        <span className="games-summary-card__wins">{record.wins} ganadas</span>
        <span className="games-summary-card__losses">{record.losses} perdidas</span>
        <span>{record.draws} tablas</span>
        {record.open > 0 && <span>{record.open} en curso</span>}
      </p>
    </section>
  );
}
