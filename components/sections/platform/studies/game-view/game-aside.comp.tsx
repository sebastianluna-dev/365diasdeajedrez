import Link from "next/link";
import type { ReactNode } from "react";
import type { GameView, StudyGameItem } from "@/services/studies/studies.types";
import { DeleteGame } from "./delete-game.comp";
import "./game-aside.comp.css";

interface GameAsideProps {
  game: GameView;
  /** Las demás partidas del estudio, para saltar entre ellas sin volver. */
  siblings: StudyGameItem[];
  /**
   * El modal de nueva partida, montado por quien tiene sus datos. Llega como
   * nodo y no como props para no arrastrar hasta aquí el catálogo de resultados
   * y las partidas de clase, que el aside no usa para nada más.
   */
  newGame?: ReactNode;
  /** Modal de «Datos de la partida»; ausente si no se puede escribir. */
  editGame?: ReactNode;
}

/** Fila de la ficha: sólo se pinta la que tiene dato. */
function metaRows(game: GameView): { key: string; value: string }[] {
  const rows: { key: string; value: string | undefined }[] = [
    { key: "Evento", value: game.event },
    { key: "Lugar", value: game.site },
    { key: "Fecha", value: game.playedAtLabel },
    { key: "Ronda", value: game.round },
    { key: "ECO", value: game.eco },
    { key: "Resultado", value: game.resultLabel },
    { key: "Origen", value: game.sourceLabel },
  ];
  return rows.filter((row): row is { key: string; value: string } => Boolean(row.value));
}

export function GameAside({ game, siblings, newGame, editGame }: GameAsideProps) {
  const rows = metaRows(game);

  return (
    <aside className="game-aside">
      <section className="game-aside__card">
        <p className="game-aside__label">Partidas del estudio</p>

        <ul className="game-aside__list">
          {siblings.map((sibling) => (
            <li key={sibling.id}>
              <Link
                href={sibling.href}
                aria-current={sibling.id === game.id ? "page" : undefined}
                className={`game-aside__item${sibling.id === game.id ? " game-aside__item_state_active" : ""}`}
              >
                <span className="game-aside__item-name">{sibling.label}</span>
                <span className="game-aside__item-result">{sibling.resultLabel}</span>
              </Link>
            </li>
          ))}
        </ul>

        {newGame && <div className="game-aside__new">{newGame}</div>}
      </section>

      <section className="game-aside__card">
        <div className="game-aside__card-head">
          <p className="game-aside__label">Datos de la partida</p>
          {editGame}
        </div>

        <dl className="game-aside__meta">
          {rows.map((row) => (
            <div key={row.key} className="game-aside__meta-row">
              <dt className="game-aside__meta-key">{row.key}</dt>
              <dd className="game-aside__meta-value">{row.value}</dd>
            </div>
          ))}
        </dl>

        {/* Las jugadas se editan en el propio tablero, así que lo único que
            queda aquí es lo que no cabe en él: borrar la partida entera. */}
        {game.canEdit && (
          <div className="game-aside__danger">
            <DeleteGame
              studyId={game.studyId}
              gameId={game.id}
              name={game.title ?? `${game.white} – ${game.black}`}
              classBlockCount={game.classBlockCount}
              size="compact"
            />
          </div>
        )}
      </section>
    </aside>
  );
}
