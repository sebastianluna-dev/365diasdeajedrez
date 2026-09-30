"use client";

import Link from "next/link";
import { GripIcon } from "@/components/icons/grip-icon.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { useSortableRows } from "../../use-sortable-rows.hook";
import type { SyllabusItem } from "../syllabus-list.comp";
import "./syllabus-list-c.comp.css";

interface SyllabusListCProps {
  items: SyllabusItem[];
  noun: string;
  onReorder: (orderedIds: string[]) => Promise<void>;
  createAction: (formData: FormData) => Promise<void>;
  deleteAction?: (formData: FormData) => Promise<void>;
  deleteFieldName: string;
  newPlaceholder: string;
}

/**
 * Design A — **the card with a handle**. Each item is a card of its own, with
 * the dotted grip at its left edge, the number next to the name and the row
 * actions at its end. Nothing joins one card to the next: the order is read
 * from the stack, not from a rail.
 */
export function SyllabusListC({
  items,
  noun,
  onReorder,
  createAction,
  deleteAction,
  deleteFieldName,
  newPlaceholder,
}: SyllabusListCProps) {
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
      <span className="syllabus-list-c__text">
        <Link href={item.href} className="syllabus-list-c__name">
          {item.name}
        </Link>
        <span className="syllabus-list-c__facts">
          {item.facts}
          {item.badge && <span className="syllabus-list-c__badge"> · {item.badge}</span>}
        </span>
      </span>

      <span className="syllabus-list-c__actions">
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

  /** The slot of the introduction or of the closing: the card, or the dashed box that creates it. */
  const fixed = (kind: "intro" | "closing", item: SyllabusItem | undefined) =>
    item ? (
      <li className="syllabus-list-c__card syllabus-list-c__card_kind_fixed">
        <span className={`syllabus-list-c__piece syllabus-list-c__piece_kind_${kind}`} aria-hidden="true" />
        {body(item)}
      </li>
    ) : (
      <li>
        <form action={createAction} className="syllabus-list-c__slot">
          <input type="hidden" name="role" value={kind === "intro" ? CONTENT_ROLE.INTRO : CONTENT_ROLE.CLOSING} />
          <input type="hidden" name="name" value={kind === "intro" ? "Introducción" : "Cierre"} />
          <SubmitButton className="syllabus-list-c__add" pendingLabel="Añadiendo…">
            + Añadir {kind === "intro" ? "introducción" : "cierre"}
          </SubmitButton>
        </form>
      </li>
    );

  return (
    <ol className="syllabus-list-c">
      {fixed("intro", intro)}

      {rows.map((item, index) =>
        item.roleCode !== undefined ? null : (
          <li
            key={item.id}
            className={`syllabus-list-c__card${dragging === index ? " syllabus-list-c__card_state_dragging" : ""}`}
            draggable
            onDragStart={() => setDragging(index)}
            onDragEnd={() => setDragging(null)}
            onDragOver={(event) => {
              if (dragging === null || dragging === index) return;
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
              className="syllabus-list-c__grip"
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
              <GripIcon />
            </button>
            <span className="syllabus-list-c__index" aria-hidden="true">
              {numbers.get(item.id)}
            </span>
            {body(item)}
          </li>
        ),
      )}

      <li>
        <form action={createAction} className="syllabus-list-c__new">
          <input
            type="text"
            name="name"
            maxLength={160}
            required
            className="syllabus-list-c__new-input"
            placeholder={newPlaceholder}
            aria-label={newPlaceholder.replace("…", "")}
            autoComplete="off"
          />
          <SubmitButton className="syllabus-list-c__new-submit" pendingLabel="Añadiendo…">
            Añadir
          </SubmitButton>
        </form>
      </li>

      {fixed("closing", closing)}
    </ol>
  );
}
