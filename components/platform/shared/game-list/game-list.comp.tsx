"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import {
  GameSettings,
  type GameSettingsActions,
  type GameSettingsGame,
} from "@/components/platform/shared/game-settings/game-settings.comp";
import { SortableDnd } from "@/components/platform/shared/sortable-dnd/sortable-dnd.comp";
import { useSortableRows } from "@/components/platform/shared/sortable-dnd/use-sortable-rows.hook";
import "./game-list.comp.css";

/**
 * A game of the list. What its settings start from — the name it was given
 * and its three settings — is `GameSettingsGame`'s; a list without `settings`
 * can leave them at their nothing.
 */
export interface GameListItem extends Omit<GameSettingsGame, "orientationCode"> {
  /** Which side the board opens from; White when it is not said. */
  orientationCode?: GameSettingsGame["orientationCode"];
  /** Who played it, "Fischer — Sherwin": a small line under the name. Left out when the name already is the pairing. */
  players?: string;
  /** The PGN token of the result: "1-0", "½-½", "*". */
  resultLabel: string;
  /** Its place in the whole study, 1 first: the index the material look numbers its rows with. */
  number?: number;
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
  /**
   * `material`: the new design system's (2026-10-23), for a page moved to it
   * — a study's side column on the canvas: rows as `PlatformSideNav` draws
   * its links, square at the left and round at the right, the current one in
   * the secondary container, each on one line with its number in the study
   * and the grip showing under the pointer. Without it, the platform's own look.
   */
  look?: "material";
  /**
   * What a row is called where it is read out — the grip and the reorder's
   * announcements: «partida» by default, «capítulo» in a study, whose games
   * are its chapters (2026-10-23).
   */
  noun?: "partida" | "capítulo";
}

/** The game as its settings take it: a side is always said there. */
function settingsGame(game: GameListItem): GameSettingsGame {
  return { ...game, orientationCode: game.orientationCode ?? "WHITE" };
}

/**
 * A game of the list: what it is called, who played it and how it ended,
 * leading to its board. In the material look it is one line (2026-10-23, the
 * owner's choice «B»): its number in the study, its name and its result,
 * without who played it.
 */
function GameLink({ game, isCurrent, look }: { game: GameListItem; isCurrent: boolean; look?: "material" }) {
  const oneLine = look === "material";
  return (
    <Link href={game.href} aria-current={isCurrent ? "page" : undefined} className="game-list__item">
      {oneLine && game.number !== undefined && <span className="game-list__number">{game.number}</span>}
      <span className="game-list__main">
        {/* The name, on two lines at most: a longer one is cut, so the full
            one is shown on hover. */}
        <span className="game-list__name" title={game.name}>
          {game.name}
        </span>
        {/* Under it and small, who played: not said twice when the game has no
            name of its own and is already called by its players. */}
        {!oneLine && game.players && game.players !== game.name && (
          <span className="game-list__players" title={game.players}>
            {game.players}
          </span>
        )}
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
  look?: "material";
  noun: "partida" | "capítulo";
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
function SortableRow({ game, isCurrent, settings, look, noun }: RowProps) {
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
        aria-label={`Mover ${noun === "capítulo" ? "el capítulo" : "la partida"} «${game.name}»`}
        {...attributes}
        {...listeners}
      >
        <GripDotsVerticalIcon variant="duotone-solid" />
      </button>
      <GameLink game={game} isCurrent={isCurrent} look={look} />
      {settings && <GameSettings game={settingsGame(game)} isCurrent={isCurrent} actions={settings} look={look} />}
    </li>
  );
}

interface SortableRowsProps {
  games: GameListItem[];
  currentId: string;
  onReorder: (orderedIds: string[]) => Promise<void>;
  settings?: GameSettingsActions;
  listRef: RefObject<HTMLUListElement | null>;
  className: string;
  look?: "material";
  noun: "partida" | "capítulo";
}

/** The list whoever may reorder sees: the order applied at once and saved in a transition. */
function SortableRows({ games, currentId, onReorder, settings, listRef, className, look, noun }: SortableRowsProps) {
  const { rows, moveById } = useSortableRows({
    items: games,
    // Every game of a study or a collection is moved: none has a fixed place.
    isFixed: () => false,
    onReorder,
  });

  return (
    <SortableDnd items={rows.map((game) => ({ id: game.id, name: game.name }))} noun={noun} onMove={moveById}>
      <ul className={className} ref={listRef}>
        {rows.map((game) => (
          <SortableRow
            key={game.id}
            game={game}
            isCurrent={game.id === currentId}
            settings={settings}
            look={look}
            noun={noun}
          />
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
 * The list is about eight rows tall and scrolls on its own, so a current game
 * that is out of sight is brought into its middle: deep in a study of eighty
 * games it would otherwise sit below the fold of the list. One that is already
 * in sight is left where it is — the list may stay on screen from game to
 * game (a study's is its layout's), and a row that jumped to the middle when
 * clicked would move under the pointer. Only the list moves, never the page,
 * which is why this is arithmetic and not `scrollIntoView`.
 *
 * With `onReorder` each row is dragged by its grip or moved with the keyboard
 * through [`SortableDnd`](../sortable-dnd/sortable-dnd.comp.tsx); the order
 * is applied at once and saved in a transition (`useSortableRows`). There is
 * no «Subir»/«Bajar» here: the owner chose the list without them
 * (2026-10-03), so a pointer reorders only by dragging. It is a Client
 * Component for that order and for the scroll: the aside around it stays on
 * the server.
 */
export function GameList({ games, currentId, onReorder, settings, look, noun = "partida" }: GameListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const className = `game-list${look === "material" ? " game-list_look_material" : ""}`;

  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>(".game-list__row_state_active");
    if (!list || !row) return;
    const inSight =
      row.offsetTop >= list.scrollTop && row.offsetTop + row.offsetHeight <= list.scrollTop + list.clientHeight;
    if (inSight) return;
    list.scrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;
  }, [currentId]);

  if (onReorder) {
    return (
      <SortableRows
        games={games}
        currentId={currentId}
        onReorder={onReorder}
        settings={settings}
        listRef={listRef}
        className={className}
        look={look}
        noun={noun}
      />
    );
  }

  return (
    <ul className={className} ref={listRef}>
      {games.map((game) => (
        <li key={game.id} className={rowClassName(game.id === currentId)}>
          <GameLink game={game} isCurrent={game.id === currentId} look={look} />
          {settings && (
            <GameSettings game={settingsGame(game)} isCurrent={game.id === currentId} actions={settings} look={look} />
          )}
        </li>
      ))}
    </ul>
  );
}
