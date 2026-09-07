import Link from "next/link";
import { FormField, FormFieldset } from "@/components/common/form-field.comp";
import { ImageUpload } from "@/components/common/image-upload.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { CONTENT_ROLE, COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import {
  archiveCourse,
  createChapter,
  deleteChapter,
  manageCourseAuthors,
  publishCourse,
  reorderChapters,
  updateCourse,
} from "@/services/staff-courses/staff-courses.actions";
import type { AuthorAdminRow, CatalogOption, CourseAdminDetail } from "@/services/staff-courses/staff-courses.types";
import { SortableList } from "./sortable-list.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffTabs } from "./staff-tabs.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./course-editor.section.css";

/** Ata la portada, que vive en la columna de al lado, al formulario que guarda. */
const METADATA_FORM_ID = "course-metadata";

interface CourseEditorSectionProps {
  course: CourseAdminDetail;
  types: CatalogOption[];
  levels: CatalogOption[];
  authors: AuthorAdminRow[];
  authorRoles: CatalogOption[];
  /** Cuántas partidas tiene el curso; la lista vive en su propia pestaña. */
  gameCount: number;
  errorCode?: string;
}

/**
 * Edición del curso por tarjetas independientes (metadatos, capítulos, autores,
 * estado): cada una tiene su formulario y su action, en lugar de un formulario
 * gigante donde un fallo en un campo tira todo el trabajo.
 *
 * A la izquierda lo que se escribe y se ordena; a la derecha lo que se consulta
 * de reojo —portada, autores y estado—, que se toca una vez y se mira muchas.
 */
export function CourseEditorSection({
  course,
  types,
  levels,
  authors,
  authorRoles,
  gameCount,
  errorCode,
}: CourseEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const usedAuthorIds = new Set(course.authors.map((author) => author.authorId));
  const availableAuthors = authors.filter((author) => !usedAuthorIds.has(author.id));
  const isDraft = course.statusCode === COURSE_STATUS.DRAFT;
  const lessonCount = course.chapters.reduce((total, chapter) => total + chapter.lessonCount, 0);
  const hasIntro = course.chapters.some((chapter) => chapter.roleCode === CONTENT_ROLE.INTRO);
  const hasClosing = course.chapters.some((chapter) => chapter.roleCode === CONTENT_ROLE.CLOSING);

  return (
    <div className="course-editor">
      <StaffEditorHead
        crumbs={[{ label: "Cursos", href: staffRoutes.courses }]}
        title={course.name}
        badge={
          <span className={`course-editor__status course-editor__status_state_${course.statusCode.toLowerCase()}`}>
            {course.statusLabel}
          </span>
        }
        actions={
          course.statusCode === COURSE_STATUS.PUBLISHED && (
            <Link
              href={platformRoutes.courseDetail(course.id)}
              className="platform-button platform-button_variant_secondary"
            >
              Ver en la plataforma
            </Link>
          )
        }
      />

      <StaffTabs
        current={staffRoutes.courseDetail(course.id)}
        tabs={[
          { label: "Curso", href: staffRoutes.courseDetail(course.id) },
          { label: "Partidas", href: staffRoutes.courseGames(course.id), count: gameCount },
        ]}
      />

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffEditorLayout
        aside={
          <>
            <StaffPanel title="Portada">
              {/* Fuera del <form> de metadatos, atado a él por `form`: la
                  portada se gestiona entera aquí y se guarda con el resto. */}
              <ImageUpload
                name="cover"
                form={METADATA_FORM_ID}
                defaultValue={course.cover ?? undefined}
                label="Portada del curso"
                aspectRatio="21:9"
                hint="JPG, PNG, WebP o AVIF. Se guarda al pulsar «Guardar metadatos»."
              />
            </StaffPanel>

            <StaffPanel
              title="Autores"
              meta={`${course.authors.length}`}
            >
              {course.authors.length > 0 ? (
                <ul className="course-editor__list">
                  {course.authors.map((author, index) => (
                    <li key={author.authorId} className="course-editor__row">
                      <span className="course-editor__row-text">
                        <span className="course-editor__row-title">{author.authorName}</span>
                        <span className="course-editor__row-meta">{author.roleLabel}</span>
                      </span>

                      <div className="course-editor__controls">
                        <form action={manageCourseAuthors.bind(null, course.id)}>
                          <input type="hidden" name="operation" value="up" />
                          <input type="hidden" name="authorId" value={author.authorId} />
                          <button
                            type="submit"
                            className="course-editor__control"
                            aria-label="Subir autor"
                            disabled={index === 0}
                          >
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
                          <button
                            type="submit"
                            className="course-editor__control course-editor__control_variant_danger"
                          >
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
                <form className="course-editor__stack" action={manageCourseAuthors.bind(null, course.id)}>
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
            </StaffPanel>

            <StaffPanel title="Estado">
              <dl className="course-editor__facts">
                <div className="course-editor__fact">
                  <dt>Estado</dt>
                  <dd>{course.statusLabel}</dd>
                </div>
                <div className="course-editor__fact">
                  <dt>Publicado el</dt>
                  <dd>{course.publishedAtLabel ?? "—"}</dd>
                </div>
                <div className="course-editor__fact">
                  <dt>Contenido</dt>
                  <dd>
                    {course.chapters.length} cap. · {lessonCount} lecc.
                  </dd>
                </div>
              </dl>

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
                      Archivar curso
                    </button>
                  </form>
                )}
              </div>
            </StaffPanel>
          </>
        }
      >
        <StaffPanel title="Metadatos">
          <form id={METADATA_FORM_ID} className="course-editor__form" action={updateCourse.bind(null, course.id)}>
            <FormField label="Nombre">
              <input type="text" name="name" defaultValue={course.name} maxLength={160} required />
            </FormField>

            <div className="course-editor__pair">
              <FormField
                label="Identificador (slug)"
                hint="Minúsculas, números y guiones. Aparece en la URL del curso."
              >
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
            </div>


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

            <div className="course-editor__submit">
              <button type="submit" className="platform-button">
                Guardar metadatos
              </button>
            </div>
          </form>
        </StaffPanel>

        <StaffPanel
          title="Capítulos"
          meta={`${course.chapters.length} · ${lessonCount} lecciones`}
        >
          {/* Arrastrable: en un curso de cinco capítulos las flechas bastaban,
              pero mover el quinto al primer sitio eran cuatro viajes de ida y
              vuelta al servidor. El asa también responde a las flechas del
              teclado, que es la única forma de reordenar sin ratón. */}
          <SortableList
            items={course.chapters.map((chapter) => ({
              id: chapter.id,
              name: chapter.name,
              meta: `${chapter.lessonCount} lección${chapter.lessonCount === 1 ? "" : "es"}`,
              href: chapter.href,
              roleLabel: chapter.roleLabel,
              // Borrar sólo donde el servidor lo permitiría: curso en borrador
              // y sin progreso de ningún alumno.
              canDelete: isDraft && chapter.progressCount === 0,
            }))}
            onReorder={reorderChapters.bind(null, course.id)}
            deleteAction={deleteChapter.bind(null, course.id)}
            deleteFieldName="chapterId"
            noun="capítulo"
            emptyLabel="Este curso todavía no tiene capítulos."
          />

          <form className="course-editor__inline" action={createChapter.bind(null, course.id)}>
            <input
              type="text"
              name="name"
              maxLength={160}
              required
              className="course-editor__inline-input"
              placeholder="Nombre del nuevo capítulo"
              aria-label="Nombre del nuevo capítulo"
            />
            <button type="submit" className="platform-button platform-button_variant_secondary">
              Añadir capítulo
            </button>
          </form>

          {/* Los dos son opcionales y como mucho hay uno de cada, así que el
              botón desaparece en cuanto existe. El índice único de la base es
              quien lo garantiza de verdad. */}
          {(!hasIntro || !hasClosing) && (
            <div className="course-editor__roles">
              {!hasIntro && (
                <form action={createChapter.bind(null, course.id)}>
                  <input type="hidden" name="role" value={CONTENT_ROLE.INTRO} />
                  <input type="hidden" name="name" value="Introducción" />
                  <button type="submit" className="course-editor__role-button">
                    Añadir introducción
                  </button>
                </form>
              )}

              {!hasClosing && (
                <form action={createChapter.bind(null, course.id)}>
                  <input type="hidden" name="role" value={CONTENT_ROLE.CLOSING} />
                  <input type="hidden" name="name" value="Cierre" />
                  <button type="submit" className="course-editor__role-button">
                    Añadir cierre
                  </button>
                </form>
              )}
            </div>
          )}
        </StaffPanel>
      </StaffEditorLayout>
    </div>
  );
}
