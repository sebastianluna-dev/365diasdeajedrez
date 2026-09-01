import Link from "next/link";
import { FormField } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { staffRoutes } from "@/lib/platform-routes";
import { createLesson, deleteLesson, moveLesson, updateChapter } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail } from "@/services/staff-courses/staff-courses.types";
import "./chapter-editor.section.css";

interface ChapterEditorSectionProps {
  chapter: ChapterAdminDetail;
  errorCode?: string;
}

export function ChapterEditorSection({ chapter, errorCode }: ChapterEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const isDraft = chapter.courseStatusCode === COURSE_STATUS.DRAFT;

  return (
    <div className="chapter-editor">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <p className="chapter-editor__breadcrumb">
        <Link href={staffRoutes.courses}>Cursos</Link>
        {" › "}
        <Link href={staffRoutes.courseDetail(chapter.courseId)}>{chapter.courseName}</Link>
      </p>

      <section className="platform-card">
        <h2 className="platform-card__title">Metadatos del capítulo</h2>

        <form className="chapter-editor__form" action={updateChapter.bind(null, chapter.courseId, chapter.id)}>
          <FormField label="Nombre">
            <input type="text" name="name" defaultValue={chapter.name} maxLength={160} required />
          </FormField>

          <FormField
            label="Identificador en la URL (slug)"
            hint="Lo que verá el alumno en la dirección. Si lo dejas vacío se deriva del nombre; sólo tiene que ser único dentro de este curso."
          >
            <input
              type="text"
              name="slug"
              defaultValue={chapter.slug}
              maxLength={160}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
            />
          </FormField>

          <FormField label="Descripción (opcional)">
            <textarea name="description" defaultValue={chapter.description ?? ""} maxLength={1000} />
          </FormField>

          <FormField label="Duración estimada (minutos, opcional)">
            <input type="number" name="estimatedDuration" min={0} defaultValue={chapter.estimatedDuration ?? ""} />
          </FormField>

          <button type="submit" className="platform-button">
            Guardar
          </button>
        </form>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Lecciones</h2>

        {chapter.lessons.length > 0 ? (
          <ul className="chapter-editor__list">
            {chapter.lessons.map((lesson, index) => (
              <li key={lesson.id} className="chapter-editor__row">
                <Link href={lesson.href} className="chapter-editor__row-title">
                  {lesson.order}. {lesson.name}
                </Link>

                <span className="chapter-editor__row-meta">
                  {lesson.hasPgn ? "Con PGN" : "Sin PGN"} · {lesson.exerciseCount} ejercicio
                  {lesson.exerciseCount === 1 ? "" : "s"}
                </span>
                {lesson.isPriority && <span className="platform-tag platform-tag_variant_accent">Prioritaria</span>}

                <div className="chapter-editor__controls">
                  <form action={moveLesson.bind(null, chapter.courseId, chapter.id)}>
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" className="chapter-editor__control" aria-label="Subir lección" disabled={index === 0}>
                      ↑
                    </button>
                  </form>
                  <form action={moveLesson.bind(null, chapter.courseId, chapter.id)}>
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="chapter-editor__control"
                      aria-label="Bajar lección"
                      disabled={index === chapter.lessons.length - 1}
                    >
                      ↓
                    </button>
                  </form>

                  {/* Borrar sólo donde el servidor lo permitiría: curso en
                      borrador y sin progreso de ningún alumno. */}
                  {isDraft && lesson.progressCount === 0 && (
                    <form action={deleteLesson.bind(null, chapter.courseId, chapter.id)}>
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <button type="submit" className="chapter-editor__control chapter-editor__control_variant_danger">
                        Eliminar
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="chapter-editor__empty">Este capítulo todavía no tiene lecciones.</p>
        )}

        <form className="chapter-editor__inline" action={createLesson.bind(null, chapter.courseId, chapter.id)}>
          <FormField label="Nueva lección" hint="Sólo el nombre; el resto se edita dentro.">
            <input type="text" name="name" maxLength={160} required placeholder="Nombre de la lección" />
          </FormField>
          <button type="submit" className="platform-button platform-button_variant_secondary">
            Añadir lección
          </button>
        </form>
      </section>
    </div>
  );
}
