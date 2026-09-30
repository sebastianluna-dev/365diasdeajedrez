import Image from "next/image";
import Link from "next/link";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./course-card-band.comp.css";

/** A square at the card's side, and the full width on a phone. */
const SIZES = "(max-width: 760px) 100vw, 220px";

/**
 * A course of the student's as a row with the progress up its own side.
 *
 * The band climbs from the bottom, so a course barely started and one nearly
 * finished are told apart by the shape of the card itself. The figures are
 * read as data — lessons and minutes, each under its label — and the way on
 * is a link with an arrow, the lightest of the five.
 *
 * One of five designs on offer for «Mis cursos» (see the Storybook story);
 * the four that are not chosen go.
 */
export function CardBand({ course }: { course: MyCourseItem }) {
  const { progress } = course;
  return (
    <article className="band-card">
      <span className="band-card__band" aria-hidden="true">
        <span className="band-card__band-fill" style={{ height: `${progress.percent}%` }} />
      </span>

      <Link href={course.href} className="band-card__cover" aria-hidden="true" tabIndex={-1}>
        {course.thumbnail && <Image src={course.thumbnail} alt="" fill sizes={SIZES} className="band-card__image" />}
      </Link>

      <div className="band-card__body">
        <h2 className="band-card__name">
          <Link href={course.href} className="band-card__link">
            {course.name}
          </Link>
        </h2>
        <dl className="band-card__facts">
          <div>
            <dt>Lecciones</dt>
            <dd>
              {progress.completedLessons}/{progress.totalLessons}
            </dd>
          </div>
          <div>
            <dt>Minutos</dt>
            <dd>
              {progress.completedMinutes}/{progress.totalMinutes}
            </dd>
          </div>
        </dl>
      </div>

      {course.learnHref && (
        <Link href={course.learnHref} className="band-card__learn">
          Aprender
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  );
}
