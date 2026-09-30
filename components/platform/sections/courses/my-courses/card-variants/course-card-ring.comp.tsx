import Image from "next/image";
import Link from "next/link";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./course-card-ring.comp.css";

/** A square at the card's side, and the full width on a phone. */
const SIZES = "(max-width: 760px) 100vw, 220px";

/** The gauge is drawn on a 36-unit box; the radius leaves room for its stroke. */
const RADIUS = 15;
const LENGTH = 2 * Math.PI * RADIUS;

/**
 * A course of the student's as a row, with its progress on a ring.
 *
 * The two bars go: the figures are read as one line of text and the ring
 * gives the percentage as a figure, which is what one wants to know — a bar
 * has to be measured by eye. It is the same ring the chapter carries in the
 * column beside a lesson, so the two agree.
 *
 * One of five designs on offer for «Mis cursos» (see the Storybook story);
 * the four that are not chosen go.
 */
export function CardRing({ course }: { course: MyCourseItem }) {
  const { progress } = course;
  return (
    <article className="ring-card">
      <Link href={course.href} className="ring-card__cover" aria-hidden="true" tabIndex={-1}>
        {course.thumbnail && <Image src={course.thumbnail} alt="" fill sizes={SIZES} className="ring-card__image" />}
      </Link>

      <div className="ring-card__body">
        <h2 className="ring-card__name">
          <Link href={course.href} className="ring-card__link">
            {course.name}
          </Link>
        </h2>
        <p className="ring-card__figures">
          <span>{progress.completedLessons} de {progress.totalLessons} lecciones</span>
          <span className="ring-card__dot" aria-hidden="true">·</span>
          <span>{progress.completedMinutes}/{progress.totalMinutes} minutos</span>
        </p>
      </div>

      <span className="ring-card__gauge">
        <svg viewBox="0 0 36 36" className="ring-card__ring" aria-hidden="true">
          <circle className="ring-card__track" cx="18" cy="18" r={RADIUS} />
          {progress.percent > 0 && (
            <circle
              className="ring-card__fill"
              cx="18"
              cy="18"
              r={RADIUS}
              style={{ strokeDasharray: LENGTH, strokeDashoffset: LENGTH * (1 - progress.percent / 100) }}
            />
          )}
        </svg>
        <span className="ring-card__value">{progress.percent}%</span>
      </span>

      {course.learnHref && (
        <Link href={course.learnHref} className="ring-card__learn">
          Aprender
        </Link>
      )}
    </article>
  );
}
