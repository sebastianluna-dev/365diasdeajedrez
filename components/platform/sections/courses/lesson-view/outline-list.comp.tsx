"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleIcon } from "@/components/icons/circle-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { PROGRESS_STATUS } from "@/constants/platform/shared-codes.const";
import type { OutlineChapter } from "@/services/courses/courses.types";
// The rows are drawn by the column's sheet, and a stylesheet only travels
// with the component that imports it.
import "./lesson-outline.comp.css";

interface OutlineListProps {
  /** The chapter the lesson is in, with its lessons in reading order. */
  chapter: OutlineChapter;
}

const isDone = (statusCode: string) => statusCode === PROGRESS_STATUS.COMPLETED;

/**
 * The chapter in the lesson's side column (2026-10-23: that chapter alone,
 * no longer every chapter of the course): its number and name — a link to
 * its page — and «learned/total», then its lessons. A lesson learned carries
 * the blue check, the one being read a play, the rest an empty ring, as on
 * the chapter's page.
 *
 * Client because of one thing: which lesson is open. The column lives in the
 * chapter's layout, which is not rendered again when one moves within it —
 * the list is not fetched between lessons —, so `usePathname` marks the row,
 * the instant the link is followed. On arriving, and on each move, the
 * lesson being read is brought into view when the column's place leaves it
 * cut off.
 */
export function OutlineList({ chapter }: OutlineListProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLOListElement>(null);
  const learned = chapter.lessons.filter((lesson) => isDone(lesson.statusCode)).length;

  useEffect(() => {
    const current = listRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!current) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    current.scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" });
  }, [pathname]);

  return (
    <section className="lesson-outline__chapters" aria-label={chapter.name}>
      <Link href={chapter.href} className="lesson-outline__chapter">
        <span className="lesson-outline__chapter-text">
          <span className="lesson-outline__title">Capítulo {chapter.order}</span>
          <span className="lesson-outline__chapter-name" title={chapter.name}>
            {chapter.name}
          </span>
        </span>
        <span className="lesson-outline__count">
          {learned}/{chapter.lessons.length}
        </span>
      </Link>

      <ol ref={listRef} className="lesson-outline__list">
        {chapter.lessons.map((lesson) => {
          const isCurrent = lesson.href === pathname;
          const icon = isDone(lesson.statusCode) ? (
            <CircleCheckIcon variant="classic-solid" className="lesson-outline__mark lesson-outline__mark_state_done" />
          ) : isCurrent ? (
            <PlayIcon variant="classic-solid" className="lesson-outline__mark" />
          ) : (
            <CircleIcon variant="classic-light" className="lesson-outline__mark" />
          );

          return (
            <li key={lesson.id}>
              {/* The lesson being read is not a link: it leads where one
                  already is, and `aria-current` is what says so. */}
              {isCurrent ? (
                <span className="lesson-outline__lesson lesson-outline__lesson_state_current" aria-current="page">
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
    </section>
  );
}
