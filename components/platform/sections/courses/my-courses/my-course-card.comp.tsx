import Image from "next/image";
import Link from "next/link";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { countLessons } from "@/services/courses/course-rules";
import type { MyCourseItem } from "@/services/courses/courses.types";
import "./my-course-card.comp.css";

interface MyCourseCardProps {
  course: MyCourseItem;
}

/** A square at the card's side, and the full width on a phone. */
const COVER_SIZES = "(max-width: 760px) 100vw, 96px";

/** The gauge is drawn on a 36-unit box; the radius leaves room for its stroke. */
const GAUGE_RADIUS = 15;
const GAUGE_LENGTH = 2 * Math.PI * GAUGE_RADIUS;

/**
 * A course of the student's, as a row: its square image, its name, how far
 * they are in it — in one line of text, with the percentage on a ring — and
 * the two things to do with it, «Repasar» and «Aprender».
 *
 * It is the course they already chose, so it says nothing of what the course
 * is — no description, no levels, no content types: that is the catalog's
 * card, `CourseCard`. What it is for is the progress.
 *
 * **The progress is a ring and a sentence, not two bars.** A bar has to be
 * measured by eye, and there were two of them to measure on every row; the
 * ring gives the figure one actually wants and the two counts are read as a
 * line of text. It is the same ring the chapter carries in the column beside
 * a lesson, so the two agree.
 *
 * The card is NOT a link. What leads to the course is its cover and its
 * name, and each button leads where it says: a row with three destinations
 * cannot be one target. The cover's link is left out of the tab order and
 * of the accessibility tree — it has no name of its own and the title's,
 * next to it, leads to the same place.
 *
 * A button that leads nowhere keeps its place, switched off, so the rows of
 * the list line up: «Repasar» with nothing learned to review, «Aprender»
 * in a course without lessons. A FINISHED course does not switch «Aprender»
 * off — it starts the course over.
 *
 * «Repasar» is the Move Trainer's: while that is off (`MOVE_TRAINER_ENABLED`)
 * the button is not drawn at all, and «Aprender» is the row's one button.
 */
export function MyCourseCard({ course }: MyCourseCardProps) {
  const { progress } = course;

  return (
    <article className="my-course-card">
      <Link href={course.href} className="my-course-card__cover" aria-hidden="true" tabIndex={-1}>
        {course.thumbnail && (
          <Image src={course.thumbnail} alt="" fill sizes={COVER_SIZES} className="my-course-card__cover-image" />
        )}
      </Link>

      <div className="my-course-card__body">
        <h2 className="my-course-card__name">
          <Link href={course.href} className="my-course-card__link">
            {course.name}
          </Link>
        </h2>

        {/* The two measures as one line: they are different measures of the
            same progress, and a course whose lessons say no minutes is
            measured in lessons alone. */}
        <p className="my-course-card__figures">
          <span>
            {progress.completedLessons} de {countLessons(progress.totalLessons)}
          </span>
          {progress.totalMinutes > 0 && (
            <>
              <span className="my-course-card__dot" aria-hidden="true">
                ·
              </span>
              <span>
                {progress.completedMinutes}/{progress.totalMinutes} minutos
              </span>
            </>
          )}
        </p>
      </div>

      {/* How far the course has gone, on the ring. The arc is drawn by holding
          back part of the circle's own length; at 0% only the track is
          drawn. */}
      <span className="my-course-card__gauge">
        <svg className="my-course-card__ring" viewBox="0 0 36 36" aria-hidden="true">
          <circle className="my-course-card__ring-track" cx="18" cy="18" r={GAUGE_RADIUS} />
          {progress.percent > 0 && (
            <circle
              className="my-course-card__ring-fill"
              cx="18"
              cy="18"
              r={GAUGE_RADIUS}
              style={{ strokeDasharray: GAUGE_LENGTH, strokeDashoffset: GAUGE_LENGTH * (1 - progress.percent / 100) }}
            />
          )}
        </svg>
        <span className="my-course-card__percent">{progress.percent}%</span>
      </span>

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

        {/* The platform's quiet button, the one «Ver detalle» uses on the
            dashboard: the card only gives it its size. */}
        {course.learnHref ? (
          <Link
            href={course.learnHref}
            className="platform-button my-course-card__learn"
          >
            Aprender
          </Link>
        ) : (
          <span
            className="platform-button my-course-card__learn my-course-card__learn_state_off"
            aria-disabled="true"
          >
            Aprender
          </span>
        )}
      </div>
    </article>
  );
}
