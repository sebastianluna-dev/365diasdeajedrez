"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripDotsVerticalIcon } from "@/components/icons/grip-dots-vertical-icon.comp";
import { TriangleExclamationIcon } from "@/components/icons/triangle-exclamation-icon.comp";
import { PlatformActionsMenu } from "@/components/platform/shared/platform-actions-menu/platform-actions-menu.comp";
import { SortableDnd } from "@/components/platform/shared/sortable-dnd/sortable-dnd.comp";
import { useSortableRows } from "@/components/platform/shared/sortable-dnd/use-sortable-rows.hook";
import { useSortableStep } from "@/components/platform/shared/sortable-dnd/use-sortable-step.hook";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import type { SeriesItemAvailability } from "@/services/shared/exercise-visibility-rules";
import type { SeriesItemData } from "@/services/teacher-exercises/teacher-exercises.types";
import "./series-items.comp.css";

export interface SeriesItemsProps {
  seriesId: string;
  /** The series' exercises, in its order. */
  items: SeriesItemData[];
  /** The server actions, as functions: the full order after a move, and «Quitar». */
  actions: {
    reorder: (seriesId: string, orderedIds: string[]) => Promise<void>;
    remove: (seriesId: string, exerciseId: string, formData: FormData) => Promise<void>;
  };
}

/** What an item its students no longer see says under its facts (PLAN.md §6.2). */
const WARNINGS: Record<Exclude<SeriesItemAvailability, "available">, string> = {
  archived: "Archivado: tus alumnos ya no lo ven.",
  unavailable: "Ya no está disponible: tus alumnos ya no lo ven.",
};

type Row = SeriesItemData & { id: string };

/**
 * The exercises of a series in the order its students solve them: a
 * sortable list (dragged by the grip, or one place at a time with «Subir»
 * and «Bajar» in the row's menu), each with its facts, the warning when the
 * students no longer see it, and «Quitar», which takes it out of the series
 * and leaves it in the bank. The order is applied at once and saved whole
 * (`useSortableRows`); a refused order comes back with the page.
 */
export function SeriesItems({ seriesId, items, actions }: SeriesItemsProps) {
  // One array per `items`, so the sortable state is only reset when the server sends a new list.
  const withIds = useMemo<Row[]>(() => items.map((item) => ({ ...item, id: item.exerciseId })), [items]);
  const { rows, moveById, numbers } = useSortableRows({
    items: withIds,
    isFixed: () => false,
    onReorder: (orderedIds) => actions.reorder(seriesId, orderedIds),
  });

  if (rows.length === 0) {
    return (
      <div className="series-items">
        <p className="series-items__empty">
          Todavía no tiene ejercicios: agrégalos con «Agregar ejercicios» y aparecerán aquí en orden.
        </p>
      </div>
    );
  }

  return (
    <div className="series-items">
      <SortableDnd items={rows.map((row) => ({ id: row.id, name: row.title }))} noun="ejercicio" onMove={moveById}>
        <ol className="series-items__list">
          {rows.map((row) => (
            <SeriesItemRow
              key={row.id}
              row={row}
              number={numbers.get(row.id) ?? 0}
              remove={actions.remove.bind(null, seriesId, row.exerciseId)}
            />
          ))}
        </ol>
      </SortableDnd>
    </div>
  );
}

interface SeriesItemRowProps {
  row: Row;
  number: number;
  remove: (formData: FormData) => Promise<void>;
}

/** One exercise of the series: the grip, its place, what it is, and its two ways out of its place. */
function SeriesItemRow({ row, number, remove }: SeriesItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    data: { name: row.title },
  });
  const steps = useSortableStep(row.id);
  const warning = row.availability === "available" ? null : WARNINGS[row.availability];

  return (
    <li
      ref={setNodeRef}
      className={`series-items__row${isDragging ? " series-items__row_state_dragging" : ""}`}
      // The only inline style of the block: where the row IS while it travels.
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        className="series-items__grip"
        aria-label={`Mover el ejercicio «${row.title}»`}
        {...attributes}
        {...listeners}
      >
        <GripDotsVerticalIcon variant="duotone-solid" />
      </button>
      <span className="series-items__number" aria-hidden="true">
        {number}
      </span>
      <div className="series-items__body">
        {row.href ? (
          <Link href={row.href} className="series-items__title">
            {row.title}
          </Link>
        ) : (
          <span className="series-items__title">{row.title}</span>
        )}
        <span className="series-items__facts">{row.facts}</span>
        {warning && (
          <span className="series-items__warning">
            <TriangleExclamationIcon variant="classic-solid" className="series-items__warning-icon" />
            {warning}
          </span>
        )}
      </div>
      <div className="series-items__actions">
        <form action={remove}>
          <SubmitButton
            className="platform-row-action"
            pendingLabel="Quitando…"
            aria-label={`Quitar «${row.title}» de la serie`}
          >
            Quitar
          </SubmitButton>
        </form>
        <PlatformActionsMenu
          label={`Opciones del ejercicio ${number}: ${row.title}`}
          items={[
            { label: "Subir", disabled: steps.up === null, reason: "Ya es el primero", onSelect: () => steps.up?.() },
            {
              label: "Bajar",
              disabled: steps.down === null,
              reason: "Ya es el último",
              onSelect: () => steps.down?.(),
            },
          ]}
        />
      </div>
    </li>
  );
}
