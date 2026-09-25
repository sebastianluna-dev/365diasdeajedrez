"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { reorderStudyGames } from "@/services/studies/studies.actions";
import type { StudyGameItem } from "@/services/studies/studies.types";
import "./game-list.comp.css";

interface GameListProps {
  studyId: string;
  /** The study's games around the current one (one page), the current one included. */
  siblings: StudyGameItem[];
  currentId: string;
  /**
   * Whether the rows can be dragged into a new order: the owner, with the
   * whole study in hand (one page). Reordering a page would leave the games
   * of the other pages with the old order mixed among the new one.
   */
  canReorder: boolean;
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
 * The study's games, to jump between them without going back, and for the
 * owner to reorder by dragging a row or moving it with the keyboard.
 *
 * It is the only piece of the aside with state, which is why it is the only
 * one that is a Client Component: the aside around it stays on the server.
 */
export function GameList({ studyId, siblings, currentId, canReorder }: GameListProps) {
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
    const active = list?.querySelector<HTMLElement>(".game-list__item_state_active");
    if (!list || !active) return;
    list.scrollTop = active.offsetTop - (list.clientHeight - active.offsetHeight) / 2;
  }, [currentId]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = moved(items, from, to);
    setItems(next);
    startTransition(() => {
      void reorderStudyGames(
        studyId,
        next.map((item) => item.id),
      );
    });
  };

  return (
    <ul className="game-list" ref={listRef}>
      {items.map((sibling, index) => {
        const meta = gameMeta(sibling);
        const isCurrent = sibling.id === currentId;

        return (
          <li
            key={sibling.id}
            className={`game-list__row${dragging === index ? " game-list__row_state_dragging" : ""}`}
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
                className="game-list__handle"
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
              aria-current={isCurrent ? "page" : undefined}
              className={`game-list__item${isCurrent ? " game-list__item_state_active" : ""}`}
            >
              <span className="game-list__item-main">
                {/* The name the student gave it heads the row; without it,
                    `label` already falls back to the round, the event or its
                    position within the study. */}
                <span className="game-list__item-name">{sibling.title ?? sibling.label}</span>
                {/* Long names are cut so as not to misalign the row, so the
                    full one is shown on hover. */}
                <span className="game-list__item-meta" title={meta}>
                  {meta}
                </span>
              </span>
              <span className="game-list__item-result">{sibling.resultLabel}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
