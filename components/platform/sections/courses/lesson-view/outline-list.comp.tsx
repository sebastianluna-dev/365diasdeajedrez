"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ChevronDownIcon } from "@/components/icons/chevron-down-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { OutlineChapter } from "@/services/courses/courses.types";
// The rows are drawn by the column's sheet, and a stylesheet only travels
// with the component that imports it.
import "./lesson-outline.comp.css";

interface OutlineListProps {
  /** Every chapter of the course with its lessons, in reading order. */
  chapters: OutlineChapter[];
}

const isDone = (statusCode: string) => statusCode === PROGRESS_STATUS.COMPLETED;

/**
 * The course's chapters in the lesson's side column (2026-10-22, the new
 * design system): each a row with its number — the success green with a check
 * once every lesson of it is learned —, its name and «1/3», which opens and
 * closes its lessons, as Gmail's labels fold. The chapter of the lesson being
 * read is open on arrival, and its lesson lit; a lesson learned carries the
 * success green's check, the one being read a play, the rest a clock.
 *
 * Client because of one thing: which lesson is open. The column lives in the
 * chapter's layout, which is not rendered again when one moves within it —
 * the list is not fetched between lessons —, so `usePathname` marks the row,
 * the instant the link is followed. On arriving, and on each move, the
 * lesson being read is brought into view when the column's place leaves it
 * cut off.
 */
export function OutlineList({ chapters }: OutlineListProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const currentChapter = chapters.find((chapter) => chapter.lessons.some((lesson) => lesson.href === pathname));
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(currentChapter ? [currentChapter.id] : []));

  // A move into another chapter opens it, and whatever was opened by hand stays so.
  const currentId = currentChapter?.id;
  const [shownFor, setShownFor] = useState(currentId);
  if (currentId !== shownFor) {
    setShownFor(currentId);
    if (currentId && !open.has(currentId)) setOpen(new Set([...open, currentId]));
  }

  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!current) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    current.scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
  }, [pathname]);

  const toggle = (id: string) =>
    setOpen((before) => {
      const after = new Set(before);
      if (after.has(id)) after.delete(id);
      else after.add(id);
      return after;
    });

  return (
    <div ref={listRef} className="lesson-outline__chapters">
      <p className="lesson-outline__title">Capítulos</p>
      {chapters.map((chapter, index) => {
        const learned = chapter.lessons.filter((lesson) => isDone(lesson.statusCode)).length;
        const whole = chapter.lessons.length > 0 && learned === chapter.lessons.length;
        const isOpen = open.has(chapter.id);
        const listId = `lesson-outline-${chapter.id}`;

        return (
          <section key={chapter.id} className="lesson-outline__section" aria-label={chapter.name}>
            <button
              type="button"
              className={`lesson-outline__chapter${chapter.id === currentId ? " lesson-outline__chapter_state_current" : ""}`}
              aria-expanded={isOpen}
              aria-controls={listId}
              onClick={() => toggle(chapter.id)}
            >
              <span
                className={`lesson-outline__badge${whole ? " lesson-outline__badge_state_done" : ""}`}
                aria-hidden="true"
              >
                {whole ? <CheckIcon variant="classic-solid" className="lesson-outline__badge-check" /> : index + 1}
              </span>
              <span className="lesson-outline__chapter-name" title={chapter.name}>
                {chapter.name}
              </span>
              <span className="lesson-outline__count">
                {learned}/{chapter.lessons.length}
              </span>
              <ChevronDownIcon variant="classic-solid" className="lesson-outline__fold" />
            </button>

            {isOpen && (
              <ol id={listId} className="lesson-outline__list">
                {chapter.lessons.map((lesson) => {
                  const isCurrent = lesson.href === pathname;
                  const icon = isDone(lesson.statusCode) ? (
                    <CircleCheckIcon
                      variant="duotone-solid"
                      className="lesson-outline__mark lesson-outline__mark_state_done"
                    />
                  ) : isCurrent ? (
                    <PlayIcon variant="classic-solid" className="lesson-outline__mark" />
                  ) : (
                    <ClockIcon variant="duotone-light" className="lesson-outline__mark" />
                  );

                  return (
                    <li key={lesson.id}>
                      {/* The lesson being read is not a link: it leads where one
                          already is, and `aria-current` is what says so. */}
                      {isCurrent ? (
                        <span
                          className="lesson-outline__lesson lesson-outline__lesson_state_current"
                          aria-current="page"
                        >
                          {icon}
                          <span className="lesson-outline__name" title={lesson.name}>
                            {lesson.name}
                          </span>
                        </span>
                      ) : (
                        <Link href={lesson.href} className="lesson-outline__lesson">
                          {icon}
                          <span className="lesson-outline__name" title={lesson.name}>
                            {lesson.name}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}
