"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { SortableDnd } from "@/components/platform/shared/sortable-dnd/sortable-dnd.comp";
import { useSortableRows } from "@/components/platform/shared/sortable-dnd/use-sortable-rows.hook";
import { useSortableStep } from "@/components/platform/shared/sortable-dnd/use-sortable-step.hook";
import "./game-list.comp.css";

export interface GameListItem {
  id: string;
  /** What the game is called in the list: its title, or the fallback its mapper gives it. */
  name: string;
  /** The second line, who played it: "Fischer — Sherwin". Absent when the name already says it. */
  players?: string;
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
}

/** A game of the list: what it is called, who played it and how it ended, leading to its board. */
function GameLink({ game, isCurrent }: { game: GameListItem; isCurrent: boolean }) {
  return (
    <Link
      href={game.href}
      aria-current={isCurrent ? "page" : undefined}
      className={`game-list__item${isCurrent ? " game-list__item_state_active" : ""}`}
    >
      <span className="game-list__main">
        {/* Long names are cut so as not to misalign the row, so the full one
            is shown on hover. */}
        <span className="game-list__name" title={game.name}>
          {game.name}
        </span>
        {game.players && (
          <span className="game-list__players" title={game.players}>
            {game.players}
          </span>
        )}
      </span>
      <span className="game-list__result">{game.resultLabel}</span>
    </Link>
  );
}

interface StepProps {
  direction: "up" | "down";
  name: string;
  /** The step `useSortableStep` gives the row; `null` at that end of the list. */
  move: (() => void) | null;
}

/**
 * «Subir» or «Bajar», drawn as an arrow: the row moves one place with a single
 * click, for whoever cannot hold a drag (WCAG 2.5.7).
 *
 * Out of the Tab order: the keyboard already moves the row from its grip
 * (space, the arrows, space), and two more stops per game would double the
 * way through a list one comes to in order to jump between games. A screen
 * reader still finds them, and a voice command by their name.
 */
function Step({ direction, name, move }: StepProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (!move) return;
    const hadFocus = document.activeElement === ref.current;
    move();
    // React puts the row in its new place by moving a node, and a node that
    // is moved drops the focus it held: it is given back once React is done.
    if (hadFocus) requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      className={`game-list__step game-list__step_direction_${direction}`}
      aria-label={`${direction === "up" ? "Subir" : "Bajar"} «${name}»`}
      // `aria-disabled` and not `disabled`: the first row's «Subir» keeps the
      // focus it got from the step that brought the row there.
      aria-disabled={move ? undefined : true}
      onClick={handleClick}
    >
      <ArrowUpIcon className="game-list__step-icon" />
    </button>
  );
}

/** A game that can be moved: dnd-kit gives it its place, the grip picks it up, the arrows step it. */
function SortableRow({ game, isCurrent }: { game: GameListItem; isCurrent: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: game.id,
    data: { name: game.name },
  });
  const steps = useSortableStep(game.id);

  return (
    <li
      ref={setNodeRef}
      className={`game-list__row${isDragging ? " game-list__row_state_dragging" : ""}`}
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
      <div className="game-list__steps">
        <Step direction="up" name={game.name} move={steps.up} />
        <Step direction="down" name={game.name} move={steps.down} />
      </div>
    </li>
  );
}

interface SortableRowsProps {
  games: GameListItem[];
  currentId: string;
  onReorder: (orderedIds: string[]) => Promise<void>;
  listRef: RefObject<HTMLUListElement | null>;
}

/** The list whoever may reorder sees: the order applied at once and saved in a transition. */
function SortableRows({ games, currentId, onReorder, listRef }: SortableRowsProps) {
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
          <SortableRow key={game.id} game={game} isCurrent={game.id === currentId} />
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
 * The list is five rows tall and scrolls on its own, so on arrival the
 * current game is brought into its middle: deep in a study of eighty games it
 * would otherwise sit below the fold of the list. Only the list moves, never
 * the page, which is why this is arithmetic and not `scrollIntoView`.
 *
 * With `onReorder` each row is dragged by its grip or moved with the keyboard
 * through [`SortableDnd`](../sortable-dnd/sortable-dnd.comp.tsx), and «Subir»
 * and «Bajar» move it one place without dragging; the order is applied at
 * once and saved in a transition (`useSortableRows`). It is a Client
 * Component for that order and for the scroll: the aside around it stays on
 * the server.
 */
export function GameList({ games, currentId, onReorder }: GameListProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>(".game-list__item_state_active")?.closest("li");
    if (!list || !row) return;
    list.scrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;
  }, [currentId]);

  if (onReorder) {
    return <SortableRows games={games} currentId={currentId} onReorder={onReorder} listRef={listRef} />;
  }

  return (
    <ul className="game-list" ref={listRef}>
      {games.map((game) => (
        <li key={game.id} className="game-list__row">
          <GameLink game={game} isCurrent={game.id === currentId} />
        </li>
      ))}
    </ul>
  );
}
