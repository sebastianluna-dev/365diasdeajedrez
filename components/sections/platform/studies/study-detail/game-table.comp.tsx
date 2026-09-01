import Link from "next/link";
import type { StudyGameItem } from "@/services/studies/studies.types";
import "./game-table.comp.css";

interface GameTableProps {
  games: StudyGameItem[];
}

export function GameTable({ games }: GameTableProps) {
  return (
    <div className="game-table">
      <table className="game-table__table">
        <thead>
          <tr>
            <th className="game-table__header">Partida</th>
            <th className="game-table__header">Blancas</th>
            <th className="game-table__header">Negras</th>
            <th className="game-table__header">Resultado</th>
            <th className="game-table__header">ECO</th>
            <th className="game-table__header">Evento</th>
            <th className="game-table__header">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id} className="game-table__row">
              {/* El enlace va en el diferenciador cuando lo hay; si no, en la
                  pareja de jugadores, que es como se identifica una partida. */}
              <td className="game-table__cell game-table__cell_strong">
                {game.title ? (
                  <Link href={game.href} className="game-table__link">
                    {game.title}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="game-table__cell game-table__cell_strong">
                {game.title ? (
                  game.white
                ) : (
                  <Link href={game.href} className="game-table__link">
                    {game.white}
                  </Link>
                )}
              </td>
              <td className="game-table__cell game-table__cell_strong">{game.black}</td>
              <td className="game-table__cell">{game.resultLabel}</td>
              <td className="game-table__cell">{game.eco ?? "—"}</td>
              <td className="game-table__cell">{game.event ?? "—"}</td>
              <td className="game-table__cell">{game.playedAtLabel ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
