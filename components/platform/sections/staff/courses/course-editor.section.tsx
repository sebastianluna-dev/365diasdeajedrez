import { FormField, FormFieldset } from "@/components/platform/shared/form-field.comp";
import { ImageUpload } from "@/components/platform/shared/image-upload.comp";
import { PlatformInfoTip } from "@/components/platform/shared/platform-info-tip/platform-info-tip.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { IMAGE_LIMITS_TEXT } from "@/constants/platform/upload.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { updateCourse, updateCourseCover, updateCourseThumbnail } from "@/services/staff-courses/staff-courses.actions";
import type {
  AuthorAdminRow,
  CatalogOption,
  ContentTypeOption,
  CourseAdminDetail,
  LevelOption,
} from "@/services/staff-courses/staff-courses.types";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { CourseAuthors } from "./course-authors/course-authors.comp";
import { CourseLevelsField } from "./course-levels-field.comp";
import { CourseNameFields } from "./course-name-fields.comp";
import { CourseSources } from "./course-sources/course-sources.comp";
import { StaffEditorLayout } from "./staff-editor.comp";
import { StaffPanel } from "./staff-panel.comp";
import "./course-editor.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";

interface CourseEditorSectionProps {
  course: CourseAdminDetail;
  /** The catalog of what a course can teach; the course keeps at least one. */
  contentTypes: ContentTypeOption[];
  /** Who a course can be aimed at, the easiest first: the fixed catalog of levels. */
  levels: LevelOption[];
  authors: AuthorAdminRow[];
  authorRoles: CatalogOption[];
  /** The kinds of resource a source can be, for «Procedencia del recurso». */
  sourceTypes: CatalogOption[];
  errorCode?: string;
}

/**
 * Course editing in independent cards (metadata, authors, sources): each has
 * its own form and its own action, instead of a giant form where a failure in
 * one field throws away all the work.
 *
 * On the left what is written; on the right what is glanced at — cover,
 * authors and sources — which is touched once and looked at many times. The
 * status has no card of its own: the pill next to the title says it and
 * changes it. The chapters are not here but on «Temario», their own tab: in
 * this column the list read at half the width of the page.
 */
export function CourseEditorSection({
  course,
  contentTypes,
  levels,
  authors,
  authorRoles,
  sourceTypes,
  errorCode,
}: CourseEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="course-editor">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffEditorLayout
        aside={
          <>
            {/* What the cover admits goes in the header's "i": it is read once
                and under the box it was a line of small print for ever. */}
            <StaffPanel
              title="Imágenes"
              action={
                <PlatformInfoTip
                  label="Sobre las imágenes"
                  text={`${IMAGE_LIMITS_TEXT} Cada una se recorta a su proporción y se guarda al subirla.`}
                  side="bottom"
                />
              }
            >
              {/* Each image saves itself: uploading it stores it, and so does
                  taking it away. Neither is a field of the metadata form. */}
              <div className="course-editor__images">
                <ImageUpload
                  action={updateCourseCover.bind(null, course.id)}
                  defaultValue={course.cover ?? undefined}
                  label="Portada del curso"
                  aspectRatio="21:9"
                />

                {/* The square one: what «Mis cursos» shows of the course. Until
                    it is uploaded that row crops the cover square. */}
                <ImageUpload
                  action={updateCourseThumbnail.bind(null, course.id)}
                  defaultValue={course.thumbnail ?? undefined}
                  label="Imagen cuadrada"
                  aspectRatio="1:1"
                />
              </div>
            </StaffPanel>

            <CourseAuthors courseId={course.id} authors={course.authors} allAuthors={authors} roles={authorRoles} />

            {/* In the narrow column, with what is glanced at: it is recorded
                once and read many times. */}
            <CourseSources courseId={course.id} sources={course.sources} sourceTypes={sourceTypes} />
          </>
        }
      >
        <StaffPanel title="Metadatos">
          <form className="course-editor__form" action={updateCourse.bind(null, course.id)}>
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
                beside it. Several at once, or none. */}
            <FormFieldset legend="Niveles" frame="none">
              <CourseLevelsField levels={levels} defaultValue={course.levelSlugs} />
            </FormFieldset>

            <div className="course-editor__submit">
              <SubmitButton className="platform-button">Guardar metadatos</SubmitButton>
            </div>
          </form>
        </StaffPanel>
      </StaffEditorLayout>
    </div>
  );
}
