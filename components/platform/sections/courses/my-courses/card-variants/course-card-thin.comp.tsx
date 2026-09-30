import Image from "next/image";
import Link from "next/link";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./course-card-thin.comp.css";

/** A square at the card's side, and the full width on a phone. */
const SIZES = "(max-width: 760px) 100vw, 220px";

/**
 * A course of the student's as one row of a list.
 *
 * There is no card per course: the list is the card, and each course is a
 * row of it, with the bar in line with the name. A student with a dozen
 * courses sees them all without scrolling; one with two sees a thin list
 * where the rows used to have presence.
 *
 * One of five designs on offer for «Mis cursos» (see the Storybook story);
 * the four that are not chosen go.
 */
export function CardThin({ course }: { course: MyCourseItem }) {
  const { progress } = course;
  return (
    <article className="thin-card">
      <Link href={course.href} className="thin-card__cover" aria-hidden="true" tabIndex={-1}>
        {course.thumbnail && <Image src={course.thumbnail} alt="" fill sizes={SIZES} className="thin-card__image" />}
      </Link>

      <h2 className="thin-card__name">
        <Link href={course.href} className="thin-card__link">
          {course.name}
        </Link>
      </h2>

      <div className="thin-card__track" aria-hidden="true">
        <div className="thin-card__fill" style={{ width: `${progress.percent}%` }} />
      </div>

      <p className="thin-card__figure">
        {progress.completedLessons}/{progress.totalLessons}
      </p>

      {course.learnHref && (
        <Link href={course.learnHref} className="thin-card__learn" aria-label={`Aprender en ${course.name}`}>
          Aprender
        </Link>
      )}
    </article>
  );
}
