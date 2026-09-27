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
import type {
  AuthorAdminRow,
  CatalogOption,
  ContentTypeOption,
  CourseAdminDetail,
} from "@/services/staff-courses/staff-courses.types";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { shortEloRange } from "@/services/courses/level-rules";
import type { LevelOption } from "@/services/staff-levels/staff-levels.types";
import type { SourceEntityOption } from "@/services/staff-sources/staff-sources.types";
import { AuthorsManager } from "./authors-manager/authors-manager.comp";
import { CourseNameFields } from "./course-name-fields.comp";
import { CourseSources } from "./course-sources/course-sources.comp";
import { SortableList } from "./sortable-list.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffTabs } from "./staff-tabs.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./course-editor.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

/** Ties the cover, which lives in the column next door, to the form that saves. */
const METADATA_FORM_ID = "course-metadata";

interface CourseEditorSectionProps {
  course: CourseAdminDetail;
  /** The catalog of what a course can teach; the course keeps at least one. */
  contentTypes: ContentTypeOption[];
  /** Who a course can be aimed at, the easiest first, from /administracion/niveles. */
  levels: LevelOption[];
  authors: AuthorAdminRow[];
  authorRoles: CatalogOption[];
  /** The kinds of resource a source can be, for «Procedencia del recurso». */
  sourceTypes: CatalogOption[];
  /** The entities a source can cite, from /administracion/entidades. */
  entities: SourceEntityOption[];
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
  contentTypes,
  levels,
  authors,
  authorRoles,
  sourceTypes,
  entities,
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

            {/* The card's action opens the dialog where authors are created and
                edited: the one missing from the select below is a press away. */}
            <StaffPanel
              title="Autores"
              meta={`${course.authors.length}`}
              action={
                <AuthorsManager authors={authors} returnTo={staffRoutes.courseDetail(course.id)} label="Gestionar" />
              }
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
                          <SubmitButton
                            className="course-editor__control course-editor__control_variant_danger"
                            pendingLabel="Quitando…"
                          >
                            Quitar
                          </SubmitButton>
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
                    <PlatformSelect
                      name="authorId"
                      required
                      placeholder="Elige un autor…"
                      options={availableAuthors.map((author) => ({ value: author.id, label: author.name }))}
                      size="compact"
                    />
                  </FormField>

                  <FormField label="Rol">
                    <PlatformSelect
                      name="roleCode"
                      defaultValue={authorRoles[0]?.code}
                      options={authorRoles.map((role) => ({ value: role.code, label: role.label }))}
                      size="compact"
                    />
                  </FormField>

                  <SubmitButton className="platform-button platform-button_variant_secondary" pendingLabel="Añadiendo…">
                    Añadir
                  </SubmitButton>
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
                    <SubmitButton disabled={!course.canPublish} pendingLabel="Publicando…">
                      Publicar
                    </SubmitButton>
                  </form>
                )}

                {course.statusCode !== COURSE_STATUS.ARCHIVED && (
                  <form action={archiveCourse.bind(null, course.id)}>
                    <SubmitButton
                      className="platform-button platform-button_variant_secondary"
                      pendingLabel="Archivando…"
                    >
                      Archivar curso
                    </SubmitButton>
                  </form>
                )}
              </div>
            </StaffPanel>
          </>
        }
      >
        <StaffPanel title="Metadatos">
          <form id={METADATA_FORM_ID} className="course-editor__form" action={updateCourse.bind(null, course.id)}>
            {/* The only piece of the form with state: the slug follows the name. */}
            <CourseNameFields name={course.name} slug={course.slug} />

            <FormField label="Descripción (opcional)">
              <textarea name="description" defaultValue={course.description ?? ""} maxLength={1000} />
            </FormField>

            {/* What the course teaches, as one-line cards in two columns, with
                the name alone: several at once, and the action refuses to save none. */}
            <FormFieldset legend="Contenido (selecciona al menos uno)" frame="none">
              <PlatformCheckCards
                name="contentTypeCodes"
                defaultValue={course.contentTypeCodes}
                aria-label="Tipos de contenido"
                layout="line"
                options={contentTypes.map((type) => ({
                  value: type.code,
                  label: type.label,
                }))}
              />
            </FormFieldset>

            {/* Who the course is aimed at, as one-line cards in order of
                difficulty, each with its name and its orientative Elo range
                beside it. Several at once, or none. A retired level is still offered,
                marked: the set is saved whole, and leaving it out would take
                it from the course. */}
            <FormFieldset legend="Niveles" frame="none">
              {levels.length > 0 ? (
                <PlatformCheckCards
                  name="levelSlugs"
                  defaultValue={course.levelSlugs}
                  aria-label="Niveles a los que va dirigido"
                  layout="line"
                  options={levels.map((level) => ({
                    value: level.slug,
                    // The range goes in parentheses, so a retired level says so
                    // with a comma: two pairs in a row would read as one aside.
                    label: level.isActive ? level.name : `${level.name}, retirado`,
                    meta: `(${shortEloRange(level.eloRange)})`,
                  }))}
                />
              ) : (
                <p className="course-editor__empty">
                  Todavía no hay niveles. Créalos en <Link href={staffRoutes.levels}>Niveles</Link>.
                </p>
              )}
            </FormFieldset>

            <div className="course-editor__submit">
              <SubmitButton>Guardar metadatos</SubmitButton>
            </div>
          </form>
        </StaffPanel>

        <StaffPanel title="Capítulos" meta={`${course.chapters.length} · ${lessonCount} lecciones`}>
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
            <SubmitButton className="platform-button platform-button_variant_secondary" pendingLabel="Añadiendo…">
              Añadir capítulo
            </SubmitButton>
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
                  <SubmitButton className="course-editor__role-button" pendingLabel="Añadiendo…">
                    Añadir introducción
                  </SubmitButton>
                </form>
              )}

              {!hasClosing && (
                <form action={createChapter.bind(null, course.id)}>
                  <input type="hidden" name="role" value={CONTENT_ROLE.CLOSING} />
                  <input type="hidden" name="name" value="Cierre" />
                  <SubmitButton className="course-editor__role-button" pendingLabel="Añadiendo…">
                    Añadir cierre
                  </SubmitButton>
                </form>
              )}
            </div>
          )}
        </StaffPanel>

        <CourseSources courseId={course.id} sources={course.sources} sourceTypes={sourceTypes} entities={entities} />
      </StaffEditorLayout>
    </div>
  );
}
