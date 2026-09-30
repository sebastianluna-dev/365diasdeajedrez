import Link from "next/link";
import { FormField, FormFieldset } from "@/components/platform/shared/form-field.comp";
import { ImageUpload } from "@/components/platform/shared/image-upload.comp";
import { PlatformInfoTip } from "@/components/platform/shared/platform-info-tip/platform-info-tip.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { IMAGE_LIMITS_TEXT } from "@/constants/platform/upload.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { platformRoutes, staffRoutes } from "@/lib/platform-routes";
import { updateCourse, updateCourseCover, updateCourseThumbnail } from "@/services/staff-courses/staff-courses.actions";
import type {
  AuthorAdminRow,
  CatalogOption,
  ContentTypeOption,
  CourseAdminDetail,
  LevelOption,
} from "@/services/staff-courses/staff-courses.types";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { shortEloRange } from "@/services/courses/level-rules";
import { CourseAuthors } from "./course-authors/course-authors.comp";
import { CourseNameFields } from "./course-name-fields.comp";
import { CourseSources } from "./course-sources/course-sources.comp";
import { CourseStatusMenu } from "./course-status/course-status-menu.comp";
import { CourseSyllabus } from "./course-syllabus/course-syllabus.comp";
import { StaffEditorHead, StaffEditorLayout } from "./staff-editor.comp";
import { StaffTabs } from "./staff-tabs.comp";
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
  /** The statuses a course can have, for the pill next to the title. */
  statuses: CatalogOption[];
  /** The kinds of resource a source can be, for «Procedencia del recurso». */
  sourceTypes: CatalogOption[];
  /** How many games the course has; the list lives in its own tab. */
  gameCount: number;
  errorCode?: string;
}

/**
 * Course editing in independent cards (metadata, chapters, authors, sources):
 * each has its own form and its own action, instead of a giant form where a
 * failure in one field throws away all the work.
 *
 * On the left what is written and ordered; on the right what is glanced at
 * — cover, authors and sources — which is touched once and looked at many times.
 * The status has no card of its own: the pill next to the title says it and
 * changes it.
 */
export function CourseEditorSection({
  course,
  contentTypes,
  levels,
  authors,
  authorRoles,
  statuses,
  sourceTypes,
  gameCount,
  errorCode,
}: CourseEditorSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;
  const isDraft = course.statusCode === COURSE_STATUS.DRAFT;

  return (
    <div className="course-editor">
      <StaffEditorHead
        title={course.name}
        badge={
          <CourseStatusMenu
            courseId={course.id}
            statusCode={course.statusCode}
            statuses={statuses}
            canPublish={course.canPublish}
          />
        }
        actions={
          course.statusCode === COURSE_STATUS.PUBLISHED && (
            <Link
              // The information page, by the slug: it is what a student sees
              // of the course before adding it, and it needs nothing added.
              href={platformRoutes.courseInfo(course.slug)}
              className="platform-button"
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
              <PlatformCheckCards
                name="levelSlugs"
                defaultValue={course.levelSlugs}
                aria-label="Niveles a los que va dirigido"
                layout="line"
                options={levels.map((level) => ({
                  value: level.slug,
                  label: level.name,
                  meta: `(${shortEloRange(level.eloRange)})`,
                }))}
              />
            </FormFieldset>

            <div className="course-editor__submit">
              <SubmitButton className="platform-button">Guardar metadatos</SubmitButton>
            </div>
          </form>
        </StaffPanel>

        <CourseSyllabus courseId={course.id} chapters={course.chapters} isDraft={isDraft} />
      </StaffEditorLayout>
    </div>
  );
}
