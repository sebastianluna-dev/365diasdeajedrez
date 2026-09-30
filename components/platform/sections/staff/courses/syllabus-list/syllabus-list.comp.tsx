"use client";

import Link from "next/link";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { useSortableRows } from "../use-sortable-rows.hook";
import "./syllabus-list.comp.css";

export interface SyllabusItem {
  id: string;
  name: string;
  /** The line under the name: "17 lecciones · 340 min", "Con PGN · 2 ejercicios". */
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

/**
 * A course's chapters and a chapter's lessons, drawn the same way: **the path
 * the student walks**, top to bottom along a rail. The introduction opens it
 * and the closing ends it, each in its fixed place — a dashed slot while it
 * does not exist —; between them, the numbered items and the field that adds
 * another one.
 *
 * The two lists are the same thing one level apart, so they are one component:
 * before this, the chapters had the rail and the lessons a row with a drag
 * handle, and the panel of a chapter looked like another product.
 *
 * The numbered node is the handle: an item is dragged by it, and with the up
 * and down arrows it moves too, which is the only way to reorder with the
 * keyboard. The order itself — optimistic, saved in a transition — is
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
  const { rows, dragging, setDragging, move, numbers } = useSortableRows({
    items,
    isFixed: (item) => item.roleCode !== undefined,
    onReorder,
  });

  const intro = rows.find((item) => item.roleCode === CONTENT_ROLE.INTRO);
  const closing = rows.find((item) => item.roleCode === CONTENT_ROLE.CLOSING);

  /** Name, facts and what can be done: the same for the numbered ones and the fixed ones. */
  const body = (item: SyllabusItem) => (
    <>
      <span className="syllabus-list__text">
        <Link href={item.href} className="syllabus-list__name">
          {item.name}
        </Link>
        <span className="syllabus-list__facts">
          {item.facts}
          {item.badge && <span className="syllabus-list__badge"> · {item.badge}</span>}
        </span>
      </span>

      <span className="syllabus-list__actions">
        {/* Delete only where the server would allow it. */}
        {item.canDelete && deleteAction && (
          <form action={deleteAction}>
            <input type="hidden" name={deleteFieldName} value={item.id} />
            <SubmitButton
              className="platform-row-action platform-row-action_variant_danger"
              pendingLabel="Eliminando…"
              aria-label={`Eliminar «${item.name}»`}
            >
              Eliminar
            </SubmitButton>
          </form>
        )}
        <Link href={item.href} className="platform-row-action" aria-label={`Editar «${item.name}»`}>
          Editar
        </Link>
      </span>
    </>
  );

  /** The slot of the introduction or of the closing: the item, or the dashed box that creates it. */
  const fixed = (kind: "intro" | "closing", item: SyllabusItem | undefined) => (
    <li className="syllabus-list__step">
      <span className={`syllabus-list__node syllabus-list__node_kind_${kind}`} aria-hidden="true" />
      {item ? (
        body(item)
      ) : (
        // Both are optional and there is at most one of each. The database's
        // unique index is what really guarantees it.
        <form action={createAction} className="syllabus-list__slot">
          <input type="hidden" name="role" value={kind === "intro" ? CONTENT_ROLE.INTRO : CONTENT_ROLE.CLOSING} />
          <input type="hidden" name="name" value={kind === "intro" ? "Introducción" : "Cierre"} />
          <SubmitButton className="syllabus-list__add" pendingLabel="Añadiendo…">
            + Añadir {kind === "intro" ? "introducción" : "cierre"}
          </SubmitButton>
        </form>
      )}
    </li>
  );

  return (
    <ol className="syllabus-list">
      {fixed("intro", intro)}

      {rows.map((item, index) =>
        item.roleCode !== undefined ? null : (
          <li
            key={item.id}
            className={`syllabus-list__step${dragging === index ? " syllabus-list__step_state_dragging" : ""}`}
            draggable
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
            <button
              type="button"
              className="syllabus-list__node syllabus-list__node_kind_item"
              aria-label={`Mover ${noun === "lección" ? "la" : "el"} ${noun} «${item.name}». Usa las flechas arriba y abajo para cambiarlo de sitio.`}
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
              {numbers.get(item.id)}
            </button>
            {body(item)}
          </li>
        ),
      )}

      <li className="syllabus-list__step">
        <span className="syllabus-list__node syllabus-list__node_kind_new" aria-hidden="true">
          +
        </span>
        <form action={createAction} className="syllabus-list__new">
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
          <SubmitButton className="syllabus-list__new-submit" pendingLabel="Añadiendo…">
            Añadir
          </SubmitButton>
        </form>
      </li>

      {fixed("closing", closing)}
    </ol>
  );
}
