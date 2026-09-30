"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripIcon } from "@/components/icons/grip-icon.comp";
import { reorderChapterGames } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterGameSibling } from "@/services/staff-courses/staff-courses.types";
import { SortableDnd } from "../sortable-dnd.comp";
import { useSortableRows } from "../use-sortable-rows.hook";
import "./chapter-game-list.comp.css";

interface ChapterGameListProps {
  /** The chapter's games in their order, the current one included. */
  games: ChapterGameSibling[];
  currentId: string;
  courseId: string;
  chapterId: string;
}

interface RowProps {
  game: ChapterGameSibling;
  isCurrent: boolean;
}

/** A game of the collection: a link to its board, dragged by the grip. */
function Row({ game, isCurrent }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: game.id,
    data: { name: game.label },
  });

  return (
    <li
      ref={setNodeRef}
      className={`chapter-game-list__row${isDragging ? " chapter-game-list__row_state_dragging" : ""}`}
      // The only inline style of the block: where the row IS while it travels.
      // It is geometry the library measures frame by frame, not styling.
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="chapter-game-list__grip"
        aria-label={`Mover la partida «${game.label}»`}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>

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
}

/**
 * The chapter's games beside the board, to jump between them without going
 * back to the collection — and to put them in the order they are to be read
 * in, which until now could only be decided by importing them again.
 *
 * It is a Client Component for two things: the list is five rows tall and
 * scrolls on its own, so on arrival the current game is brought into its
 * middle — deep in a chapter of forty games it would otherwise sit below the
 * fold of the list, which is why this is arithmetic and not `scrollIntoView` —,
 * and the order is dragged. The order is applied on drop and saved in a
 * transition (`useSortableRows`), like every other list of the panel.
 */
export function ChapterGameList({ games, currentId, courseId, chapterId }: ChapterGameListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const { rows, moveById } = useSortableRows({
    items: games,
    // Every game of a collection is moved: none of them has a fixed place.
    isFixed: () => false,
    onReorder: reorderChapterGames.bind(null, courseId, chapterId),
  });

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>(".chapter-game-list__item_state_active");
    if (!list || !active) return;
    const row = active.parentElement ?? active;
    list.scrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;
  }, [currentId]);

  return (
    // What a game is CALLED is its label; the wiring only needs the name to say
    // out loud what has been taken and where it landed.
    <SortableDnd items={rows.map((game) => ({ id: game.id, name: game.label }))} noun="partida" onMove={moveById}>
      <ul className="chapter-game-list" ref={listRef}>
        {rows.map((game) => (
          <Row key={game.id} game={game} isCurrent={game.id === currentId} />
        ))}
      </ul>
    </SortableDnd>
  );
}
