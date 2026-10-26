"use client";

import { useState } from "react";
import { ArrowDownIcon } from "@/components/icons/arrow-down-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { LightbulbIcon } from "@/components/icons/lightbulb-icon.comp";
import { ListOlIcon } from "@/components/icons/list-ol-icon.comp";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import type { HomeCourseCopy, HomeCoursesCopy } from "@/types/academy-home.types";
import "./course-showcase.comp.css";

interface CourseShowcaseProps {
  courses: HomeCourseCopy[];
  inside: HomeCoursesCopy["inside"];
}

const FIGURE_ID = "curso-por-dentro";

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

function countOf(course: HomeCourseCopy) {
  const lessons = course.chapters.reduce((sum, chapter) => sum + chapter.lessons, 0);
  return `${plural(course.chapters.length, "capítulo", "capítulos")} · ${plural(lessons, "lección", "lecciones")}`;
}

/**
 * The four courses as cards that are toggles (`aria-pressed`) and, under
 * them, the chosen one as the student sees it inside the platform: its index,
 * its cover, its chapters and the lesson that comes next, on the board when it
 * has one. The only state is which course is open, so this is the section's
 * client leaf; the data is static (config/academy-home.config.ts).
 */
export function CourseShowcase({ courses, inside }: CourseShowcaseProps) {
  const [open, setOpen] = useState(0);
  const course = courses[open] ?? courses[0];
  if (!course) return null;

  return (
    <div className="course-showcase">
      <div
        className="course-showcase__cards"
        role="group"
        aria-label="Los cursos de la academia: elige uno para verlo por dentro"
      >
        {courses.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`course-showcase__card${index === open ? " course-showcase__card_state_open" : ""}`}
            aria-pressed={index === open}
            aria-controls={FIGURE_ID}
            onClick={() => setOpen(index)}
          >
            <span className={`course-showcase__cover course-showcase__cover_course_${item.cover}`}>
              <span className="course-showcase__kicker">{item.kicker}</span>
              <b className="course-showcase__cover-title">{item.coverTitle}</b>
            </span>
            {index === open && (
              <span className="course-showcase__shown">
                <EyeIcon variant="classic-solid" className="course-showcase__shown-icon" />
                Abierto abajo
              </span>
            )}
            <span className="course-showcase__body">
              <span className="course-showcase__name">{item.name}</span>
              <span className="course-showcase__tags">
                <span className="course-showcase__tag">{item.topic}</span>
                {item.levels.map((level) => (
                  <span key={level} className="course-showcase__tag course-showcase__tag_kind_level">
                    {level}
                  </span>
                ))}
              </span>
              <span className="course-showcase__count">
                <ListOlIcon className="course-showcase__count-icon" />
                {countOf(item)}
              </span>
            </span>
          </button>
        ))}
      </div>

      <figure id={FIGURE_ID} className="course-showcase__figure">
        <figcaption className="course-showcase__caption">
          <span className="course-showcase__say">
            <ArrowDownIcon variant="classic-solid" className="course-showcase__say-icon" />
            {inside.say}
          </span>
          <span className="course-showcase__note">
            {course.name} por dentro: {inside.note.charAt(0).toLowerCase() + inside.note.slice(1)}
          </span>
        </figcaption>

        <div className="course-showcase__screen">
          <div className="course-showcase__bar">
            <span className="course-showcase__brand">Cursos</span>
            <span className="course-showcase__search">
              <MagnifyingGlassIcon variant="classic-solid" className="course-showcase__search-icon" />
              Buscar en este curso
            </span>
          </div>

          <div className="course-showcase__main">
            <div className="course-showcase__side">
              <span className="course-showcase__side-course">
                <span className={`course-showcase__thumb course-showcase__cover_course_${course.cover}`} />
                <b className="course-showcase__side-name">{course.name}</b>
              </span>
              <span className="course-showcase__fab">
                <PlayIcon variant="classic-solid" className="course-showcase__fab-icon" />
                Aprender
              </span>
              <span className="course-showcase__group">Capítulos</span>
              <ol className="course-showcase__index">
                {course.chapters.map((chapter, index) => (
                  <li key={chapter.name} className="course-showcase__index-item">
                    <span className="course-showcase__index-number">{index + 1}</span>
                    <span className="course-showcase__index-name">{chapter.name}</span>
                    <small className="course-showcase__index-count">{chapter.lessons}</small>
                  </li>
                ))}
              </ol>
            </div>

            <div className="course-showcase__panel">
              <div className="course-showcase__trail">
                Tus cursos <span aria-hidden="true">›</span> <b>{course.name}</b>
              </div>
              <div className="course-showcase__content">
                <div className="course-showcase__overview">
                  <div className="course-showcase__hero">
                    <span className={`course-showcase__bigcover course-showcase__cover_course_${course.cover}`}>
                      <span className="course-showcase__kicker">{course.kicker}</span>
                      <b className="course-showcase__bigcover-title">{course.coverTitle}</b>
                    </span>
                    <span className="course-showcase__about">
                      <b className="course-showcase__title">{course.name}</b>
                      <span className="course-showcase__meta">
                        Del equipo de la academia · {course.topic} · {countOf(course)}
                      </span>
                      <span className="course-showcase__tags">
                        {course.levels.map((level) => (
                          <span key={level} className="course-showcase__tag course-showcase__tag_kind_level">
                            {level}
                          </span>
                        ))}
                      </span>
                      <span className="course-showcase__learn">
                        <PlayIcon variant="classic-solid" className="course-showcase__fab-icon" />
                        Aprender · {course.next.name}
                      </span>
                    </span>
                  </div>
                  <span className="course-showcase__chapters-title">Capítulos</span>
                  <ol className="course-showcase__chapters">
                    {course.chapters.map((chapter, index) => (
                      <li key={chapter.name} className="course-showcase__chapter">
                        <span className="course-showcase__chapter-kicker">Capítulo {index + 1}</span>
                        <b className="course-showcase__chapter-name">{chapter.name}</b>
                        <span className="course-showcase__chapter-about">{chapter.about}</span>
                        <span className="course-showcase__chapter-count">
                          {plural(chapter.lessons, "lección", "lecciones")}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="course-showcase__peek">
                  <span className="course-showcase__peek-kicker">
                    <LightbulbIcon className="course-showcase__peek-icon" />
                    Siguiente lección
                  </span>
                  <b className="course-showcase__peek-name">{course.next.name}</b>
                  {course.next.board && (
                    <div className="course-showcase__peek-board">
                      <SiteBoard
                        fen={course.next.board.fen}
                        lastMove={course.next.board.lastMove}
                        orientation={course.next.board.orientation}
                        label={course.next.board.label}
                      />
                    </div>
                  )}
                  <p className="course-showcase__peek-about">{course.next.about}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </figure>
    </div>
  );
}
