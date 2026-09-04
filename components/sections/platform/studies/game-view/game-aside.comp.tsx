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

/** La segunda línea de cada partida: quiénes la jugaron. */
function gameMeta(game: StudyGameItem): string {
  return `${game.white} — ${game.black}`;
}

/**
 * Los cuatro datos cortos, en rejilla.
 *
 * Se pintan SIEMPRE los cuatro, con una raya donde no hay dato: en una rejilla
 * de dos por dos, esconder una celda descoloca a las otras tres, y una ficha
 * incompleta se lee peor que una con huecos declarados.
 */
function metaCells(game: GameView): { key: string; value: string }[] {
  return [
    { key: "Fecha", value: game.playedAtLabel ?? "—" },
    { key: "Ronda", value: game.round ?? "—" },
    { key: "ECO", value: game.eco ?? "—" },
    { key: "Resultado", value: game.resultLabel },
  ];
}

export function GameAside({ game, siblings, newGame, editGame }: GameAsideProps) {
  const cells = metaCells(game);

  return (
    <aside className="game-aside">
      <section className="game-aside__card game-aside__card_variant_list">
        <div className="game-aside__card-head">
          <p className="game-aside__label">Partidas del estudio</p>
          <span className="game-aside__count">{siblings.length}</span>
        </div>

        <ul className="game-aside__list">
          {siblings.map((sibling) => {
            const meta = gameMeta(sibling);

            return (
              <li key={sibling.id}>
                <Link
                  href={sibling.href}
                  aria-current={sibling.id === game.id ? "page" : undefined}
                  className={`game-aside__item${sibling.id === game.id ? " game-aside__item_state_active" : ""}`}
                >
                  <span className="game-aside__item-main">
                    {/* El nombre que le puso el alumno encabeza la fila; sin él,
                      `label` ya cae a la ronda, al evento o a su posición dentro
                      del estudio. */}
                    <span className="game-aside__item-name">{sibling.title ?? sibling.label}</span>
                    {/* Los nombres largos se cortan para no descuadrar la fila,
                      así que el completo se enseña al pasar por encima. */}
                    <span className="game-aside__item-meta" title={meta}>
                      {meta}
                    </span>
                  </span>
                  <span className="game-aside__item-result">{sibling.resultLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {newGame && <div className="game-aside__new">{newGame}</div>}
      </section>

      {/* La ficha se lee de arriba abajo: dónde se jugó, cuándo y cómo acabó, y
          al pie de dónde salió la partida. */}
      <section className="game-aside__card game-aside__card_variant_meta">
        <div className="game-aside__meta-head">
          <div className="game-aside__card-head">
            <p className="game-aside__label">Datos de la partida</p>
            {editGame}
          </div>

          {game.event && <p className="game-aside__event">{game.event}</p>}
          {game.site && <p className="game-aside__site">{game.site}</p>}
        </div>

        <dl className="game-aside__meta">
          {cells.map((cell) => (
            <div key={cell.key} className="game-aside__meta-cell">
              <dt className="game-aside__meta-key">{cell.key}</dt>
              <dd className="game-aside__meta-value">{cell.value}</dd>
            </div>
          ))}
        </dl>

        {/* De dónde salió y, para el dueño, borrarla: las jugadas se editan en
            el propio tablero, así que aquí ya no queda nada más. */}
        <div className="game-aside__meta-foot">
          <span className="game-aside__source">{game.sourceLabel}</span>
          {game.canEdit && (
            <DeleteGame
              studyId={game.studyId}
              gameId={game.id}
              name={game.title ?? `${game.white} – ${game.black}`}
              classBlockCount={game.classBlockCount}
              size="inline"
              label="Borrar"
            />
          )}
        </div>
      </section>
    </aside>
  );
}
