"use client";

import type { ReactNode } from "react";
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
 * The drag and drop of a sortable list of the panel: **dnd-kit** set up once
 * for all of them — the chapters of a course, the lessons of a chapter, the
 * games of a collection. It is only the wiring — sensors, the sortable context
 * and what is said out loud —; the rows are what is given to it, and each one
 * takes its own place with `useSortable`.
 *
 * The pointer has to travel 5px before a drag starts, so pressing a link or a
 * row action still works, and the keyboard moves an item without dragging at
 * all: space picks it up, the arrows move it, space drops it and escape puts
 * it back. Everything that happens is announced in Spanish, because dnd-kit's
 * own announcements are in English.
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      // A chapter only goes up or down, and never out of its list.
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      accessibility={{ announcements, screenReaderInstructions: instructions }}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
