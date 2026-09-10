import Link from "next/link";
import { FormField, FormFieldset } from "@/components/platform/shared/form-field.comp";
import { ImageUpload } from "@/components/platform/shared/image-upload.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
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

/** Ties the cover, which lives in the column next door, to the form that saves. */
const METADATA_FORM_ID = "course-metadata";

interface CourseEditorSectionProps {
  course: CourseAdminDetail;
  types: CatalogOption[];
  levels: CatalogOption[];
  authors: AuthorAdminRow[];
  authorRoles: CatalogOption[];
  /** How many games the course has; the list lives in its own tab. */
  gameCount: number;
  errorCode?: string;
}

/**
 * Course editing in independent cards (metadata, chapters, authors, status):
 * each has its own form and its own action, instead of a giant form where a
 * failure in one field throws away all the work.
 *
 * On the left what is written and ordered; on the right what is glanced at
 * — cover, authors and status — which is touched once and looked at many times.
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
              {/* Outside the metadata <form>, tied to it through `form`: the cover
                  is managed entirely here and saved with the rest. */}
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
          {/* Draggable: in a five-chapter course the arrows were enough, but moving
              the fifth to the first place was four round trips to the server. The
              handle also responds to the keyboard arrows, which is the only way to
              reorder without a mouse. */}
          <SortableList
            items={course.chapters.map((chapter) => ({
              id: chapter.id,
              name: chapter.name,
              meta: `${chapter.lessonCount} lección${chapter.lessonCount === 1 ? "" : "es"}`,
              href: chapter.href,
              roleLabel: chapter.roleLabel,
              // Delete only where the server would allow it: draft course and no
              // progress from any student.
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

          {/* Both are optional and there is at most one of each, so the button
              disappears as soon as it exists. The database's unique index is what
              really guarantees it. */}
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
