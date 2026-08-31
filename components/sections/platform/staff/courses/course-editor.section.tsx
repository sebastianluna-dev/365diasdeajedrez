import Link from "next/link";
import { FormField, FormFieldset } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import {
  archiveCourse,
  createChapter,
  deleteChapter,
  manageCourseAuthors,
  moveChapter,
  publishCourse,
  updateCourse,
} from "@/services/staff-courses/staff-courses.actions";
import type { AuthorAdminRow, CatalogOption, CourseAdminDetail } from "@/services/staff-courses/staff-courses.types";
import "./course-editor.section.css";

interface CourseEditorSectionProps {
  course: CourseAdminDetail;
  types: CatalogOption[];
  levels: CatalogOption[];
  authors: AuthorAdminRow[];
  authorRoles: CatalogOption[];
  errorCode?: string;
}

/**
 * Edición del curso por tarjetas independientes (metadatos, autores, estado,
 * capítulos): cada una tiene su formulario y su action, en lugar de un
 * formulario gigante donde un fallo en un campo tira todo el trabajo.
 */
export function CourseEditorSection({
  course,
  types,
  levels,
  authors,
  authorRoles,
  errorCode,
}: CourseEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const usedAuthorIds = new Set(course.authors.map((author) => author.authorId));
  const availableAuthors = authors.filter((author) => !usedAuthorIds.has(author.id));

  return (
    <div className="course-editor">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="platform-card">
        <h2 className="platform-card__title">Metadatos</h2>

        <form className="course-editor__form" action={updateCourse.bind(null, course.id)}>
          <FormField label="Nombre">
            <input type="text" name="name" defaultValue={course.name} maxLength={160} required />
          </FormField>

          <FormField label="Identificador (slug)" hint="Minúsculas, números y guiones. Aparece en la URL del curso.">
            <input
              type="text"
              name="slug"
              defaultValue={course.slug}
              maxLength={160}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
            />
          </FormField>

          <FormField label="Tipo">
            <select name="typeCode" defaultValue={course.typeCode}>
              {types.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Portada (URL, opcional)">
            <input type="url" name="cover" defaultValue={course.cover ?? ""} maxLength={500} />
          </FormField>

          <FormField label="Descripción (opcional)">
            <textarea name="description" defaultValue={course.description ?? ""} maxLength={1000} />
          </FormField>

          <FormFieldset legend="Niveles">
            {levels.map((level) => (
              <label key={level.code}>
                <input
                  type="checkbox"
                  name="levelCodes"
                  value={level.code}
                  defaultChecked={course.levelCodes.includes(level.code)}
                />
                {level.label}
              </label>
            ))}
          </FormFieldset>

          <button type="submit" className="platform-button">
            Guardar metadatos
          </button>
        </form>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Autores</h2>

        {course.authors.length > 0 ? (
          <ul className="course-editor__list">
            {course.authors.map((author, index) => (
              <li key={author.authorId} className="course-editor__row">
                <span className="course-editor__row-title">{author.authorName}</span>
                <span className="course-editor__row-meta">{author.roleLabel}</span>

                <div className="course-editor__controls">
                  <form action={manageCourseAuthors.bind(null, course.id)}>
                    <input type="hidden" name="operation" value="up" />
                    <input type="hidden" name="authorId" value={author.authorId} />
                    <button type="submit" className="course-editor__control" aria-label="Subir autor" disabled={index === 0}>
                      ↑
                    </button>
                  </form>
                  <form action={manageCourseAuthors.bind(null, course.id)}>
                    <input type="hidden" name="operation" value="down" />
                    <input type="hidden" name="authorId" value={author.authorId} />
                    <button
                      type="submit"
                      className="course-editor__control"
                      aria-label="Bajar autor"
                      disabled={index === course.authors.length - 1}
                    >
                      ↓
                    </button>
                  </form>
                  <form action={manageCourseAuthors.bind(null, course.id)}>
                    <input type="hidden" name="operation" value="remove" />
                    <input type="hidden" name="authorId" value={author.authorId} />
                    <button type="submit" className="course-editor__control course-editor__control_variant_danger">
                      Quitar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="course-editor__empty">Este curso todavía no tiene autores.</p>
        )}

        {availableAuthors.length > 0 && (
          <form className="course-editor__inline" action={manageCourseAuthors.bind(null, course.id)}>
            <input type="hidden" name="operation" value="add" />

            <FormField label="Añadir autor">
              <select name="authorId" required defaultValue="">
                <option value="" disabled>
                  Elige un autor…
                </option>
                {availableAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Rol">
              <select name="roleCode" defaultValue={authorRoles[0]?.code}>
                {authorRoles.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.label}
                  </option>
                ))}
              </select>
            </FormField>

            <button type="submit" className="platform-button platform-button_variant_secondary">
              Añadir
            </button>
          </form>
        )}
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Estado</h2>
        <p className="course-editor__empty">
          Estado actual: <strong>{course.statusLabel}</strong>
          {course.publishedAtLabel ? ` · publicado el ${course.publishedAtLabel}` : ""}
        </p>

        {!course.canPublish && (
          <PlatformNotice
            variant="info"
            message="Para publicar, el curso necesita al menos un capítulo con una lección que tenga PGN."
          />
        )}

        <div className="course-editor__actions">
          {course.statusCode !== COURSE_STATUS.PUBLISHED && (
            <form action={publishCourse.bind(null, course.id)}>
              <button type="submit" className="platform-button" disabled={!course.canPublish}>
                Publicar
              </button>
            </form>
          )}

          {course.statusCode !== COURSE_STATUS.ARCHIVED && (
            <form action={archiveCourse.bind(null, course.id)}>
              <button type="submit" className="platform-button platform-button_variant_secondary">
                Archivar
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Capítulos</h2>

        {course.chapters.length > 0 ? (
          <ul className="course-editor__list">
            {course.chapters.map((chapter, index) => (
              <li key={chapter.id} className="course-editor__row">
                <Link href={chapter.href} className="course-editor__row-title course-editor__row-title_link">
                  {chapter.order}. {chapter.name}
                </Link>
                <span className="course-editor__row-meta">
                  {chapter.lessonCount} lección{chapter.lessonCount === 1 ? "" : "es"}
                </span>

                <div className="course-editor__controls">
                  <form action={moveChapter.bind(null, course.id)}>
                    <input type="hidden" name="chapterId" value={chapter.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button type="submit" className="course-editor__control" aria-label="Subir capítulo" disabled={index === 0}>
                      ↑
                    </button>
                  </form>
                  <form action={moveChapter.bind(null, course.id)}>
                    <input type="hidden" name="chapterId" value={chapter.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="course-editor__control"
                      aria-label="Bajar capítulo"
                      disabled={index === course.chapters.length - 1}
                    >
                      ↓
                    </button>
                  </form>

                  {/* Sólo se ofrece borrar donde el servidor lo permitiría:
                      borrador y sin progreso de ningún alumno. */}
                  {course.statusCode === COURSE_STATUS.DRAFT && chapter.progressCount === 0 && (
                    <form action={deleteChapter.bind(null, course.id)}>
                      <input type="hidden" name="chapterId" value={chapter.id} />
                      <button type="submit" className="course-editor__control course-editor__control_variant_danger">
                        Eliminar
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="course-editor__empty">Este curso todavía no tiene capítulos.</p>
        )}

        <form className="course-editor__inline" action={createChapter.bind(null, course.id)}>
          <FormField label="Nuevo capítulo">
            <input type="text" name="name" maxLength={160} required placeholder="Nombre del capítulo" />
          </FormField>
          <button type="submit" className="platform-button platform-button_variant_secondary">
            Añadir capítulo
          </button>
        </form>
      </section>
    </div>
  );
}
