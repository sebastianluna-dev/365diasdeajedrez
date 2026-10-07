"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { OutlineChapter } from "@/services/courses/courses.types";
// The rows are drawn by the column's sheet, and a stylesheet only travels
// with the component that imports it: without this the list rendered right
// only inside LessonOutline.
import "./lesson-outline.comp.css";

interface OutlineListProps {
  /** Every chapter of the course with its lessons, in reading order. */
  chapters: OutlineChapter[];
}

/** Air left above the row when it is brought to the top. */
const TOP_MARGIN = 10;

/**
 * Every lesson carries its stop on the thread: the filled check once it is
 * done, an empty ring while it is not. The ring is drawn by the stylesheet,
 * since it is a circle and not a drawing.
 */
function mark(isCompleted: boolean) {
  return isCompleted ? (
    <CircleCheckIcon variant="duotone-solid" className="lesson-outline__done" />
  ) : (
    <span className="lesson-outline__pending" aria-hidden="true" />
  );
}

/** The ring is drawn on a 36-unit box; its radius leaves room for its stroke (3), and no more, so «100%» fits inside. */
const GAUGE_RADIUS = 16;
const GAUGE_LENGTH = 2 * Math.PI * GAUGE_RADIUS;

/**
 * How much of a chapter is done, on a ring, counted from the very lessons the
 * column draws for it, so what the ring says and what the marks say can never
 * differ. The arc is drawn by holding back part of the circle's own length.
 */
function Gauge({ chapter }: { chapter: OutlineChapter }) {
  const done = chapter.lessons.filter((lesson) => lesson.statusCode === PROGRESS_STATUS.COMPLETED).length;
  const percent = chapter.lessons.length > 0 ? Math.round((done / chapter.lessons.length) * 100) : 0;

  return (
    <span className="lesson-outline__gauge">
      <svg className="lesson-outline__gauge-ring" viewBox="0 0 36 36" aria-hidden="true">
        <circle className="lesson-outline__gauge-track" cx="18" cy="18" r={GAUGE_RADIUS} />
        {percent > 0 && (
          <circle
            className="lesson-outline__gauge-fill"
            cx="18"
            cy="18"
            r={GAUGE_RADIUS}
            style={{ strokeDasharray: GAUGE_LENGTH, strokeDashoffset: GAUGE_LENGTH * (1 - percent / 100) }}
          />
        )}
      </svg>
      <span className="lesson-outline__gauge-value">{percent}%</span>
    </span>
  );
}

/**
 * The course's table of contents: every chapter, its head and its lessons,
 * and the only client piece of the column.
 *
 * Client because of one thing: which lesson is open. The column lives in the
 * chapter's layout, and a layout is not rendered again when one moves within
 * it — that is the whole point, the list is not fetched between lessons — so
 * the server cannot mark the row. `usePathname` does, and it does it the
 * instant the link is followed, before the lesson's own PGN has arrived.
 *
 * Each chapter is a section of its own, with its head stuck to the top of the
 * column while its lessons run under it: when they end, the next chapter's
 * head pushes it away and takes its place, because a sticky element stays
 * inside its own section.
 *
 * Keeping the place in the list is no longer anyone's job either: the element
 * is never unmounted while one moves within a chapter, so its scroll stays
 * where it was. What is still needed is where it opens — on arriving, the
 * lesson's chapter at the top, at once, since smoothly it would sweep through
 * every chapter above it — and, after that, bringing the lesson being read
 * into view when the list's place leaves it cut off.
 */
export function OutlineList({ chapters }: OutlineListProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const arrived = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[aria-current="page"]');
    const scroller = list?.parentElement;
    if (!list || !current || !scroller) return;

    /** Where the row and its chapter are now, in the scroller's own px. */
    const measure = () => {
      // A rect carries the page's zoom; `scrollTop` and `clientHeight` are in
      // the scroller's own px, so the distances cross over before being used.
      const zoom = scroller.currentCSSZoom || 1;
      const scrollerTop = scroller.getBoundingClientRect().top;
      const rowBox = current.getBoundingClientRect();
      const section = current.closest("section");
      // The row's chapter is stuck to the top of the column while one is in
      // it, so the top of the column is not where a row can be seen from:
      // what that head covers is not room.
      const stickyHead = section?.querySelector<HTMLElement>("[data-sticky-head]");
      return {
        top: (rowBox.top - scrollerTop) / zoom,
        bottom: (rowBox.bottom - scrollerTop) / zoom,
        rowHeight: rowBox.height / zoom,
        sectionTop: section ? (section.getBoundingClientRect().top - scrollerTop) / zoom : null,
        covered: stickyHead ? stickyHead.getBoundingClientRect().height / zoom : 0,
        visible: scroller.clientHeight,
      };
    };

    /** Brings the row out when it is cut off, at either edge. */
    const reveal = (behavior: ScrollBehavior) => {
      const { top, bottom, rowHeight, covered, visible } = measure();
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
    };

    /**
     * On arriving, the column opens on the lesson's CHAPTER: its head at the
     * top, its lessons under it, at once. The browser stops the scroll short
     * where the course ends, so a last chapter too short to fill the column
     * simply shows what is above it too. Only when the lesson being read
     * would be left under the bottom edge is the row brought up instead — and
     * then the chapter's head is still the first thing in view, stuck there.
     */
    const openOnChapter = () => {
      const { bottom, sectionTop, visible } = measure();
      if (sectionTop !== null && bottom - sectionTop <= visible) {
        scroller.scrollTo({ top: scroller.scrollTop + sectionTop, behavior: "auto" });
      } else {
        reveal("auto");
      }
    };

    if (arrived.current) {
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      reveal(calm ? "auto" : "smooth");
      return;
    }
    arrived.current = true;
    openOnChapter();

    // The column may still be settling when it is first drawn — a font, a
    // stylesheet or an image arriving late changes the height of what is
    // above the chapter, and the chapter is left a few px off the top with a
    // slice of the one before showing. So it is put back each time the list
    // changes size, until the person scrolls it themselves or two seconds go by.
    let settled = false;
    const observer = new ResizeObserver(() => {
      if (!settled) openOnChapter();
    });
    const settle = () => {
      settled = true;
      observer.disconnect();
      scroller.removeEventListener("wheel", settle);
      scroller.removeEventListener("touchstart", settle);
      scroller.removeEventListener("keydown", settle);
      scroller.removeEventListener("pointerdown", settle);
    };
    observer.observe(list);
    scroller.addEventListener("wheel", settle, { passive: true });
    scroller.addEventListener("touchstart", settle, { passive: true });
    scroller.addEventListener("keydown", settle);
    scroller.addEventListener("pointerdown", settle);
    void document.fonts.ready.then(() => {
      if (!settled) openOnChapter();
    });
    const timer = window.setTimeout(settle, 2000);

    return () => {
      window.clearTimeout(timer);
      // Undone before it settled (React's development double run, or a move
      // in the first instants): the next run is still an arrival.
      if (!settled) arrived.current = false;
      settle();
    };
  }, [pathname]);

  return (
    <div ref={listRef} className="lesson-outline__chapters">
      {chapters.map((chapter) => (
        <section key={chapter.id} className="lesson-outline__section" aria-label={chapter.name}>
          {/* `data-sticky-head`: what the effect above measures to know how
              much of the top of the column this covers. */}
          <div data-sticky-head="" className="lesson-outline__chapter">
            {/* A name, not a link: the column's one way out is the course's
                title. One line, cut with an ellipsis: the whole name under
                the pointer. */}
            <span className="lesson-outline__chapter-name" title={chapter.name}>
              {chapter.name}
            </span>
            <Gauge chapter={chapter} />
          </div>

          <ol className="lesson-outline__list">
            {chapter.lessons.map((lesson) => {
              const isCurrent = lesson.href === pathname;
              const isCompleted = lesson.statusCode === PROGRESS_STATUS.COMPLETED;

              return (
                <li key={lesson.id} className="lesson-outline__item">
                  {/* The lesson being read is not a link: it leads where one already
                      is, and `aria-current` is what says so to a screen reader. */}
                  {isCurrent ? (
                    <span className="lesson-outline__lesson lesson-outline__lesson_state_current" aria-current="page">
                      {/* One line, cut with an ellipsis: the whole name under the pointer. */}
                      <span className="lesson-outline__name" title={lesson.name}>
                        {lesson.name}
                      </span>
                      {mark(isCompleted)}
                    </span>
                  ) : (
                    <Link href={lesson.href} className="lesson-outline__lesson">
                      <span className="lesson-outline__name" title={lesson.name}>
                        {lesson.name}
                      </span>
                      {mark(isCompleted)}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
