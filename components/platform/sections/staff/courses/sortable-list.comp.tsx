"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import "./sortable-list.comp.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

export interface SortableItem {
  id: string;
  name: string;
  /** Line below: "12 lecciones", "Con PGN · 2 ejercicios". */
  meta: string;
  href: string;
  /** Badge next to the name, like "Prioritaria". */
  badge?: string;
  /**
   * "Introducción" or "Cierre". Whoever has it takes a FIXED place — at the
   * front or at the end — and so is not dragged: its position does not come from the order.
   */
  roleLabel?: string;
  /** Whether deleting is offered. The server decides it, not the interface. */
  canDelete: boolean;
}

interface SortableListProps {
  items: SortableItem[];
  /** Saves the new order. Server action already bound to its course or chapter. */
  onReorder: (orderedIds: string[]) => Promise<void>;
  /** Delete server action; receives the id in the `deleteFieldName` field. */
  deleteAction?: (formData: FormData) => Promise<void>;
  deleteFieldName?: string;
  /** What an item is called, for the accessibility texts: "capítulo". */
  noun: string;
  emptyLabel: string;
}

/** The list with the item at `from` placed at `to`. */
function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Drag-sortable list, shared by a course's chapters and a chapter's lessons:
 * they are the same row with different content.
 *
 * The order is applied on the client on drop and saved in a transition,
 * without waiting for a response: reordering is the operation where a
 * flicker shows most, and the list already knows how it will end up. If the
 * server rejects the change, its revalidation returns the good order and
 * the row goes back to its place.
 *
 * The handle is NOT only for the mouse: it is a `<button>` and with the up
 * and down arrows it moves the item, which is the only way to reorder with
 * the keyboard — dragging has none.
 */
export function SortableList({ items, onReorder, deleteAction, deleteFieldName, noun, emptyLabel }: SortableListProps) {
  const [rows, setRows] = useState(items);
  const [dragging, setDragging] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // When the server revalidates, new items arrive through props. The state is
  // adjusted during render — not in an effect — so as not to paint once with
  // the old list before correcting it.
  const [baseline, setBaseline] = useState(items);
  if (items !== baseline) {
    setBaseline(items);
    setRows(items);
  }

  /**
   * Reordering affects ONLY the normal content.
   *
   * The intro and the closing travel in the same list so they are seen where
   * they belong, but they are neither dragged nor part of the order that is
   * sent: the server would not accept them either, because it leaves them out of its query.
   */
  const isFixed = (index: number) => rows[index]?.roleLabel !== undefined;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    if (isFixed(from) || isFixed(to)) return;

    const next = moved(rows, from, to);
    setRows(next);
    startTransition(() => {
      void onReorder(next.filter((row) => row.roleLabel === undefined).map((row) => row.id));
    });
  };

  if (rows.length === 0) {
    return <p className="sortable-list__empty">{emptyLabel}</p>;
  }

  // The number rendered counts ONLY the normal content: with an intro in
  // front, the first real chapter is 1, not 2.
  const plainNumbers = new Map<string, number>();
  let plain = 0;
  for (const row of rows) {
    if (row.roleLabel === undefined) plainNumbers.set(row.id, ++plain);
  }

  return (
    <ul className="sortable-list">
      {rows.map((row, index) => (
        <li
          key={row.id}
          className={`sortable-list__row${dragging === index ? " sortable-list__row_state_dragging" : ""}${
            row.roleLabel ? " sortable-list__row_state_fixed" : ""
          }`}
          draggable={row.roleLabel === undefined}
          onDragStart={() => setDragging(index)}
          onDragEnd={() => setDragging(null)}
          onDragOver={(event) => {
            if (dragging === null || dragging === index) return;
            // Without this the browser does not consider the row a valid drop target.
            event.preventDefault();
          }}
          onDrop={(event) => {
            if (dragging === null) return;
            event.preventDefault();
            move(dragging, index);
            setDragging(null);
          }}
        >
          {row.roleLabel ? (
            /* No handle: its place is not chosen. The label takes that slot so the
               rows stay aligned. */
            <span className="sortable-list__fixed">{row.roleLabel}</span>
          ) : (
            <button
              type="button"
              className="sortable-list__handle"
              aria-label={`Mover ${noun} «${row.name}». Usa las flechas arriba y abajo para cambiarlo de sitio.`}
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
              <span className="sortable-list__order" aria-hidden="true">
                {plainNumbers.get(row.id)}
              </span>
              <span className="sortable-list__grip" aria-hidden="true">
                ⠿
              </span>
            </button>
          )}

          <span className="sortable-list__text">
            <span className="sortable-list__head">
              <Link href={row.href} className="sortable-list__link">
                {row.name}
              </Link>
              {row.badge && <span className="platform-tag platform-tag_variant_accent">{row.badge}</span>}
            </span>
            <span className="sortable-list__meta">{row.meta}</span>
          </span>

          <span className="sortable-list__controls">
            {deleteAction && deleteFieldName && row.canDelete && (
              <form action={deleteAction}>
                <input type="hidden" name={deleteFieldName} value={row.id} />
                <SubmitButton
                  className="sortable-list__control sortable-list__control_variant_danger"
                  pendingLabel="Eliminando…"
                >
                  Eliminar
                </SubmitButton>
              </form>
            )}

            <Link href={row.href} className="sortable-list__control sortable-list__control_variant_go">
              Editar
            </Link>
          </span>
        </li>
      ))}
    </ul>
  );
}
