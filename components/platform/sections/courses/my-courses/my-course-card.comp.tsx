import Image from "next/image";
import Link from "next/link";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { countLessons } from "@/services/courses/course-rules";
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
 * The card is NOT a link. What leads to the course is its cover and its
 * name, and each button leads where it says: a row with three destinations
 * cannot be one target. The cover's link is left out of the tab order and
 * of the accessibility tree — it has no name of its own and the title's,
 * next to it, leads to the same place.
 *
 * A button that leads nowhere — nothing learned to review, nothing left to
 * learn — keeps its place, switched off, so the rows of the list line up.
 *
 * «Repasar» is the Move Trainer's: while that is off (`MOVE_TRAINER_ENABLED`)
 * the button is not drawn at all, and «Aprender» is the row's one button.
 */
export function MyCourseCard({ course }: MyCourseCardProps) {
  const { progress } = course;

  return (
    <article className="my-course-card">
      <Link href={course.href} className="my-course-card__cover" aria-hidden="true" tabIndex={-1}>
        {course.cover && (
          <Image src={course.cover} alt="" fill sizes={COVER_SIZES} className="my-course-card__cover-image" />
        )}
      </Link>

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
                <p className="my-course-card__figure">{`${progress.completedMinutes}/${progress.totalMinutes} minutos`}</p>
                <div className="my-course-card__track">
                  <div className="my-course-card__fill" style={{ width: `${progress.minutesPercent}%` }} />
                </div>
              </div>
            )}

            <div className="my-course-card__meter">
              <p className="my-course-card__figure">{`${progress.completedLessons}/${countLessons(progress.totalLessons)}`}</p>
              <div className="my-course-card__track">
                <div className="my-course-card__fill" style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </div>

          <div className="my-course-card__actions">
            {MOVE_TRAINER_ENABLED &&
              (course.reviewCount > 0 ? (
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
              ))}

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
