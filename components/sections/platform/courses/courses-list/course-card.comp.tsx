import Image from "next/image";
import Link from "next/link";
import type { CourseSummary } from "@/services/courses/courses.types";
import "./course-card.comp.css";

interface CourseCardProps {
  course: CourseSummary;
}

/** A single ~1000px column; the cover measures little over 300 on dense screens. */
const COVER_SIZES = "(max-width: 720px) 100vw, 340px";

/** "0/2 lecciones" with its bar: the progress in the unit the label states. */
function Meter({ done, total, unit }: { done: number; total: number; unit: string }) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100));

  return (
    <div className="course-card__meter">
      <span className="course-card__meter-label">
        {done}/{total} {unit}
      </span>
      <div className="course-card__meter-track">
        <div className="course-card__meter-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/**
 * A course in "Mis cursos": cover, name and the two progress measures
 * — lessons and minutes — with the button that takes you where you left off.
 *
 * The description, the level and the authors live in the "···" menu and not
 * in the card. The list is for RESUMING a course, not for choosing one:
 * whoever is already enrolled knows what it is about, and the introduction
 * text pushed down exactly what one comes to look at. It is still one click
 * away, and in full, on the course page.
 */
export function CourseCard({ course }: CourseCardProps) {
  const { progress } = course;

  return (
    <article className="course-card">
      {/* Same destination as the title, so it is taken out of the tab order: a
          screen reader gains nothing by announcing the link twice, and a cover
          without text would have no way to name itself. */}
      <Link href={course.href} className="course-card__cover" tabIndex={-1} aria-hidden="true">
        {course.cover && (
          <Image src={course.cover} alt="" fill sizes={COVER_SIZES} className="course-card__cover-image" />
        )}
      </Link>

      <div className="course-card__body">
        <div className="course-card__heading">
          <h2 className="course-card__name">
            <Link href={course.href} className="course-card__name-link">
              {course.name}
            </Link>
          </h2>
          <span className="platform-tag platform-tag_variant_accent">{course.typeLabel}</span>
        </div>

        <div className="course-card__meters">
          <Meter
            done={progress.completedLessons}
            total={progress.totalLessons}
            unit={progress.totalLessons === 1 ? "lección" : "lecciones"}
          />
          <Meter done={progress.completedMinutes} total={progress.totalMinutes} unit="minutos" />
        </div>
      </div>

      <div className="course-card__actions">
        <Link href={course.continueHref} className="platform-button course-card__cta">
          {course.ctaLabel}
        </Link>

        {/* `<details>` and not a JavaScript menu: it is three facts and a link, and
            this way it opens and closes without hydrating anything. */}
        <details className="course-card__menu">
          <summary className="course-card__menu-button" aria-label={`Más sobre ${course.name}`}>
            <span aria-hidden="true">···</span>
          </summary>

          <div className="course-card__menu-panel">
            {course.description && <p className="course-card__menu-text">{course.description}</p>}

            {course.levelLabels.length > 0 && (
              <p className="course-card__menu-meta">{course.levelLabels.join(" · ")}</p>
            )}

            {course.authorNames.length > 0 && (
              <p className="course-card__menu-meta">Por {course.authorNames.join(", ")}</p>
            )}

            <Link href={course.href} className="course-card__menu-link">
              Ver curso
            </Link>
          </div>
        </details>
      </div>
    </article>
  );
}
