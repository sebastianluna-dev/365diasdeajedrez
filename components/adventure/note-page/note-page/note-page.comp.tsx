"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AdventureZoneSeed } from "@/lib/adventure/adventure.types";
import { pageClip } from "./note-page-clip";
import { DEFAULT_PAGE_TAPE, PAGE_TAPES } from "./note-page.const";
import "@/components/adventure/adventure.css";
import "./note-page.comp.css";

interface NotePageProps {
  zone: AdventureZoneSeed;
  /** The page's place in the notebook, 1 to 6: the number in the circle. */
  number: number;
  /** The person has got to this zone: the page can be read. Until then it is a folded flap that says «Se abre al llegar». */
  isReached: boolean;
  /**
   * Where it lies on the map: the percentage of the world's width and height of
   * its centre, the percentage of the world's width it measures and its tilt.
   */
  position: { left: number; top: number; width: number; rotation: number };
  /** The phone's layout: the page is narrow, so its type and its padding are smaller. */
  isCompact?: boolean;
}

/**
 * A page of the notebook of 1994, read on arriving at a zone: the label with
 * its place, and the ruled sheet with the chapter, the note and who signed it
 * — a page that was torn out has a ragged edge and no signature. Three states:
 * `closed` (not reached: a flap over it, «Se abre al llegar»), `folded`
 * (reached, only its top half shows) and `open` (the flap turns up and the
 * sheet unrolls), which it passes to the first time half of it comes into view.
 * Whoever asks for less motion gets it open at once (the stylesheet).
 */
export function NotePage({ zone, number, isReached, position, isCompact = false }: NotePageProps) {
  const ref = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const state = !isReached ? "closed" : isOpen ? "open" : "folded";
  const isTorn = zone.torn === true;

  useEffect(() => {
    const page = ref.current;
    if (!isReached || isOpen || !page || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsOpen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(page);
    return () => observer.disconnect();
  }, [isReached, isOpen]);

  return (
    <article
      ref={ref}
      className={`note-page note-page_state_${state}${isTorn ? " note-page_torn" : ""}${isCompact ? " note-page_size_compact" : ""}`}
      style={
        {
          left: `${position.left}%`,
          top: `${position.top}%`,
          width: `${position.width}%`,
          "--rotation": `${position.rotation}deg`,
          "--tape": PAGE_TAPES[zone.slug] ?? DEFAULT_PAGE_TAPE,
          "--clip-folded": pageClip(false, isTorn),
          "--clip-open": pageClip(true, isTorn),
        } as CSSProperties
      }
      aria-label={`Página ${number} del cuaderno: ${zone.name}`}
    >
      <h2 className="note-page__label">
        <span className="note-page__number" aria-hidden="true">
          {number}
        </span>
        <span className="note-page__kind">{zone.kind}</span>
        <span className="note-page__place">{zone.name}</span>
      </h2>
      <div className="note-page__paper">
        <div className="note-page__sheet" aria-hidden={isReached ? undefined : true}>
          <p className="note-page__chapter">{zone.chapter}</p>
          <p className="note-page__note">{zone.note}</p>
          {!isTorn && <p className="note-page__signature">— {zone.signature}</p>}
        </div>
        <div className="note-page__flap" aria-hidden="true">
          <span>{isReached ? "" : "Se abre al llegar"}</span>
        </div>
      </div>
      {!isReached && <p className="note-page__sr-only">Se abre al llegar</p>}
    </article>
  );
}
