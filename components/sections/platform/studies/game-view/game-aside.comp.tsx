import Link from "next/link";
import type { ReactNode } from "react";
import type { GameView, StudyGameItem } from "@/services/studies/studies.types";
import { DeleteGame } from "./delete-game.comp";
import "./game-aside.comp.css";

interface GameAsideProps {
  game: GameView;
  /** The other games of the study, to jump between them without going back. */
  siblings: StudyGameItem[];
  /**
   * The new-game modal, mounted by whoever has its data. It arrives as a node
   * and not as props so as not to drag the results catalog and the class games
   * all the way here, which the aside uses for nothing else.
   */
  newGame?: ReactNode;
  /** "Datos de la partida" modal; absent when writing is not allowed. */
  editGame?: ReactNode;
}

/** The second line of each game: who played it. */
function gameMeta(game: StudyGameItem): string {
  return `${game.white} — ${game.black}`;
}

/**
 * The four short facts, in a grid.
 *
 * All four are ALWAYS rendered, with a dash where there is no value: in a
 * two-by-two grid, hiding one cell displaces the other three, and an
 * incomplete record reads worse than one with declared gaps.
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
                    {/* The name the student gave it heads the row; without it,
                      `label` already falls back to the round, the event or its position
                      within the study. */}
                    <span className="game-aside__item-name">{sibling.title ?? sibling.label}</span>
                    {/* Long names are cut so as not to misalign the row, so the
                      full one is shown on hover. */}
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

      {/* The record reads top to bottom: where it was played, when and how it
          ended, and at the foot where the game came from. */}
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

        {/* Where it came from and, for the owner, deleting it: the moves are edited
            on the board itself, so nothing else is left here. */}
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
