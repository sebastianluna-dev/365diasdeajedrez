import Image from "next/image";
import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { mdButton, mdCard, mdChip } from "@/lib/material/material-classes";
import { countLessons, formatDuration } from "@/services/courses/course-rules";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import "./course-card.comp.css";

interface CourseCardProps {
  course: CourseSummary;
  /**
   * Adds the course to the student's (`addCourse` bound to its id), handed
   * down by the server section; a course already added, or a card drawn
   * without it (a story), has no «Agregar».
   */
  addAction?: () => Promise<void>;
}

/** Four to a row in the panel: a card is about 240px; two on a tablet, one on a phone. */
const COVER_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 280px";

/** «Intermedio», or the span «Principiante – Intermedio» of a course aimed at several. */
export function levelSpan(levels: CourseLevelItem[]): string | undefined {
  const [first] = levels;
  const last = levels[levels.length - 1];
  if (!first || !last) return undefined;
  return first === last ? first.name : `${first.name} – ${last.name}`;
}

/**
 * A course in the catalog as Material's outlined card (2026-10-22, the new
 * design system; before it, «K2a» of 2026-10-07): its cover; its name; under
 * it who it is for and what it teaches, in one line; and at the foot what can
 * be done with it. A course the student already has says «Lo llevas» (an
 * assist chip) and goes on with «Continuar»; one they have not says how long
 * it is and is added right there with «Agregar» (Material's tonal button),
 * which takes them to the course. No description: that is the course's page.
 *
 * The whole card is the link, through the title's: its `::after` covers the
 * card. A course the student added leads to the course; one they have not, to
 * its information page, for whoever wants to read about it before adding it.
 */
export function CourseCard({ course, addAction }: CourseCardProps) {
  const span = levelSpan(course.levels);
  const { progress } = course;
  const image = course.cover ?? course.thumbnail;
  const about = [span, ...course.contentTypes.map((contentType) => contentType.shortLabel)].filter(Boolean).join(" · ");
  const length = `${countLessons(progress.totalLessons)}${progress.totalMinutes > 0 ? ` · ${formatDuration(progress.totalMinutes)}` : ""}`;

  return (
    <article className={`${mdCard("outlined")} course-card`}>
      <div className="course-card__cover">
        {image && <Image src={image} alt="" fill sizes={COVER_SIZES} className="course-card__cover-image" />}
      </div>

      <div className="course-card__body">
        <div>
          <h2 className="course-card__name">
            <Link href={course.isAdded ? course.href : course.infoHref} className="course-card__link">
              {course.name}
            </Link>
          </h2>
          {about && <p className="course-card__about">{about}</p>}
        </div>

        <div className="course-card__foot">
          {course.isAdded ? (
            <>
              <span className={`${mdChip("assist")} course-card__owned`}>
                <CircleCheckIcon variant="classic-solid" className="platform-md-icon" />
                Lo llevas
              </span>
              <Link href={course.continueHref} className={`${mdButton("text", "sm")} course-card__action`}>
                {course.ctaLabel}
              </Link>
            </>
          ) : (
            <>
              <span className="course-card__length">{length}</span>
              {addAction && (
                <form action={addAction} className="course-card__action">
                  <button type="submit" className={mdButton("tonal", "sm")} aria-label={`Agregar ${course.name}`}>
                    <PlusIcon variant="classic-solid" className="platform-md-icon" />
                    Agregar
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
