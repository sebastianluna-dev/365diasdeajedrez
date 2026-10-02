"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLingering } from "@/components/chess/game-viewer/use-lingering.hook";
import { GripIcon } from "@/components/icons/grip-icon.comp";
import { MoreIcon } from "@/components/icons/more-icon.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { useSortableRows } from "../use-sortable-rows.hook";
import { SortableDnd } from "../sortable-dnd.comp";
import "./syllabus-list.comp.css";

export interface SyllabusItem {
  id: string;
  name: string;
  /** The line at the end of the row: "17 lecciones", "Con PGN · 2 ejercicios · 8 min". */
  facts: string;
  href: string;
  /**
   * The introduction or the closing. Whoever has one takes a FIXED place — at
   * the front or at the end — and is not dragged: its place is not its order.
   */
  roleCode?: string;
  /** Beside the facts: "Prioridad". */
  badge?: string;
  /** Whether deleting is offered. The server decides it, not the interface. */
  canDelete: boolean;
  /** Why it cannot be deleted, said where the action would have been. */
  deleteHint?: string;
}

interface SyllabusListProps {
  items: SyllabusItem[];
  /** What one item is called, for the texts a screen reader reads: "capítulo". */
  noun: string;
  /** Saves the new order. Already bound to its course or chapter. */
  onReorder: (orderedIds: string[]) => Promise<void>;
  /** Creates one: it reads `name`, and `role` for the introduction and the closing. */
  createAction: (formData: FormData) => Promise<void>;
  /** Deletes one; it receives the id in `deleteFieldName`. */
  deleteAction?: (formData: FormData) => Promise<void>;
  deleteFieldName: string;
  /** What the field at the foot says while it is empty. */
  newPlaceholder: string;
}

/** "Capítulos", "Lecciones": the heading of the band, from the noun of one. */
function plural(noun: string): string {
  return noun === "lección" ? "Lecciones" : "Capítulos";
}

interface RowMenuProps {
  item: SyllabusItem;
  deleteAction: (formData: FormData) => Promise<void>;
  deleteFieldName: string;
}

/**
 * What else can be done to a row, behind its three dots. Only what destroys
 * lives here: «Editar» is the button of the row, and hiding the everyday
 * action behind a menu is what makes a list feel slow.
 *
 * The menu opens on every row, even where deleting is refused: there it says
 * why — a published course, a student's progress —, because a menu that is
 * not there does not explain itself, and what one comes looking for is
 * precisely the option that is missing.
 */
function RowMenu({ item, deleteAction, deleteFieldName }: RowMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Kept mounted while it leaves, so the closing animation has something to
  // run on (see `useLingering`).
  const lingering = useLingering(open ? true : null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // It closes like every other menu of the platform: clicking outside, or with Escape.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>(".syllabus-list__menu button")?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="syllabus-list__menu-anchor">
      <button
        ref={buttonRef}
        type="button"
        className="syllabus-list__more"
        aria-label={`Más opciones de «${item.name}»`}
        // A menu only when there is something to press in it; where deleting
        // is refused, what opens is a note with the reason.
        aria-haspopup={item.canDelete ? "menu" : undefined}
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <MoreIcon />
      </button>

      {lingering.value && (
        <div
          // The reason is announced as it appears: nothing in it takes the
          // focus, which stays on the button that opened it.
          role={item.canDelete ? "menu" : "status"}
          aria-label={item.canDelete ? `Opciones de «${item.name}»` : undefined}
          className={`syllabus-list__menu${lingering.closing ? " syllabus-list__menu_state_closing" : ""}`}
        >
          {item.canDelete ? (
            <form action={deleteAction}>
              <input type="hidden" name={deleteFieldName} value={item.id} />
              <SubmitButton
                role="menuitem"
                className="syllabus-list__menu-item"
                pendingLabel="Eliminando…"
                aria-label={`Eliminar «${item.name}»`}
              >
                Eliminar
              </SubmitButton>
            </form>
          ) : (
            <p className="syllabus-list__menu-note">{item.deleteHint ?? "No se puede eliminar."}</p>
          )}
        </div>
      )}
    </div>
  );
}

interface RowProps {
  item: SyllabusItem;
  deleteAction?: (formData: FormData) => Promise<void>;
  deleteFieldName: string;
}

/** The facts of a row, at its end: what it holds and the mark of the staff. */
function Facts({ item }: { item: SyllabusItem }) {
  return (
    <span className="syllabus-list__facts">
      {item.facts}
      {item.badge && <span className="syllabus-list__badge"> · {item.badge}</span>}
    </span>
  );
}

/** «Editar» is the row's button here, not a word at its end. */
function Edit({ item }: { item: SyllabusItem }) {
  return (
    <Link href={item.href} className="platform-button syllabus-list__edit" aria-label={`Editar «${item.name}»`}>
      Editar
    </Link>
  );
}

/** A row that can be moved: dnd-kit gives it its place, the grip picks it up. */
function Row({ item, number, noun, deleteAction, deleteFieldName }: RowProps & { number?: number; noun: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { name: item.name },
  });

  return (
    <li
      ref={setNodeRef}
      className={`syllabus-list__row${isDragging ? " syllabus-list__row_state_dragging" : ""}`}
      // The only inline style of the block: where the row IS while it travels.
      // It is geometry the library measures frame by frame, not styling.
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="syllabus-list__grip"
        aria-label={`Mover ${noun === "lección" ? "la" : "el"} ${noun} «${item.name}»`}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>
      <span className="syllabus-list__number" aria-hidden="true">
        {number}
      </span>
      <Link href={item.href} className="syllabus-list__name">
        {item.name}
      </Link>
      <Facts item={item} />
      <Edit item={item} />
      {deleteAction ? (
        <RowMenu item={item} deleteAction={deleteAction} deleteFieldName={deleteFieldName} />
      ) : (
        <span className="syllabus-list__more-space" aria-hidden="true" />
      )}
    </li>
  );
}

/**
 * A course's chapters and a chapter's lessons, drawn the same way: **the path
 * the student walks**, told in three bands — what opens the course, the
 * numbered steps, and what closes it — each under its own heading.
 *
 * The two lists are the same thing one level apart, so they are one component.
 * The steps are ONE framed block with hairlines between them and not a card
 * each, because a syllabus of forty chapters has to read as a single column;
 * the introduction and the closing sit outside it, tinted, because their place
 * is not their order and nothing is dropped onto them.
 *
 * Each row carries its number on a tile, its facts at the end and «Editar» as
 * a button; what destroys waits behind the three dots, and only where the
 * server would allow it. Dragging is dnd-kit ([`SortableDnd`](../sortable-dnd.comp.tsx)),
 * and the order itself — optimistic, saved in a transition — is
 * `useSortableRows`.
 */
export function SyllabusList({
  items,
  noun,
  onReorder,
  createAction,
  deleteAction,
  deleteFieldName,
  newPlaceholder,
}: SyllabusListProps) {
  const { rows, moveById, numbers } = useSortableRows({
    items,
    isFixed: (item) => item.roleCode !== undefined,
    onReorder,
  });

  const intro = rows.find((item) => item.roleCode === CONTENT_ROLE.INTRO);
  const closing = rows.find((item) => item.roleCode === CONTENT_ROLE.CLOSING);
  const sortable = rows.filter((item) => item.roleCode === undefined);

  /** The introduction or the closing: a tinted row, or the dashed slot that creates it. */
  const fixed = (kind: "intro" | "closing", item: SyllabusItem | undefined) =>
    item ? (
      <div className="syllabus-list__fixed">
        <span className={`syllabus-list__piece syllabus-list__piece_kind_${kind}`} aria-hidden="true" />
        <Link href={item.href} className="syllabus-list__name">
          {item.name}
        </Link>
        <Facts item={item} />
        <Edit item={item} />
        {/* The introduction and the closing are deleted like any other row:
            their place is fixed, not their existence. */}
        {deleteAction ? (
          <RowMenu item={item} deleteAction={deleteAction} deleteFieldName={deleteFieldName} />
        ) : (
          <span className="syllabus-list__more-space" aria-hidden="true" />
        )}
      </div>
    ) : (
      // Both are optional and there is at most one of each. The database's
      // unique index is what really guarantees it.
      <form action={createAction} className="syllabus-list__slot">
        <input type="hidden" name="role" value={kind === "intro" ? CONTENT_ROLE.INTRO : CONTENT_ROLE.CLOSING} />
        <input type="hidden" name="name" value={kind === "intro" ? "Introducción" : "Cierre"} />
        <SubmitButton className="syllabus-list__add" pendingLabel="Agregando…">
          <span className="syllabus-list__add-sign" aria-hidden="true">
            +
          </span>
          Agregar {kind === "intro" ? "introducción" : "cierre"}
          <span className="syllabus-list__add-note">Opcional</span>
        </SubmitButton>
      </form>
    );

  return (
    <SortableDnd items={sortable} noun={noun} onMove={moveById}>
      <div className="syllabus-list">
        <p className="syllabus-list__label">Inicio</p>
        {fixed("intro", intro)}

        <div className="syllabus-list__band">
          <p className="syllabus-list__label">{plural(noun)}</p>
          <p className="syllabus-list__hint">Arrastra para reordenar</p>
        </div>

        <ol className="syllabus-list__group">
          {sortable.map((item) => (
            <Row
              key={item.id}
              item={item}
              number={numbers.get(item.id)}
              noun={noun}
              deleteAction={deleteAction}
              deleteFieldName={deleteFieldName}
            />
          ))}

          <li className="syllabus-list__row syllabus-list__row_kind_new">
            <form action={createAction} className="syllabus-list__new">
              <span className="syllabus-list__number syllabus-list__number_kind_new" aria-hidden="true">
                +
              </span>
              <input
                type="text"
                name="name"
                maxLength={160}
                required
                className="syllabus-list__new-input"
                placeholder={newPlaceholder}
                aria-label={newPlaceholder.replace("…", "")}
                autoComplete="off"
              />
              {/* Out of sight while the field is empty (`:placeholder-shown`): Enter adds too. */}
              <SubmitButton className="syllabus-list__new-submit" pendingLabel="Agregando…">
                Agregar
              </SubmitButton>
            </form>
          </li>
        </ol>

        <p className="syllabus-list__label">Final</p>
        {fixed("closing", closing)}
      </div>
    </SortableDnd>
  );
}
