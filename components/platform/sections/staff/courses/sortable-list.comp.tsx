"use client";

import Link from "next/link";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import "./sortable-list.comp.css";
import { useSortableRows } from "./use-sortable-rows.hook";

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

/**
 * Drag-sortable list, shared by a course's chapters and a chapter's lessons:
 * they are the same row with different content.
 *
 * The order itself — optimistic, saved in a transition — is
 * `useSortableRows`, which the course's syllabus shares.
 *
 * The handle is NOT only for the mouse: it is a `<button>` and with the up
 * and down arrows it moves the item, which is the only way to reorder with
 * the keyboard — dragging has none.
 */
export function SortableList({ items, onReorder, deleteAction, deleteFieldName, noun, emptyLabel }: SortableListProps) {
  const { rows, dragging, setDragging, move, numbers } = useSortableRows({
    items,
    isFixed: (row) => row.roleLabel !== undefined,
    onReorder,
  });

  if (rows.length === 0) {
    return <p className="sortable-list__empty">{emptyLabel}</p>;
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
                {numbers.get(row.id)}
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
