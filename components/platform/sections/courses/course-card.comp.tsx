import Image from "next/image";
import Link from "next/link";
import { countLessons, formatDuration } from "@/services/courses/course-rules";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import { LevelDots } from "./level-dots.comp";
import "./course-card.comp.css";

interface CourseCardProps {
  course: CourseSummary;
  /** Every level of the catalog, for the dots that say who the course is for. */
  levels: CourseLevelItem[];
}

/** Three columns at most in a 1200px page: a card is little over 380px wide. */
const COVER_SIZES = "(max-width: 760px) 100vw, 400px";

/**
 * A course as a card: its cover, its name with the dots of its levels, what
 * it is about, what it teaches and who signs it, and at the foot where the
 * student is in it.
 *
 * The same card serves "Mis cursos" and the catalog, and it is the course
 * that says which it is: one the student added shows their progress and leads
 * to the course to study; one they have not shows how long it is and leads to
 * its information page, which is where it is added.
 *
 * The whole card is the link, through the title's: its `::after` covers the
 * card, so there is one link to announce and not a link around another. The
 * dots sit above it, because they open a tip of their own.
 */
export function CourseCard({ course, levels }: CourseCardProps) {
  const { progress } = course;
  const isUnderway = course.isAdded && course.ctaLabel === "Continuar";
  const isDone = course.isAdded && course.ctaLabel === "Repasar";

  return (
    <article className="course-card">
      <div className="course-card__cover">
        {course.cover && (
          <Image src={course.cover} alt="" fill sizes={COVER_SIZES} className="course-card__cover-image" />
        )}
      </div>

      <div className="course-card__body">
        <div className="course-card__heading">
          <h2 className="course-card__name">
            <Link href={course.isAdded ? course.href : course.infoHref} className="course-card__link">
              {course.name}
            </Link>
          </h2>
          {course.levels.length > 0 && (
            <span className="course-card__levels">
              <LevelDots scale={levels} levels={course.levels} />
            </span>
          )}
        </div>

        {course.description && <p className="course-card__description">{course.description}</p>}

        {(course.contentTypes.length > 0 || course.authorNames.length > 0) && (
          <p className="course-card__facts">
            <span className="course-card__contents">
              {course.contentTypes.map((contentType) => contentType.label).join(" · ")}
            </span>
            {course.authorNames.length > 0 && (
              <span className="course-card__by">
                por <span className="course-card__author">{course.authorNames.join(", ")}</span>
              </span>
            )}
          </p>
        )}

        <div className="course-card__foot">
          {course.isAdded ? (
            <div className="course-card__progress">
              <p className="course-card__progress-line">
                <span className="course-card__percent">{progress.percent}%</span>
                <span className="course-card__ratio">
                  {progress.completedLessons} de {countLessons(progress.totalLessons)}
                </span>
              </p>
              <div className="course-card__track">
                <div
                  className={`course-card__fill${isDone ? " course-card__fill_state_done" : ""}`}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="course-card__length">
              {countLessons(progress.totalLessons)}
              {progress.totalMinutes > 0 && ` · ${formatDuration(progress.totalMinutes)}`}
            </p>
          )}

          {/* Not a link of its own: it is the card's, which the title names. */}
          <span
            className={`course-card__cta${isUnderway ? " course-card__cta_emphasis_strong" : ""}`}
            aria-hidden="true"
          >
            {course.isAdded ? course.ctaLabel : "Ver curso"}
          </span>
        </div>
      </div>
    </article>
  );
}
