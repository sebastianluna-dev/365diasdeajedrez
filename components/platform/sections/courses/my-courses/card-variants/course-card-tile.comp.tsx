import Image from "next/image";
import Link from "next/link";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./course-card-tile.comp.css";

/** A square at the card's side, and the full width on a phone. */
const SIZES = "(max-width: 760px) 100vw, 220px";

/**
 * A course of the student's as a tile, for a grid of three.
 *
 * It is the only one of the five that shows the course's WIDE cover, the
 * 21:9 the staff fills in and that «Mis cursos» never drew — the rows only
 * ever showed the square thumbnail. In exchange each course takes several
 * times the room.
 *
 * One of five designs on offer for «Mis cursos» (see the Storybook story);
 * the four that are not chosen go.
 */
export function CardTile({ course }: { course: MyCourseItem }) {
  const { progress } = course;
  return (
    <article className="tile-card">
      <Link href={course.href} className="tile-card__cover" aria-hidden="true" tabIndex={-1}>
        {(course.cover ?? course.thumbnail) && (
          <Image src={(course.cover ?? course.thumbnail)!} alt="" fill sizes={SIZES} className="tile-card__image" />
        )}
      </Link>

      <div className="tile-card__body">
        <h2 className="tile-card__name">
          <Link href={course.href} className="tile-card__link">
            {course.name}
          </Link>
        </h2>

        <div className="tile-card__meter">
          <div className="tile-card__track">
            <div className="tile-card__fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="tile-card__figure">
            {progress.completedLessons}/{progress.totalLessons} lecciones · {progress.percent}%
          </p>
        </div>

        {course.learnHref && (
          <Link href={course.learnHref} className="tile-card__learn">
            Aprender
          </Link>
        )}
      </div>
    </article>
  );
}
