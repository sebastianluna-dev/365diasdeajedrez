import Link from "next/link";
import { FormField } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { CONTENT_ROLE, COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { staffRoutes } from "@/lib/platform-routes";
import {
  createLesson,
  deleteLesson,
  reorderLessons,
  updateChapter,
} from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail } from "@/services/staff-courses/staff-courses.types";
import { SortableList } from "./sortable-list.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffTabs } from "./staff-tabs.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./chapter-editor.section.css";

interface ChapterEditorSectionProps {
  chapter: ChapterAdminDetail;
  /** How many its collection has; the list lives in its own tab. */
  gameCount: number;
  errorCode?: string;
}

export function ChapterEditorSection({ chapter, gameCount, errorCode }: ChapterEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const isDraft = chapter.courseStatusCode === COURSE_STATUS.DRAFT;
  const withPgn = chapter.lessons.filter((lesson) => lesson.hasPgn).length;
  const hasIntro = chapter.lessons.some((lesson) => lesson.roleCode === CONTENT_ROLE.INTRO);
  const hasClosing = chapter.lessons.some((lesson) => lesson.roleCode === CONTENT_ROLE.CLOSING);
  const exercises = chapter.lessons.reduce((total, lesson) => total + lesson.exerciseCount, 0);

  return (
    <div className="chapter-editor">
      <StaffEditorHead
        crumbs={[
          { label: "Cursos", href: staffRoutes.courses },
          { label: chapter.courseName, href: staffRoutes.courseDetail(chapter.courseId) },
        ]}
        title={chapter.name}
        meta={
          <>
            <span>Capítulo {chapter.order}</span>
            <span>
              {chapter.lessons.length} lección{chapter.lessons.length === 1 ? "" : "es"}
            </span>
          </>
        }
      />

      <StaffTabs
        current={staffRoutes.chapterDetail(chapter.courseId, chapter.id)}
        tabs={[
          { label: "Capítulo", href: staffRoutes.chapterDetail(chapter.courseId, chapter.id) },
          {
            label: "Partidas",
            href: staffRoutes.chapterGames(chapter.courseId, chapter.id),
            count: gameCount,
          },
        ]}
      />

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffEditorLayout
        aside={
          <>
            <StaffPanel title="Resumen">
              <dl className="chapter-editor__facts">
                <div className="chapter-editor__fact">
                  <dt>Lecciones</dt>
                  <dd>{chapter.lessons.length}</dd>
                </div>
                <div className="chapter-editor__fact">
                  <dt>Con PGN</dt>
                  <dd>{withPgn}</dd>
                </div>
                <div className="chapter-editor__fact">
                  <dt>Ejercicios</dt>
                  <dd>{exercises}</dd>
                </div>
                <div className="chapter-editor__fact">
                  <dt>Duración</dt>
                  <dd>{chapter.estimatedDuration ? `${chapter.estimatedDuration} min` : "—"}</dd>
                </div>
              </dl>
            </StaffPanel>

            <StaffPanel title="Acciones">
              <Link
                href={staffRoutes.courseDetail(chapter.courseId)}
                className="platform-button platform-button_variant_secondary chapter-editor__wide"
              >
                Volver al curso
              </Link>
            </StaffPanel>
          </>
        }
      >
        <StaffPanel title="Metadatos del capítulo">
          <form
            className="chapter-editor__form"
            action={updateChapter.bind(null, chapter.courseId, chapter.id)}
          >
            <FormField label="Nombre">
              <input type="text" name="name" defaultValue={chapter.name} maxLength={160} required />
            </FormField>

            <FormField label="Descripción (opcional)">
              <textarea name="description" defaultValue={chapter.description ?? ""} maxLength={1000} />
            </FormField>

            <FormField label="Duración estimada (minutos, opcional)">
              <input type="number" name="estimatedDuration" min={0} defaultValue={chapter.estimatedDuration ?? ""} />
            </FormField>

            <div className="chapter-editor__submit">
              <button type="submit" className="platform-button">
                Guardar
              </button>
            </div>
          </form>
        </StaffPanel>

        <StaffPanel
          title="Lecciones"
          meta={`${chapter.lessons.length} · ${withPgn} con PGN`}
        >
          <SortableList
            items={chapter.lessons.map((lesson) => ({
              id: lesson.id,
              name: lesson.name,
              meta: `${lesson.hasPgn ? "Con PGN" : "Sin PGN"} · ${lesson.exerciseCount} ejercicio${
                lesson.exerciseCount === 1 ? "" : "s"
              }`,
              href: lesson.href,
              roleLabel: lesson.roleLabel,
              badge: lesson.isPriority ? "Prioritaria" : undefined,
              // Delete only where the server would allow it: draft course and no
              // progress from any student.
              canDelete: isDraft && lesson.progressCount === 0,
            }))}
            onReorder={reorderLessons.bind(null, chapter.courseId, chapter.id)}
            deleteAction={deleteLesson.bind(null, chapter.courseId, chapter.id)}
            deleteFieldName="lessonId"
            noun="lección"
            emptyLabel="Este capítulo todavía no tiene lecciones."
          />

          <form
            className="chapter-editor__inline"
            action={createLesson.bind(null, chapter.courseId, chapter.id)}
          >
            <input
              type="text"
              name="name"
              maxLength={160}
              required
              className="chapter-editor__inline-input"
              placeholder="Nombre de la lección"
              aria-label="Nombre de la lección"
            />
            <button type="submit" className="platform-button platform-button_variant_secondary">
              Añadir lección
            </button>
          </form>

          {/* Optional and at most one of each; the button goes away once it is created. */}
          {(!hasIntro || !hasClosing) && (
            <div className="chapter-editor__roles">
              {!hasIntro && (
                <form action={createLesson.bind(null, chapter.courseId, chapter.id)}>
                  <input type="hidden" name="role" value={CONTENT_ROLE.INTRO} />
                  <input type="hidden" name="name" value="Introducción" />
                  <button type="submit" className="chapter-editor__role-button">
                    Añadir introducción
                  </button>
                </form>
              )}

              {!hasClosing && (
                <form action={createLesson.bind(null, chapter.courseId, chapter.id)}>
                  <input type="hidden" name="role" value={CONTENT_ROLE.CLOSING} />
                  <input type="hidden" name="name" value="Cierre" />
                  <button type="submit" className="chapter-editor__role-button">
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
