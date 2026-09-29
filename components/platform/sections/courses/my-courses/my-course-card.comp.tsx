import Image from "next/image";
import Link from "next/link";
import { CircleCheckSolidIcon } from "@/components/icons/circle-check-solid-icon.comp";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./my-course-card.comp.css";

interface MyCourseCardProps {
  course: MyCourseItem;
}

/** The cover is a thumbnail at the card's side, and the full width on a phone. */
const COVER_SIZES = "(max-width: 760px) 100vw, 220px";

/**
 * A course of the student's, as a row: its cover, its name, how far they are
 * in it — in minutes and in lessons, each with its bar — and the two things
 * to do with it, «Repasar» and «Aprender».
 *
 * It is the course they already chose, so it says nothing of what the course
 * is — no description, no levels, no content types: that is the catalog's
 * card, `CourseCard`. What it is for is the progress.
 *
 * The card is a link to the course, through the title's: its `::after`
 * covers the card. The two buttons sit above it, because each leads
 * somewhere else. One that leads nowhere — nothing learned to review,
 * nothing left to learn — keeps its place, switched off, so the rows of the
 * list line up.
 */
export function MyCourseCard({ course }: MyCourseCardProps) {
  const { progress } = course;

  return (
    <article className="my-course-card">
      <div className="my-course-card__cover">
        {course.cover && (
          <Image src={course.cover} alt="" fill sizes={COVER_SIZES} className="my-course-card__cover-image" />
        )}
      </div>

      <div className="my-course-card__body">
        <h2 className="my-course-card__name">
          <Link href={course.href} className="my-course-card__link">
            {course.name}
          </Link>
        </h2>

        <div className="my-course-card__foot">
          <div className="my-course-card__meters">
            {/* A course whose lessons say no minutes is measured in lessons alone. */}
            {progress.totalMinutes > 0 && (
              <div className="my-course-card__meter">
                <p className="my-course-card__figure">
                  <span className="my-course-card__value">
                    {progress.completedMinutes}/{progress.totalMinutes}
                  </span>{" "}
                  minutos
                </p>
                <div className="my-course-card__track">
                  <div className="my-course-card__fill" style={{ width: `${progress.minutesPercent}%` }} />
                </div>
              </div>
            )}

            <div className="my-course-card__meter">
              <p className="my-course-card__figure">
                {course.isCompleted && (
                  <span className="my-course-card__done" role="img" aria-label="Curso completo">
                    <CircleCheckSolidIcon className="my-course-card__done-icon" />
                  </span>
                )}
                <span className="my-course-card__value">
                  {progress.completedLessons}/{progress.totalLessons}
                </span>{" "}
                {progress.totalLessons === 1 ? "lección" : "lecciones"}
              </p>
              <div className="my-course-card__track">
                <div className="my-course-card__fill" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </div>

          <div className="my-course-card__actions">
            {course.reviewCount > 0 ? (
              <Link href={course.reviewHref} className="my-course-card__review">
                Repasar
                <span
                  className="my-course-card__review-count"
                  aria-label={`${course.reviewCount} ${course.reviewCount === 1 ? "ejercicio" : "ejercicios"}`}
                >
                  {course.reviewCount}
                </span>
              </Link>
            ) : (
              <span className="my-course-card__review my-course-card__review_state_off" aria-disabled="true">
                Repasar
              </span>
            )}

            {course.learnHref ? (
              <Link href={course.learnHref} className="my-course-card__learn">
                Aprender
              </Link>
            ) : (
              <span className="my-course-card__learn my-course-card__learn_state_off" aria-disabled="true">
                Aprender
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
