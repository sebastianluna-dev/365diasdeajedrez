import Image from "next/image";
import Link from "next/link";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./course-card-underline.comp.css";

/** A square at the card's side, and the full width on a phone. */
const SIZES = "(max-width: 760px) 100vw, 220px";

/**
 * A course of the student's as a row whose progress is its bottom edge.
 *
 * The bar leaves the inside of the card and underlines it across its whole
 * width: down a column of courses the progress is read at a glance, without
 * measuring anything, and the middle of the card is left to the name and its
 * author. The percentage is written out beside the button, so the figure is
 * there too.
 *
 * One of five designs on offer for «Mis cursos» (see the Storybook story);
 * the four that are not chosen go.
 */
export function CardUnderline({ course }: { course: MyCourseItem }) {
  const { progress } = course;
  return (
    <article className="under-card">
      <div className="under-card__row">
        <Link href={course.href} className="under-card__cover" aria-hidden="true" tabIndex={-1}>
          {course.thumbnail && <Image src={course.thumbnail} alt="" fill sizes={SIZES} className="under-card__image" />}
        </Link>

        <div className="under-card__body">
          <h2 className="under-card__name">
            <Link href={course.href} className="under-card__link">
              {course.name}
            </Link>
          </h2>
          {course.authorNames.length > 0 && <p className="under-card__by">{course.authorNames.join(", ")}</p>}
        </div>

        <p className="under-card__figures">
          <span className="under-card__percent">{progress.percent}%</span>
          <span className="under-card__detail">
            {progress.completedLessons}/{progress.totalLessons} lecciones
          </span>
        </p>

        {course.learnHref && (
          <Link href={course.learnHref} className="under-card__learn">
            Aprender
          </Link>
        )}
      </div>

      <div className="under-card__bar" aria-hidden="true">
        <div className="under-card__fill" style={{ width: `${progress.percent}%` }} />
      </div>
    </article>
  );
}
