"use client";

import { useId, useState, type ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableStepContext, stepTarget } from "./use-sortable-step.hook";
import "./sortable-dnd.comp.css";

interface SortableDndProps {
  /** The items that can be moved, in the order they are drawn. The fixed ones are left out. */
  items: { id: string; name: string }[];
  /** What one item is called, for what the screen reader says: "capítulo", "lección", "partida". */
  noun: string;
  /** Applies the move. `overId` is the item whose place the dragged one takes. */
  onMove: (activeId: string, overId: string) => void;
  children: ReactNode;
}

/** "el capítulo", "la lección", "la partida". */
function article(noun: string): string {
  return noun.endsWith("ón") || noun.endsWith("a") ? "la" : "el";
}

/** The position an item is at inside the sortable list, 1-based. */
function positionOf(id: string | number | undefined, items: { id: string }[]): number {
  return items.findIndex((item) => item.id === String(id)) + 1;
}

/**
 * The drag and drop of a sortable list of the platform: **dnd-kit** set up
 * once for all of them — the chapters of a course, the lessons of a chapter,
 * the games of a chapter's collection or of a student's study. It is only the
 * wiring — sensors, the sortable context
 * and what is said out loud —; the rows are what is given to it, and each one
 * takes its own place with `useSortable`.
 *
 * The pointer has to travel 5px before a drag starts, so pressing a link or a
 * row action still works, and the keyboard moves an item without dragging at
 * all: space picks it up, the arrows move it, space drops it and escape puts
 * it back. Everything that happens is announced in Spanish, because dnd-kit's
 * own announcements are in English.
 *
 * A row also moves one place at a time with single clicks, the pointer's way
 * that needs no drag (WCAG 2.5.7): it asks `useSortableStep`, and the step
 * reaches the list through the same `onMove` a drop does. What dnd-kit does
 * not see it does not announce, so where the step left the row is said in a
 * status line of its own, the one thing this draws.
 */
export function SortableDnd({ items, noun, onMove, children }: SortableDndProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const instructions: ScreenReaderInstructions = {
    draggable: `Pulsa espacio para tomar ${article(noun)} ${noun}. Usa las flechas arriba y abajo para cambiarlo de sitio, espacio para soltarlo y escape para cancelar.`,
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Has tomado ${article(noun)} ${noun} «${active.data.current?.name}», en la posición ${positionOf(active.id, items)} de ${items.length}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `«${active.data.current?.name}» pasaría a la posición ${positionOf(over.id, items)} de ${items.length}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `«${active.data.current?.name}» queda en la posición ${positionOf(over.id, items)} de ${items.length}.`
        : `«${active.data.current?.name}» vuelve a su sitio.`,
    onDragCancel: ({ active }) => `Movimiento cancelado. «${active.data.current?.name}» vuelve a su sitio.`,
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onMove(String(active.id), String(over.id));
  };

  // What the last step said. Emptied when a drag starts, so that the same
  // landing said again after a drag is still a change, and is read.
  const [stepSaid, setStepSaid] = useState("");
  const ids = items.map((item) => item.id);
  // dnd-kit names its instructions (`aria-describedby="DndDescribedBy-N"`)
  // from a counter of its own, which the server and the browser do not count
  // alike: the handles hydrated with a different id. React's id is the same
  // on both sides.
  const contextId = useId();

  /** One place up or down: the row takes its neighbour's place, as if it had been dropped on it. */
  const step = (id: string, offset: -1 | 1) => {
    const target = stepTarget(ids, id, offset);
    const name = items.find((item) => item.id === id)?.name;
    if (target === null || name === undefined) return;
    onMove(id, target);
    setStepSaid(`«${name}» queda en la posición ${positionOf(target, items)} de ${items.length}.`);
  };

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      // A row only goes up or down, and never out of its list.
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{ announcements, screenReaderInstructions: instructions }}
      onDragStart={() => setStepSaid("")}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <SortableStepContext value={{ ids, step }}>{children}</SortableStepContext>
      </SortableContext>
      <div className="sortable-dnd" role="status">
        {stepSaid}
      </div>
    </DndContext>
  );
}
