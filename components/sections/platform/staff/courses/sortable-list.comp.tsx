"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import "./sortable-list.comp.css";

export interface SortableItem {
  id: string;
  name: string;
  /** Línea de debajo: «12 lecciones», «Con PGN · 2 ejercicios». */
  meta: string;
  href: string;
  /** Distintivo junto al nombre, como «Prioritaria». */
  badge?: string;
  /** Si se ofrece borrarlo. Lo decide el servidor, no la interfaz. */
  canDelete: boolean;
}

interface SortableListProps {
  items: SortableItem[];
  /** Guarda el orden nuevo. Server action ya atada a su curso o capítulo. */
  onReorder: (orderedIds: string[]) => Promise<void>;
  /** Server action de borrado; recibe el id en el campo `deleteFieldName`. */
  deleteAction?: (formData: FormData) => Promise<void>;
  deleteFieldName?: string;
  /** Cómo se llama un elemento, para los textos de accesibilidad: «capítulo». */
  noun: string;
  emptyLabel: string;
}

/** La lista con el elemento de `from` colocado en `to`. */
function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Lista ordenable por arrastre, compartida por los capítulos de un curso y las
 * lecciones de un capítulo: son la misma fila con distinto contenido.
 *
 * El orden se aplica en el cliente al soltar y se guarda en una transición, sin
 * esperar respuesta: reordenar es la operación en la que más se nota un
 * parpadeo, y la lista ya sabe cómo va a quedar. Si el servidor rechaza el
 * cambio, su revalidación devuelve el orden bueno y la fila vuelve a su sitio.
 *
 * El asa NO es sólo para el ratón: es un `<button>` y con las flechas arriba y
 * abajo mueve el elemento, que es la única forma de reordenar con el teclado
 * —arrastrar no la tiene—.
 */
export function SortableList({
  items,
  onReorder,
  deleteAction,
  deleteFieldName,
  noun,
  emptyLabel,
}: SortableListProps) {
  const [rows, setRows] = useState(items);
  const [dragging, setDragging] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Cuando el servidor revalida llegan elementos nuevos por props. Se ajusta el
  // estado durante el render —no en un efecto— para no pintar una vez con la
  // lista vieja antes de corregirla.
  const [baseline, setBaseline] = useState(items);
  if (items !== baseline) {
    setBaseline(items);
    setRows(items);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = moved(rows, from, to);
    setRows(next);
    startTransition(() => {
      void onReorder(next.map((row) => row.id));
    });
  };

  if (rows.length === 0) {
    return <p className="sortable-list__empty">{emptyLabel}</p>;
  }

  return (
    <ul className="sortable-list">
      {rows.map((row, index) => (
        <li
          key={row.id}
          className={`sortable-list__row${dragging === index ? " sortable-list__row_state_dragging" : ""}`}
          draggable
          onDragStart={() => setDragging(index)}
          onDragEnd={() => setDragging(null)}
          onDragOver={(event) => {
            if (dragging === null || dragging === index) return;
            // Sin esto el navegador no considera la fila un destino válido.
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
              {index + 1}
            </span>
            <span className="sortable-list__grip" aria-hidden="true">
              ⠿
            </span>
          </button>

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
                <button type="submit" className="sortable-list__control sortable-list__control_variant_danger">
                  Eliminar
                </button>
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
