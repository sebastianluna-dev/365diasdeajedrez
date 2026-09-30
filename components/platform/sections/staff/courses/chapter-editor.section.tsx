import Link from "next/link";
import { FormField } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { staffRoutes } from "@/lib/platform-routes";
import {
  createLesson,
  deleteLesson,
  reorderLessons,
  updateChapter,
} from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail } from "@/services/staff-courses/staff-courses.types";
import { SyllabusList } from "./syllabus-list/syllabus-list.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffTabs } from "./staff-tabs.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./chapter-editor.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

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
  const exercises = chapter.lessons.reduce((total, lesson) => total + lesson.exerciseCount, 0);

  return (
    <div className="chapter-editor">
      <StaffEditorHead
        title={chapter.name}
        meta={
          <>
            <span>Capítulo {chapter.order}</span>
            <span>
              {chapter.lessons.length} {chapter.lessons.length === 1 ? "lección" : "lecciones"}
            </span>
            {chapter.isPriority && <span className="platform-tag platform-tag_variant_accent">Prioridad</span>}
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
                className="platform-button chapter-editor__wide"
              >
                Volver al curso
              </Link>
            </StaffPanel>
          </>
        }
      >
        <StaffPanel title="Metadatos del capítulo">
          <form className="chapter-editor__form" action={updateChapter.bind(null, chapter.courseId, chapter.id)}>
            <FormField label="Nombre">
              <input type="text" name="name" defaultValue={chapter.name} maxLength={160} required />
            </FormField>

            <FormField label="Descripción (opcional)">
              <textarea name="description" defaultValue={chapter.description ?? ""} maxLength={1000} />
            </FormField>

            <FormField label="Duración estimada (minutos, opcional)">
              <input type="number" name="estimatedDuration" min={0} defaultValue={chapter.estimatedDuration ?? ""} />
            </FormField>

            <label className="chapter-editor__check">
              <input type="checkbox" name="isPriority" defaultChecked={chapter.isPriority} />
              <span>
                Capítulo de prioridad
                <span className="chapter-editor__check-hint">
                  Entra entero en el recorrido corto de quien estudia con poco tiempo: todas sus lecciones, estén
                  marcadas o no.
                </span>
              </span>
            </label>

            <div className="chapter-editor__submit">
              <SubmitButton className="platform-button">Guardar</SubmitButton>
            </div>
          </form>
        </StaffPanel>

        <StaffPanel title="Lecciones" meta={`${chapter.lessons.length} · ${withPgn} con PGN`}>
          {/* The same rail the course's chapters are drawn on: a chapter's
              lessons are the same thing one level down, so the panel of a
              chapter and the panel of a course read alike. The introduction,
              the closing and the field that adds one are the list's own. */}
          <SyllabusList
            noun="lección"
            items={chapter.lessons.map((lesson) => ({
              id: lesson.id,
              name: lesson.name,
              facts: `${lesson.hasPgn ? "Con PGN" : "Sin PGN"} · ${lesson.exerciseCount} ejercicio${
                lesson.exerciseCount === 1 ? "" : "s"
              }`,
              href: lesson.href,
              roleCode: lesson.roleCode,
              badge: lesson.isPriority ? "Prioridad" : undefined,
              // Delete only where the server would allow it: draft course and no
              // progress from any student.
              canDelete: isDraft && lesson.progressCount === 0,
            }))}
            onReorder={reorderLessons.bind(null, chapter.courseId, chapter.id)}
            createAction={createLesson.bind(null, chapter.courseId, chapter.id)}
            deleteAction={deleteLesson.bind(null, chapter.courseId, chapter.id)}
            deleteFieldName="lessonId"
            newPlaceholder="Nombre de la nueva lección…"
          />

        </StaffPanel>
      </StaffEditorLayout>
    </div>
  );
}
