import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { createLesson, deleteLesson, reorderLessons } from "@/services/staff-courses/staff-courses.actions";
import type { ChapterAdminDetail, LessonAdminRow } from "@/services/staff-courses/staff-courses.types";
import { StaffPanel } from "./staff-panel.comp";
import { SyllabusList } from "./syllabus-list/syllabus-list.comp";

interface ChapterLessonsSectionProps {
  chapter: ChapterAdminDetail;
  /** What went wrong on the last attempt; the actions of the list come back here. */
  errorCode?: string;
}

/** Why a lesson cannot be deleted; undefined when it can. The server checks the same two things. */
function deleteHint(lesson: LessonAdminRow, isDraft: boolean): string | undefined {
  if (!isDraft) return "Sólo se elimina una lección mientras el curso está en borrador.";
  if (lesson.progressCount > 0) return "Hay alumnos con progreso en esta lección.";
  return undefined;
}

/** "Con PGN · 3 ejercicios · 12 min": what a lesson holds, and its minutes when it has them. */
function lessonFacts(lesson: LessonAdminRow): string {
  const parts = [
    lesson.hasPgn ? "Con PGN" : "Sin PGN",
    `${lesson.exerciseCount} ejercicio${lesson.exerciseCount === 1 ? "" : "s"}`,
  ];
  if (lesson.durationMin) parts.push(`${lesson.durationMin} min`);
  return parts.join(" · ");
}

/**
 * The chapter's lessons, on a page of their own and at the whole width — the
 * same move the course's «Temario» made, and for the same reason: the list is
 * rows, and rows want width.
 *
 * What is drawn is [`SyllabusList`](./syllabus-list/syllabus-list.comp.tsx),
 * the very list the course's chapters are drawn with, because a chapter's
 * lessons are the same thing one level down.
 */
export function ChapterLessonsSection({ chapter, errorCode }: ChapterLessonsSectionProps) {
  const isDraft = chapter.courseStatusCode === COURSE_STATUS.DRAFT;
  const withPgn = chapter.lessons.filter((lesson) => lesson.hasPgn).length;
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="chapter-lessons">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <StaffPanel title="Lecciones" meta={`${chapter.lessons.length} · ${withPgn} con PGN`}>
        <SyllabusList
          noun="lección"
          items={chapter.lessons.map((lesson) => ({
            id: lesson.id,
            name: lesson.name,
            facts: lessonFacts(lesson),
            href: lesson.href,
            roleCode: lesson.roleCode,
            badge: lesson.isPriority ? "Prioridad" : undefined,
            // Delete only where the server would allow it: draft course and no
            // progress from any student. Where it is refused, the menu says why.
            canDelete: isDraft && lesson.progressCount === 0,
            deleteHint: deleteHint(lesson, isDraft),
          }))}
          onReorder={reorderLessons.bind(null, chapter.courseId, chapter.id)}
          createAction={createLesson.bind(null, chapter.courseId, chapter.id)}
          deleteAction={deleteLesson.bind(null, chapter.courseId, chapter.id)}
          deleteFieldName="lessonId"
          newPlaceholder="Nombre de la nueva lección…"
        />
      </StaffPanel>
    </div>
  );
}
