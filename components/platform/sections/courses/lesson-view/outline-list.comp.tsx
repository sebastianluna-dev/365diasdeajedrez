"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CircleCheckSolidIcon } from "@/components/icons/circle-check-solid-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { LessonSibling } from "@/services/courses/courses.types";
// The rows are drawn by the column's sheet, and a stylesheet only travels
// with the component that imports it: without this the list rendered right
// only inside LessonOutline.
import "./lesson-outline.comp.css";

interface OutlineListProps {
  /** The chapter's lessons, in reading order. */
  lessons: LessonSibling[];
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
    <CircleCheckSolidIcon className="lesson-outline__done" />
  ) : (
    <span className="lesson-outline__pending" aria-hidden="true" />
  );
}

/**
 * The list of lessons, and the only client piece of the column.
 *
 * Client because of one thing: which lesson is open. The column lives in the
 * chapter's layout, and a layout is not rendered again when one moves within
 * it — that is the whole point, the list is not fetched between lessons — so
 * the server cannot mark the row. `usePathname` does, and it does it the
 * instant the link is followed, before the lesson's own PGN has arrived.
 *
 * Keeping the place in the list is no longer anyone's job either: the element
 * is never unmounted, so its scroll stays where it was. What is still needed
 * is bringing the lesson being read back into view when the list's place
 * leaves it cut off.
 */
export function OutlineList({ lessons }: OutlineListProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLOListElement>(null);

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
      // Cut off at the bottom: bring it up far enough to leave a row under it,
      // so it lands as the next to last one in view and not pressed against
      // the edge.
      const missing = bottom - visible;
      scroller.scrollTo({ top: scroller.scrollTop + missing + rowHeight, behavior });
    }
  }, [pathname]);

  return (
    <ol ref={listRef} className="lesson-outline__list">
      {lessons.map((lesson) => {
        const isCurrent = lesson.href === pathname;
        const isCompleted = lesson.statusCode === PROGRESS_STATUS.COMPLETED;

        return (
          <li key={lesson.id} className="lesson-outline__item">
            {/* The lesson being read is not a link: it leads where one already
                is, and `aria-current` is what says so to a screen reader. */}
            {isCurrent ? (
              <span className="lesson-outline__lesson lesson-outline__lesson_state_current" aria-current="page">
                <span className="lesson-outline__name">{lesson.name}</span>
                {mark(isCompleted)}
              </span>
            ) : (
              <Link href={lesson.href} className="lesson-outline__lesson">
                <span className="lesson-outline__name">{lesson.name}</span>
                {mark(isCompleted)}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
