"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { GameSettings, type GameSettingsActions } from "@/components/platform/shared/game-settings/game-settings.comp";
import { SortableDnd } from "@/components/platform/shared/sortable-dnd/sortable-dnd.comp";
import { useSortableRows } from "@/components/platform/shared/sortable-dnd/use-sortable-rows.hook";
import "./game-list.comp.css";

export interface GameListItem {
  id: string;
  /** What the game is called in the list: its title, or the fallback its mapper gives it. */
  name: string;
  /** The name it was given; absent while it is shown by the fallback. Its settings start from it. */
  title?: string;
  /** The PGN token of the result: "1-0", "½-½", "*". */
  resultLabel: string;
  href: string;
}

interface GameListProps {
  /** The games in their order, the current one included. */
  games: GameListItem[];
  currentId: string;
  /**
   * Saves a new order: a server action already bound to its study or its
   * chapter. Without it the rows only lead to their games — whoever is
   * reading may not reorder, or the list is one page of several, and
   * reordering a page would mix the new order with the old one of the rest.
   */
  onReorder?: (orderedIds: string[]) => Promise<void>;
  /**
   * What a game's settings do — rename it, clean it, delete it —, server
   * actions already bound to the study. With them each row ends in a gear
   * that opens `GameSettings`; without them, for whoever only reads, it does not.
   */
  settings?: GameSettingsActions;
}

/** A game of the list: what it is called and how it ended, leading to its board. */
function GameLink({ game, isCurrent }: { game: GameListItem; isCurrent: boolean }) {
  return (
    <Link href={game.href} aria-current={isCurrent ? "page" : undefined} className="game-list__item">
      {/* Only the name, on two lines at most: a longer one is cut, so the
          full one is shown on hover. */}
      <span className="game-list__name" title={game.name}>
        {game.name}
      </span>
      {/* "*" is the PGN's word for a game that has not ended: the list says nothing instead. */}
      {game.resultLabel !== "*" && <span className="game-list__result">{game.resultLabel}</span>}
    </Link>
  );
}

interface RowProps {
  game: GameListItem;
  isCurrent: boolean;
  settings?: GameSettingsActions;
}

/** The row's class: the current game's row is the card that says so, grip included. */
function rowClassName(isCurrent: boolean, isDragging = false): string {
  return [
    "game-list__row",
    isCurrent ? "game-list__row_state_active" : "",
    isDragging ? "game-list__row_state_dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** A game that can be moved: dnd-kit gives it its place and the grip, inside the row's card, picks it up. */
function SortableRow({ game, isCurrent, settings }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: game.id,
    data: { name: game.name },
  });

  return (
    <li
      ref={setNodeRef}
      className={rowClassName(isCurrent, isDragging)}
      // The only inline style of the block: where the row IS while it travels.
      // It is geometry the library measures frame by frame, not styling.
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="game-list__grip"
        aria-label={`Mover la partida «${game.name}»`}
        {...attributes}
        {...listeners}
      >
        <GripDotsVerticalIcon variant="duotone-solid" />
      </button>
      <GameLink game={game} isCurrent={isCurrent} />
      {settings && <GameSettings game={game} isCurrent={isCurrent} actions={settings} />}
    </li>
  );
}

interface SortableRowsProps {
  games: GameListItem[];
  currentId: string;
  onReorder: (orderedIds: string[]) => Promise<void>;
  settings?: GameSettingsActions;
  listRef: RefObject<HTMLUListElement | null>;
}

/** The list whoever may reorder sees: the order applied at once and saved in a transition. */
function SortableRows({ games, currentId, onReorder, settings, listRef }: SortableRowsProps) {
  const { rows, moveById } = useSortableRows({
    items: games,
    // Every game of a study or a collection is moved: none has a fixed place.
    isFixed: () => false,
    onReorder,
  });

  return (
    <SortableDnd items={rows.map((game) => ({ id: game.id, name: game.name }))} noun="partida" onMove={moveById}>
      <ul className="game-list" ref={listRef}>
        {rows.map((game) => (
          <SortableRow key={game.id} game={game} isCurrent={game.id === currentId} settings={settings} />
        ))}
      </ul>
    </SortableDnd>
  );
}

/**
 * The games beside the board — a student's study, a chapter's collection —
 * to jump between them without going back, and, for whoever may, to put them
 * in the order they are to be read in.
 *
 * The list is about eight rows tall and scrolls on its own, so on arrival the
 * current game is brought into its middle: deep in a study of eighty games it
 * would otherwise sit below the fold of the list. Only the list moves, never
 * the page, which is why this is arithmetic and not `scrollIntoView`.
 *
 * With `onReorder` each row is dragged by its grip or moved with the keyboard
 * through [`SortableDnd`](../sortable-dnd/sortable-dnd.comp.tsx); the order
 * is applied at once and saved in a transition (`useSortableRows`). There is
 * no «Subir»/«Bajar» here: the owner chose the list without them
 * (2026-10-03), so a pointer reorders only by dragging. It is a Client
 * Component for that order and for the scroll: the aside around it stays on
 * the server.
 */
export function GameList({ games, currentId, onReorder, settings }: GameListProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>(".game-list__row_state_active");
    if (!list || !row) return;
    list.scrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;
  }, [currentId]);

  if (onReorder) {
    return (
      <SortableRows games={games} currentId={currentId} onReorder={onReorder} settings={settings} listRef={listRef} />
    );
  }

  return (
    <ul className="game-list" ref={listRef}>
      {games.map((game) => (
        <li key={game.id} className={rowClassName(game.id === currentId)}>
          <GameLink game={game} isCurrent={game.id === currentId} />
          {settings && <GameSettings game={game} isCurrent={game.id === currentId} actions={settings} />}
        </li>
      ))}
    </ul>
  );
}
