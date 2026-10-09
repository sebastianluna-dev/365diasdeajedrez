import Link from "next/link";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { staffRoutes } from "@/lib/platform-routes";
import { updateChapter } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail } from "@/services/staff-courses/staff-courses.types";
import { StaffEditorLayout } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./chapter-editor.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformCheckbox } from "@/components/platform/shared/platform-checkbox/platform-checkbox.comp";

interface ChapterEditorSectionProps {
  chapter: ChapterAdminDetail;
  errorCode?: string;
}

export function ChapterEditorSection({ chapter, errorCode }: ChapterEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const withPgn = chapter.lessons.filter((lesson) => lesson.hasPgn).length;
  const exercises = chapter.lessons.reduce((total, lesson) => total + lesson.exerciseCount, 0);

  return (
    <div className="chapter-editor">
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

              {/* A figure that can no longer be typed has to say where it comes from. */}
              <p className="chapter-editor__note">
                La duración es la suma de los minutos de sus lecciones: se recalcula al guardar una.
              </p>
            </StaffPanel>

            <StaffPanel title="Acciones">
              <Link href={staffRoutes.courseDetail(chapter.courseId)} className="platform-button chapter-editor__wide">
                Volver al curso
              </Link>
            </StaffPanel>
          </>
        }
      >
        <StaffPanel title="Metadatos del capítulo">
          <PlatformForm action={updateChapter.bind(null, chapter.courseId, chapter.id)}>
            <PlatformFormField name="name" label="Nombre">
              <input type="text" defaultValue={chapter.name} maxLength={160} required />
            </PlatformFormField>

            <PlatformFormField name="description" label="Descripción">
              <textarea defaultValue={chapter.description ?? ""} maxLength={1000} />
            </PlatformFormField>

            <PlatformCheckbox
              name="isPriority"
              defaultChecked={chapter.isPriority}
              label="Capítulo de prioridad"
              hint="Entra entero en el recorrido corto de quien estudia con poco tiempo: todas sus lecciones, estén marcadas o no."
            />

            <div className="chapter-editor__submit">
              <SubmitButton className="platform-button">Guardar</SubmitButton>
            </div>
          </PlatformForm>
        </StaffPanel>
      </StaffEditorLayout>
    </div>
  );
}
