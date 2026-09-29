"use client";

import { useEffect, useRef } from "react";

interface OutlineScrollProps {
  /**
   * One key per chapter: its own list, its own place in it. The chapter's
   * href is what identifies it here, so nothing new has to be passed down.
   */
  chapterKey: string;
}

/** Air left above the row when it is brought to the top. */
const TOP_MARGIN = 10;

/**
 * Remembers how far the column of lessons was scrolled, puts it back, and
 * then makes sure the lesson being read is whole on the screen.
 *
 * Moving from one lesson to the next renders the whole page again — the
 * column included, since it lives in the page and not in a layout — so the
 * list came back at the top and whoever was half way down a long chapter had
 * to find their place again.
 *
 * It renders nothing: it hangs off the element it is mounted in, which is the
 * one that scrolls. `sessionStorage` and not `localStorage`: where one is in
 * a list belongs to the visit, not to the machine.
 */
export function OutlineScroll({ chapterKey }: OutlineScrollProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scroller = anchorRef.current?.parentElement;
    if (!scroller) return;
    const key = `lesson-outline:${chapterKey}`;

    // Every read and write is guarded: a private window throws on both.
    try {
      const saved = Number(sessionStorage.getItem(key));
      if (Number.isFinite(saved) && saved > 0) scroller.scrollTop = saved;
    } catch {
      // No memory available; the list simply starts at the top.
    }

    // The remembered place can leave the lesson one is actually reading half
    // out of the list, or off it: bring it back.
    const current = scroller.querySelector<HTMLElement>('[aria-current="page"]');
    if (current) {
      // A rect carries the page's zoom; `scrollTop` and `clientHeight` are in
      // the scroller's own px, so the distances cross over before being used.
      const zoom = scroller.currentCSSZoom || 1;
      const scrollerBox = scroller.getBoundingClientRect();
      const rowBox = current.getBoundingClientRect();
      const top = (rowBox.top - scrollerBox.top) / zoom;
      const bottom = (rowBox.bottom - scrollerBox.top) / zoom;
      const rowHeight = rowBox.height / zoom;
      const visible = scroller.clientHeight;

      // The chapter's name is stuck to the top of the list, so the top of the
      // list is not where a row can be seen from: what it covers is not room.
      const stickyHead = scroller.querySelector<HTMLElement>("[data-sticky-head]");
      const covered = stickyHead ? stickyHead.getBoundingClientRect().height / zoom : 0;

      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior: ScrollBehavior = calm ? "auto" : "smooth";

      if (top < covered + TOP_MARGIN) {
        // Cut off at the top, or hidden under the chapter: bring it out.
        scroller.scrollTo({ top: scroller.scrollTop + top - covered - TOP_MARGIN, behavior });
      } else if (bottom > visible) {
        // Cut off at the bottom: bring it up far enough to leave a row under
        // it, so it lands as the next to last one in view and not pressed
        // against the edge.
        const missing = bottom - visible;
        scroller.scrollTo({ top: scroller.scrollTop + missing + rowHeight, behavior });
      }
    }

    let frame = 0;
    const remember = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        try {
          sessionStorage.setItem(key, String(Math.round(scroller.scrollTop)));
        } catch {
          // Same as above.
        }
      });
    };

    scroller.addEventListener("scroll", remember, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", remember);
    };
  }, [chapterKey]);

  return <span ref={anchorRef} hidden />;
}
