import Image from "next/image";
import Link from "next/link";
import { FormField, FormFieldset } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { isDisplayableImage } from "@/lib/remote-image";
import {
  archiveCourse,
  createChapter,
  deleteChapter,
  manageCourseAuthors,
  publishCourse,
  reorderChapters,
  updateCourse,
} from "@/services/staff-courses/staff-courses.actions";
import type {
  AuthorAdminRow,
  CatalogOption,
  CourseAdminDetail,
  CourseGameRow,
} from "@/services/staff-courses/staff-courses.types";
import { SortableList } from "./sortable-list.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./course-editor.section.css";

interface CourseEditorSectionProps {
  course: CourseAdminDetail;
  types: CatalogOption[];
  levels: CatalogOption[];
  authors: AuthorAdminRow[];
  authorRoles: CatalogOption[];
  /** La colección de partidas del curso. */
  games: CourseGameRow[];
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
  games,
  errorCode,
}: CourseEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const usedAuthorIds = new Set(course.authors.map((author) => author.authorId));
  const availableAuthors = authors.filter((author) => !usedAuthorIds.has(author.id));
  const isDraft = course.statusCode === COURSE_STATUS.DRAFT;
  const lessonCount = course.chapters.reduce((total, chapter) => total + chapter.lessonCount, 0);

  return (
    <div className="course-editor">
      <StaffEditorHead
        crumbs={[{ label: "Cursos", href: staffRoutes.courses }]}
        title={course.name}
        meta={
          <>
            <span className={`course-editor__status course-editor__status_state_${course.statusCode.toLowerCase()}`}>
              {course.statusLabel}
            </span>
            <span className="course-editor__slug">{course.slug}</span>
            {course.publishedAtLabel && <span>Publicado el {course.publishedAtLabel}</span>}
          </>
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

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffEditorLayout
        aside={
          <>
            <StaffPanel title="Portada">
              <div className="course-editor__cover">
                {isDisplayableImage(course.cover) ? (
                  <Image
                    src={course.cover}
                    alt=""
                    fill
                    sizes="300px"
                    className="course-editor__cover-image"
                  />
                ) : (
                  <span className="course-editor__cover-empty">
                    {course.cover ? "La portada no es de Cloudinary" : "Sin portada"}
                  </span>
                )}
              </div>
              <p className="course-editor__hint">
                Se cambia en «Metadatos», con la URL de la imagen en Cloudinary.
              </p>
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
          <form className="course-editor__form" action={updateCourse.bind(null, course.id)}>
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

            <div className="course-editor__submit">
              <button type="submit" className="platform-button">
                Guardar metadatos
              </button>
            </div>
          </form>
        </StaffPanel>

        <StaffPanel
          title="Partidas del curso"
          meta={`${games.length}`}
          description="Todas las de sus capítulos, de una vez. Se añaden y se quitan desde el capítulo al que pertenecen: una partida sin capítulo no tendría colección a la que ir."
        >
          {games.length > 0 ? (
            <ul className="course-editor__list">
              {games.map((game) => (
                <li key={game.id} className="course-editor__row">
                  <span className="course-editor__row-text">
                    <span className="course-editor__row-title">{game.title}</span>
                    <span className="course-editor__row-meta">
                      {game.chapterName && `${game.chapterName} · `}
                      {game.detail}
                      {game.detail && " · "}
                      {game.moveCount} jugadas
                      {game.lessonCount > 0 &&
                        ` · en ${game.lessonCount} ${game.lessonCount === 1 ? "lección" : "lecciones"}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="course-editor__empty">
              Ningún capítulo tiene partidas todavía. Se pegan desde el capítulo: sus lecciones sólo pueden
              usar partidas de su propia colección.
            </p>
          )}
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
        </StaffPanel>
      </StaffEditorLayout>
    </div>
  );
}
