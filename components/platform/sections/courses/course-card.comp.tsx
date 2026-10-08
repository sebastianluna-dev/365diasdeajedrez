import Image from "next/image";
import Link from "next/link";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { SignalIcon } from "@/components/icons/signal-icon.comp";
import { countLessons, formatDuration } from "@/services/courses/course-rules";
import type { CourseLevelItem, CourseSummary } from "@/services/courses/courses.types";
import "./course-card.comp.css";

interface CourseCardProps {
  course: CourseSummary;
}

/** Three columns beside the filters in the wide page: a card is about 320px; one on a phone. */
const COVER_SIZES = "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 320px";

/** «Intermedio», or the span «Principiante – Intermedio» of a course aimed at several. */
export function levelSpan(levels: CourseLevelItem[]): string | undefined {
  const [first] = levels;
  const last = levels[levels.length - 1];
  if (!first || !last) return undefined;
  return first === last ? first.name : `${first.name} – ${last.name}`;
}

/**
 * A course in the catalog, compact (2026-10-07, «K2a», the owner's choice
 * among two rounds of variants): its cover; its name; under it its labels —
 * who it is for, its level or span of levels, and what it teaches, one label
 * per topic —; and how long it is. No description: that is the course's
 * page, which the card leads to.
 *
 * It replaced a card with the description, the levels as dots and the
 * progress at the foot: the catalog is for choosing, and «Mis cursos» is
 * where the progress is.
 *
 * The whole card is the link, through the title's: its `::after` covers the
 * card. A course the student added leads to the course; one they have not, to
 * its information page, which is where it is added.
 */
export function CourseCard({ course }: CourseCardProps) {
  const span = levelSpan(course.levels);
  const { progress } = course;
  const image = course.cover ?? course.thumbnail;

  return (
    <article className="course-card">
      <div className="course-card__cover">
        {image && <Image src={image} alt="" fill sizes={COVER_SIZES} className="course-card__cover-image" />}
      </div>

      <div className="course-card__body">
        <h2 className="course-card__name">
          <Link href={course.isAdded ? course.href : course.infoHref} className="course-card__link">
            {course.name}
          </Link>
        </h2>

        {(span || course.contentTypes.length > 0) && (
          <ul className="course-card__labels" aria-label="Nivel y temas">
            {span && (
              <li className="course-card__label">
                <SignalIcon variant="classic-solid" className="course-card__label-icon" />
                {span}
              </li>
            )}
            {course.contentTypes.map((contentType) => (
              <li key={contentType.code} className="course-card__label">
                <BookOpenIcon variant="classic-solid" className="course-card__label-icon" />
                {contentType.label}
              </li>
            ))}
          </ul>
        )}

        <p className="course-card__length">
          {countLessons(progress.totalLessons)}
          {progress.totalMinutes > 0 && ` · ${formatDuration(progress.totalMinutes)}`}
        </p>
      </div>
    </article>
  );
}
