import Link from "next/link";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import type { CourseDetail } from "@/services/courses/courses.types";
import { ChapterList } from "./chapter-list.comp";
import "./course-detail.section.css";

interface CourseDetailSectionProps {
  course: CourseDetail;
}

export function CourseDetailSection({ course }: CourseDetailSectionProps) {
  return (
    <section className="course-detail">
      <header className="course-detail__head">
        <div className="course-detail__tags">
          <span className="platform-tag platform-tag_variant_accent">{course.typeLabel}</span>
          {course.levelLabels.map((level) => (
            <span key={level} className="platform-tag">
              {level}
            </span>
          ))}
        </div>

        <h1 className="platform-page__title">{course.name}</h1>
        {course.description && <p className="platform-page__subtitle">{course.description}</p>}

        {course.authors.length > 0 && (
          <p className="course-detail__authors">
            {course.authors.map((author) => `${author.name} (${author.roleLabel})`).join(" · ")}
          </p>
        )}

        <div className="course-detail__progress">
          <ProgressIndicator
            percent={course.progress.percent}
            detail={`${course.progress.completedLessons} de ${course.progress.totalLessons} lecciones completadas`}
          />
        </div>

        <Link href={course.continueHref} className="platform-button course-detail__cta">
          {course.ctaLabel === "Comenzar" ? "Comenzar curso" : `${course.ctaLabel} curso`}
        </Link>
      </header>

      <h2 className="course-detail__chapters-title">Capítulos</h2>
      <ChapterList chapters={course.chapters} />
    </section>
  );
}
