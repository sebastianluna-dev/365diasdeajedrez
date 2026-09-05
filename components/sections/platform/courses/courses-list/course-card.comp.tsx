import Image from "next/image";
import Link from "next/link";
import type { CourseSummary } from "@/services/courses/courses.types";
import "./course-card.comp.css";

interface CourseCardProps {
  course: CourseSummary;
}

/** Una sola columna de ~1000px; la portada mide poco más de 300 en pantallas densas. */
const COVER_SIZES = "(max-width: 720px) 100vw, 340px";

/** «0/2 lecciones» con su barra: el avance en la unidad que dice la etiqueta. */
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
 * Un curso en «Mis cursos»: portada, nombre y las dos medidas del avance
 * —lecciones y minutos—, con el botón que lleva donde lo dejó.
 *
 * La descripción, el nivel y los autores viven en el menú «···» y no en la
 * tarjeta. La lista es para RETOMAR un curso, no para elegirlo: quien ya está
 * matriculado sabe de qué va, y el texto de presentación empujaba hacia abajo
 * justo lo que se viene a mirar. Sigue estando a un clic, y entero, en la ficha.
 */
export function CourseCard({ course }: CourseCardProps) {
  const { progress } = course;

  return (
    <article className="course-card">
      {/* Mismo destino que el título, así que se saca del recorrido de teclado:
          un lector de pantalla no gana nada anunciando el enlace dos veces, y
          una portada sin texto no tendría cómo nombrarse. */}
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

        {/* `<details>` y no un menú de JavaScript: son tres datos y un enlace, y
            así se abre y se cierra sin hidratar nada. */}
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
