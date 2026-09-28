"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ChapterGameSibling } from "@/services/staff-courses/staff-courses.types";
import "./chapter-game-list.comp.css";

interface ChapterGameListProps {
  /** The chapter's games in their order, the current one included. */
  games: ChapterGameSibling[];
  currentId: string;
}

/**
 * The chapter's games beside the board, to jump between them without going
 * back to the collection.
 *
 * It is a Client Component for one thing only: the list is five rows tall and
 * scrolls on its own, so on arrival the current game is brought into its
 * middle. Deep in a chapter of forty games it would otherwise sit below the
 * fold of the list. Only the list moves, never the page, which is why this
 * is arithmetic and not `scrollIntoView`.
 */
export function ChapterGameList({ games, currentId }: ChapterGameListProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>(".chapter-game-list__item_state_active");
    if (!list || !active) return;
    list.scrollTop = active.offsetTop - (list.clientHeight - active.offsetHeight) / 2;
  }, [currentId]);

  return (
    <ul className="chapter-game-list" ref={listRef}>
      {games.map((game) => {
        const isCurrent = game.id === currentId;

        return (
          <li key={game.id}>
            <Link
              href={game.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`chapter-game-list__item${isCurrent ? " chapter-game-list__item_state_active" : ""}`}
            >
              <span className="chapter-game-list__main">
                {/* Long names are cut so as not to misalign the row, so the
                    full one is shown on hover. */}
                <span className="chapter-game-list__name" title={game.label}>
                  {game.label}
                </span>
                {game.players && (
                  <span className="chapter-game-list__players" title={game.players}>
                    {game.players}
                  </span>
                )}
              </span>
              <span className="chapter-game-list__result">{game.resultLabel}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
