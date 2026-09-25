"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { reorderStudyGames } from "@/services/studies/studies.actions";
import type { GameView, StudyGameItem } from "@/services/studies/studies.types";
import { DeleteGame } from "./delete-game.comp";
import "./game-aside.comp.css";

/** Where the list stands when the study spans more than one page of games. */
export interface GameAsidePages {
  page: number;
  pageCount: number;
  previousHref?: string;
  nextHref?: string;
}

interface GameAsideProps {
  game: GameView;
  /** The other games of the study, to jump between them without going back. */
  siblings: StudyGameItem[];
  /** The study's name, heading the list: the study has no page of its own. */
  studyName: string;
  /** The study's total, which is not the page's length when there are pages. */
  gameCount: number;
  /**
   * "Editar datos" and "Borrar" of the study, for its owner. They arrive as a
   * node, like the modals, so the aside does not carry the kinds catalog.
   */
  studyTools?: ReactNode;
  /**
   * Whether the list can be dragged into a new order: the owner, with the
   * whole study in hand (one page). Reordering a page would leave the games
   * of the other pages with the old order mixed among the new one.
   */
  canReorder?: boolean;
  /** Present when the study spans more than one page of games. */
  pages?: GameAsidePages;
  /**
   * The new-game modal, mounted by whoever has its data. It arrives as a node
   * and not as props so as not to drag the results catalog and the class games
   * all the way here, which the aside uses for nothing else.
   */
  newGame?: ReactNode;
  /** "Datos de la partida" modal; absent when writing is not allowed. */
  editGame?: ReactNode;
  /** The sharing card of a collection, for its owner. */
  share?: ReactNode;
}

/** The second line of each game: who played it. */
function gameMeta(game: StudyGameItem): string {
  return `${game.white} — ${game.black}`;
}

/** Returns the list with the item at `from` placed at `to`. */
function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
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

export function GameAside({
  game,
  siblings,
  studyName,
  gameCount,
  studyTools,
  canReorder = false,
  pages,
  newGame,
  editGame,
  share,
}: GameAsideProps) {
  const cells = metaCells(game);

  // The order lives here while it is being dragged; the server gets the whole
  // list once the row is dropped. When the server revalidates, new games arrive
  // through props and the state is adjusted during render — not in an effect —
  // so as not to paint once with the old list before correcting it.
  const [items, setItems] = useState(siblings);
  const [baseline, setBaseline] = useState(siblings);
  if (siblings !== baseline) {
    setBaseline(siblings);
    setItems(siblings);
  }
  const [dragging, setDragging] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // The list is five rows tall and scrolls on its own, so the current game
  // is brought into its middle on arrival: deep in an eighty-game study it
  // would otherwise sit below the fold of the list. Only the list moves,
  // never the page, which is why this is arithmetic and not scrollIntoView.
  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>(".game-aside__item_state_active");
    if (!list || !active) return;
    list.scrollTop = active.offsetTop - (list.clientHeight - active.offsetHeight) / 2;
  }, [game.id]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = moved(items, from, to);
    setItems(next);
    startTransition(() => {
      void reorderStudyGames(
        game.studyId,
        next.map((item) => item.id),
      );
    });
  };

  return (
    <aside className="game-aside">
      <section className="game-aside__card game-aside__card_variant_list">
        {/* The study heads its list: it has no page of its own, so this is
            where it is named and, for its owner, edited or deleted. */}
        <div className="game-aside__study">
          <div className="game-aside__card-head">
            <h2 className="game-aside__study-name">{studyName}</h2>
            <span className="game-aside__count">{gameCount}</span>
          </div>
          {studyTools && <div className="game-aside__study-tools">{studyTools}</div>}
        </div>

        <ul className="game-aside__list" ref={listRef}>
          {items.map((sibling, index) => {
            const meta = gameMeta(sibling);

            return (
              <li
                key={sibling.id}
                className={`game-aside__row${dragging === index ? " game-aside__row_state_dragging" : ""}`}
                draggable={canReorder || undefined}
                onDragStart={(event) => {
                  if (!canReorder) return;
                  // The row is what moves, not the link's URL the browser would drag by default.
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", sibling.id);
                  setDragging(index);
                }}
                onDragEnd={() => setDragging(null)}
                onDragOver={(event) => {
                  if (!canReorder || dragging === null || dragging === index) return;
                  // Without this the browser does not consider the row a valid drop target.
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  if (!canReorder || dragging === null) return;
                  event.preventDefault();
                  move(dragging, index);
                  setDragging(null);
                }}
              >
                {/* The grip is a <button> and not a decoration because dragging
                    alone leaves out whoever navigates with the keyboard: with
                    the arrows the row moves just the same. */}
                {canReorder && (
                  <button
                    type="button"
                    className="game-aside__handle"
                    aria-label={`Mover «${sibling.title ?? sibling.label}». Usa las flechas arriba y abajo para cambiarla de sitio.`}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        move(index, index - 1);
                      } else if (event.key === "ArrowDown") {
                        event.preventDefault();
                        move(index, index + 1);
                      }
                    }}
                  >
                    <span aria-hidden="true">⠿</span>
                  </button>
                )}

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

        {pages && (
          <nav className="game-aside__pages" aria-label="Páginas de partidas">
            {pages.previousHref ? (
              <Link href={pages.previousHref} className="game-aside__page-link">
                ← Anteriores
              </Link>
            ) : (
              <span className="game-aside__page-link game-aside__page-link_state_disabled">← Anteriores</span>
            )}
            <span className="game-aside__page-status">
              Página {pages.page} de {pages.pageCount}
            </span>
            {pages.nextHref ? (
              <Link href={pages.nextHref} className="game-aside__page-link">
                Siguientes →
              </Link>
            ) : (
              <span className="game-aside__page-link game-aside__page-link_state_disabled">Siguientes →</span>
            )}
          </nav>
        )}

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

      {/* Who a collection reaches: a card of its own, for the owner only. */}
      {share}
    </aside>
  );
}
