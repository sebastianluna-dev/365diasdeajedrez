"use client";

import { useEffect, useRef } from "react";

interface OutlineScrollProps {
  /**
   * One key per chapter: its own list, its own place in it. The chapter's
   * href is what identifies it here, so nothing new has to be passed down.
   */
  chapterKey: string;
}

/**
 * Remembers how far the column of lessons was scrolled, and puts it back.
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
