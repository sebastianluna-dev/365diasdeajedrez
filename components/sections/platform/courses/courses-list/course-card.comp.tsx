import Link from "next/link";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import type { CourseSummary } from "@/services/courses/courses.types";
import "./course-card.comp.css";

interface CourseCardProps {
  course: CourseSummary;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="platform-card course-card">
      <div className="course-card__tags">
        <span className="platform-tag platform-tag_variant_accent">{course.typeLabel}</span>
        {course.levelLabels.map((level) => (
          <span key={level} className="platform-tag">
            {level}
          </span>
        ))}
      </div>

      <h2 className="course-card__name">
        <Link href={course.href} className="course-card__name-link">
          {course.name}
        </Link>
      </h2>

      {course.description && <p className="course-card__description">{course.description}</p>}

      {course.authorNames.length > 0 && (
        <p className="course-card__authors">Por {course.authorNames.join(", ")}</p>
      )}

      <ProgressIndicator
        percent={course.progress.percent}
        detail={`${course.progress.completedLessons} de ${course.progress.totalLessons} lecciones`}
      />

      <div className="course-card__actions">
        <Link href={course.continueHref} className="platform-button">
          {course.ctaLabel}
        </Link>
        <Link href={course.href} className="platform-button platform-button_variant_secondary">
          Ver curso
        </Link>
      </div>
    </article>
  );
}
