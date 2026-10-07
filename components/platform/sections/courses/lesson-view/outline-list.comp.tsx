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
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const scroller = listRef.current?.parentElement;
    if (!current || !scroller) return;

    // A rect carries the page's zoom; `scrollTop` and `clientHeight` are in
    // the scroller's own px, so the distances cross over before being used.
    const zoom = scroller.currentCSSZoom || 1;
    const scrollerBox = scroller.getBoundingClientRect();
    const rowBox = current.getBoundingClientRect();
    const top = (rowBox.top - scrollerBox.top) / zoom;
    const bottom = (rowBox.bottom - scrollerBox.top) / zoom;
    const rowHeight = rowBox.height / zoom;
    const visible = scroller.clientHeight;

    // The row's chapter is stuck to the top of the column while one is in it,
    // so the top of the column is not where a row can be seen from: what that
    // head covers is not room.
    const stickyHead = current.closest("section")?.querySelector<HTMLElement>("[data-sticky-head]");
    const covered = stickyHead ? stickyHead.getBoundingClientRect().height / zoom : 0;

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = calm || !arrived.current ? "auto" : "smooth";
    const arriving = !arrived.current;
    arrived.current = true;

    // On arriving, the column opens on the lesson's CHAPTER: its head at the
    // top, its lessons under it. The browser stops the scroll short where the
    // course ends, so a last chapter too short to fill the column simply
    // shows what is above it too. Only when the lesson being read would be
    // left under the bottom edge is the row brought up instead — and then the
    // chapter's head is still the first thing in view, stuck to the top.
    const section = current.closest("section");
    if (arriving && section) {
      const sectionTop = (section.getBoundingClientRect().top - scrollerBox.top) / zoom;
      if (bottom - sectionTop <= visible) {
        scroller.scrollTo({ top: scroller.scrollTop + sectionTop, behavior });
        return;
      }
    }

    if (top < covered + TOP_MARGIN) {
      // Cut off at the top, or hidden under the chapter: bring it out.
      scroller.scrollTo({ top: scroller.scrollTop + top - covered - TOP_MARGIN, behavior });
    } else if (bottom > visible) {
      // Cut off at the bottom: bring it up far enough to leave a row under it,
      // so it lands as the next to last one in view and not pressed against
      // the edge.
      const missing = bottom - visible;
      scroller.scrollTo({ top: scroller.scrollTop + missing + rowHeight, behavior });
    }
  }, [pathname]);

  return (
    <div ref={listRef} className="lesson-outline__chapters">
      {chapters.map((chapter) => (
        <section key={chapter.id} className="lesson-outline__section" aria-label={chapter.name}>
          {/* `data-sticky-head`: what the effect above measures to know how
              much of the top of the column this covers. */}
          <div data-sticky-head="" className="lesson-outline__chapter">
            {/* One line, cut with an ellipsis: the whole name under the pointer. */}
            <Link href={chapter.href} className="lesson-outline__chapter-name" title={chapter.name}>
              {chapter.name}
            </Link>
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
