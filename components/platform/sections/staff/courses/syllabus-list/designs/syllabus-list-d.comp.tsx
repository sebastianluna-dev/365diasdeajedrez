"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLingering } from "@/components/chess/game-viewer/use-lingering.hook";
import { GripIcon } from "@/components/icons/grip-icon.comp";
import { MoreIcon } from "@/components/icons/more-icon.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { useSortableRows } from "../../use-sortable-rows.hook";
import type { SyllabusItem } from "../syllabus-list.comp";
import { SyllabusDnd } from "./syllabus-dnd.comp";
import "./syllabus-list-d.comp.css";

interface SyllabusListDProps {
  items: SyllabusItem[];
  noun: string;
  onReorder: (orderedIds: string[]) => Promise<void>;
  createAction: (formData: FormData) => Promise<void>;
  deleteAction?: (formData: FormData) => Promise<void>;
  deleteFieldName: string;
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
    rootRef.current?.querySelector<HTMLElement>(".syllabus-list-d__menu button")?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="syllabus-list-d__menu-anchor">
      <button
        ref={buttonRef}
        type="button"
        className="syllabus-list-d__more"
        aria-label={`Más opciones de «${item.name}»`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <MoreIcon />
      </button>

      {lingering.value && (
        <div
          role="menu"
          aria-label={`Opciones de «${item.name}»`}
          className={`syllabus-list-d__menu${lingering.closing ? " syllabus-list-d__menu_state_closing" : ""}`}
        >
          <form action={deleteAction}>
            <input type="hidden" name={deleteFieldName} value={item.id} />
            <SubmitButton
              className="syllabus-list-d__menu-item"
              pendingLabel="Eliminando…"
              aria-label={`Eliminar «${item.name}»`}
            >
              Eliminar
            </SubmitButton>
          </form>
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
    <span className="syllabus-list-d__facts">
      {item.facts}
      {item.badge && <span className="syllabus-list-d__badge"> · {item.badge}</span>}
    </span>
  );
}

/** «Editar» is the row's button here, not a word at its end. */
function Edit({ item }: { item: SyllabusItem }) {
  return (
    <Link
      href={item.href}
      className="platform-button syllabus-list-d__edit"
      aria-label={`Editar «${item.name}»`}
    >
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
      className={`syllabus-list-d__row${isDragging ? " syllabus-list-d__row_state_dragging" : ""}`}
      // The only inline style of the block: where the row IS while it travels.
      // It is geometry the library measures frame by frame, not styling.
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="syllabus-list-d__grip"
        aria-label={`Mover ${noun === "lección" ? "la" : "el"} ${noun} «${item.name}»`}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>
      <span className="syllabus-list-d__number" aria-hidden="true">
        {number}
      </span>
      <Link href={item.href} className="syllabus-list-d__name">
        {item.name}
      </Link>
      <Facts item={item} />
      <Edit item={item} />
      {/* Delete only where the server would allow it; with nothing to offer
          there is no menu to open. */}
      {item.canDelete && deleteAction ? (
        <RowMenu item={item} deleteAction={deleteAction} deleteFieldName={deleteFieldName} />
      ) : (
        <span className="syllabus-list-d__more-space" aria-hidden="true" />
      )}
    </li>
  );
}

/**
 * Design D — **the list in bands**. The path is told in three: what opens the
 * course, the chapters, and what closes it, each under its own heading. The
 * numbered steps are one framed block with hairlines between them instead of
 * loose cards, so a long syllabus reads as a single column; the introduction
 * and the closing sit outside it, tinted, because their place is not their
 * order. «Editar» is a button at the end of each row and what destroys waits
 * behind the three dots.
 */
export function SyllabusListD({
  items,
  noun,
  onReorder,
  createAction,
  deleteAction,
  deleteFieldName,
  newPlaceholder,
}: SyllabusListDProps) {
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
      <div className="syllabus-list-d__fixed">
        <span className={`syllabus-list-d__piece syllabus-list-d__piece_kind_${kind}`} aria-hidden="true" />
        <Link href={item.href} className="syllabus-list-d__name">
          {item.name}
        </Link>
        <Facts item={item} />
        <Edit item={item} />
      </div>
    ) : (
      // Both are optional and there is at most one of each. The database's
      // unique index is what really guarantees it.
      <form action={createAction} className="syllabus-list-d__slot">
        <input type="hidden" name="role" value={kind === "intro" ? CONTENT_ROLE.INTRO : CONTENT_ROLE.CLOSING} />
        <input type="hidden" name="name" value={kind === "intro" ? "Introducción" : "Cierre"} />
        <SubmitButton className="syllabus-list-d__add" pendingLabel="Añadiendo…">
          <span className="syllabus-list-d__add-sign" aria-hidden="true">
            +
          </span>
          Añadir {kind === "intro" ? "introducción" : "cierre"}
          <span className="syllabus-list-d__add-note">Opcional</span>
        </SubmitButton>
      </form>
    );

  return (
    <SyllabusDnd items={sortable} noun={noun} onMove={moveById}>
      <div className="syllabus-list-d">
        <p className="syllabus-list-d__label">Inicio</p>
        {fixed("intro", intro)}

        <div className="syllabus-list-d__band">
          <p className="syllabus-list-d__label">{plural(noun)}</p>
          <p className="syllabus-list-d__hint">Arrastra para reordenar</p>
        </div>

        <ol className="syllabus-list-d__group">
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

          <li className="syllabus-list-d__row syllabus-list-d__row_kind_new">
            <form action={createAction} className="syllabus-list-d__new">
              <span className="syllabus-list-d__number syllabus-list-d__number_kind_new" aria-hidden="true">
                +
              </span>
              <input
                type="text"
                name="name"
                maxLength={160}
                required
                className="syllabus-list-d__new-input"
                placeholder={newPlaceholder}
                aria-label={newPlaceholder.replace("…", "")}
                autoComplete="off"
              />
              {/* Out of sight while the field is empty (`:placeholder-shown`): Enter adds too. */}
              <SubmitButton className="syllabus-list-d__new-submit" pendingLabel="Añadiendo…">
                Añadir
              </SubmitButton>
            </form>
          </li>
        </ol>

        <p className="syllabus-list-d__label">Final</p>
        {fixed("closing", closing)}
      </div>
    </SyllabusDnd>
  );
}
