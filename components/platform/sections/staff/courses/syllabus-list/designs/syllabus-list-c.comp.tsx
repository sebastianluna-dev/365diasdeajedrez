"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripIcon } from "@/components/icons/grip-icon.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { CONTENT_ROLE } from "@/constants/platform/course-codes.const";
import { useSortableRows } from "../../use-sortable-rows.hook";
import type { SyllabusItem } from "../syllabus-list.comp";
import { SyllabusDnd } from "./syllabus-dnd.comp";
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

interface RowProps {
  item: SyllabusItem;
  deleteAction?: (formData: FormData) => Promise<void>;
  deleteFieldName: string;
}

/** Name, facts and what can be done: the same for the numbered ones and the fixed ones. */
function Body({ item, deleteAction, deleteFieldName }: RowProps) {
  return (
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
}

/** A card that can be moved: dnd-kit gives it its place, the grip picks it up. */
function Card({ item, number, noun, deleteAction, deleteFieldName }: RowProps & { number?: number; noun: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { name: item.name },
  });

  return (
    <li
      ref={setNodeRef}
      className={`syllabus-list-c__card${isDragging ? " syllabus-list-c__card_state_dragging" : ""}`}
      // The only inline style of the block: where the row IS while it travels.
      // It is geometry the library measures frame by frame, not styling.
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="syllabus-list-c__grip"
        aria-label={`Mover ${noun === "lección" ? "la" : "el"} ${noun} «${item.name}»`}
        {...attributes}
        {...listeners}
      >
        <GripIcon />
      </button>
      <span className="syllabus-list-c__index" aria-hidden="true">
        {number}
      </span>
      <Body item={item} deleteAction={deleteAction} deleteFieldName={deleteFieldName} />
    </li>
  );
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
  const { rows, moveById, numbers } = useSortableRows({
    items,
    isFixed: (item) => item.roleCode !== undefined,
    onReorder,
  });

  const intro = rows.find((item) => item.roleCode === CONTENT_ROLE.INTRO);
  const closing = rows.find((item) => item.roleCode === CONTENT_ROLE.CLOSING);
  const sortable = rows.filter((item) => item.roleCode === undefined);

  /** The slot of the introduction or of the closing: the card, or the dashed box that creates it. */
  const fixed = (kind: "intro" | "closing", item: SyllabusItem | undefined) =>
    item ? (
      <li className="syllabus-list-c__card syllabus-list-c__card_kind_fixed">
        <span className={`syllabus-list-c__piece syllabus-list-c__piece_kind_${kind}`} aria-hidden="true" />
        <Body item={item} deleteAction={deleteAction} deleteFieldName={deleteFieldName} />
      </li>
    ) : (
      <li>
        {/* Both are optional and there is at most one of each. The database's
            unique index is what really guarantees it. */}
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
    <SyllabusDnd items={sortable} noun={noun} onMove={moveById}>
      <ol className="syllabus-list-c">
        {fixed("intro", intro)}

        {sortable.map((item) => (
          <Card
            key={item.id}
            item={item}
            number={numbers.get(item.id)}
            noun={noun}
            deleteAction={deleteAction}
            deleteFieldName={deleteFieldName}
          />
        ))}

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
            {/* Out of sight while the field is empty (`:placeholder-shown`): Enter adds too. */}
            <SubmitButton className="syllabus-list-c__new-submit" pendingLabel="Añadiendo…">
              Añadir
            </SubmitButton>
          </form>
        </li>

        {fixed("closing", closing)}
      </ol>
    </SyllabusDnd>
  );
}
