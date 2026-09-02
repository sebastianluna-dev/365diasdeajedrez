import Image from "next/image";
import Link from "next/link";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import type { CourseSummary } from "@/services/courses/courses.types";
import "./course-card.comp.css";

interface CourseCardProps {
  course: CourseSummary;
}

/** Dos columnas dentro de un contenedor de 1320px; una sola por debajo de 900. */
const COVER_SIZES = "(max-width: 900px) 100vw, 640px";

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="course-card">
      {/* Mismo destino que el título de abajo, así que se saca del recorrido de
          teclado: un lector de pantalla no gana nada anunciando el enlace dos
          veces, y una portada sin texto no tendría cómo nombrarse. */}
      <Link href={course.href} className="course-card__cover" tabIndex={-1} aria-hidden="true">
        {course.cover && (
          <Image src={course.cover} alt="" fill sizes={COVER_SIZES} className="course-card__cover-image" />
        )}
      </Link>

      <div className="course-card__body">
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

        {course.authorNames.length > 0 && <p className="course-card__authors">Por {course.authorNames.join(", ")}</p>}

        <div className="course-card__progress">
          <ProgressIndicator
            layout="stacked"
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
        </div>
      </div>
    </article>
  );
}
